import json
import os
import re
from collections import Counter
from decimal import Decimal

from boto3.dynamodb.conditions import Attr
import boto3
from jose import jwt
from aws_xray_sdk.core import xray_recorder, patch_all

# Patch all supported libraries (boto3, requests, etc.) for X-Ray tracing
patch_all()

# ---------------------------------------------------------------------------
# Environment
# ---------------------------------------------------------------------------
FEEDBACK_TABLE = os.environ.get("DYNAMODB_TABLE_FEEDBACK", "reviewpulse-feedback")
BRANDS_TABLE = os.environ.get("DYNAMODB_TABLE_BRANDS", "reviewpulse-brands")
PRODUCTS_TABLE = os.environ.get("DYNAMODB_TABLE_PRODUCTS", "reviewpulse-products")
LINKS_TABLE = os.environ.get("DYNAMODB_TABLE_LINKS", "reviewpulse-review-links")
JWT_SECRET = os.environ.get("JWT_SECRET", "reviewpulse-dev-secret-change-me")
REGION = os.environ.get("AWS_REGION_NAME", "ca-central-1")
ENVIRONMENT = os.environ.get("ENVIRONMENT", "dev")

dynamodb = boto3.resource("dynamodb", region_name=REGION)
feedback_tbl = dynamodb.Table(FEEDBACK_TABLE)
brands_tbl = dynamodb.Table(BRANDS_TABLE)
products_tbl = dynamodb.Table(PRODUCTS_TABLE)
links_tbl = dynamodb.Table(LINKS_TABLE)

CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type,Authorization",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Content-Type": "application/json",
}

MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
               "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

class _DecimalEncoder(json.JSONEncoder):
    """Handle Decimal values returned by DynamoDB."""
    def default(self, o):
        if isinstance(o, Decimal):
            return float(o) if o % 1 else int(o)
        return super().default(o)


def _response(status_code: int, body: dict) -> dict:
    return {
        "statusCode": status_code,
        "headers": CORS_HEADERS,
        "body": json.dumps(body, cls=_DecimalEncoder),
    }


def _verify_jwt(event: dict) -> dict | None:
    headers = event.get("headers") or {}
    auth = headers.get("Authorization", "") or headers.get("authorization", "")
    if not auth:
        return None
    token = auth.replace("Bearer ", "").strip()
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
    except Exception:
        return None


def _full_scan(table, filter_expr=None):
    """Paginated scan that returns ALL items."""
    kwargs = {}
    if filter_expr is not None:
        kwargs["FilterExpression"] = filter_expr
    items = []
    with xray_recorder.in_subsegment("dynamodb-full-scan") as seg:
        seg.put_annotation("table", table.table_name)
        seg.put_annotation("operation", "paginated_scan")
        while True:
            resp = table.scan(**kwargs)
            items.extend(resp.get("Items", []))
            last_key = resp.get("LastEvaluatedKey")
            if not last_key:
                break
            kwargs["ExclusiveStartKey"] = last_key
        seg.put_metadata("item_count", len(items))
    return items


def _safe_rating(item) -> float:
    try:
        return float(item.get("rating", 0))
    except (ValueError, TypeError):
        return 0.0


def _avg_rating(items) -> float:
    if not items:
        return 0.0
    total = sum(_safe_rating(i) for i in items)
    return round(total / len(items), 1)


def _sentiment_distribution(items) -> dict:
    dist = {"positive": 0, "neutral": 0, "negative": 0}
    for item in items:
        s = str(item.get("sentiment", "neutral")).lower()
        if s in dist:
            dist[s] += 1
        else:
            dist["neutral"] += 1
    return dist


def _sentiment_trend(items) -> list:
    """Group sentiment counts by month for the last 7 months."""
    from datetime import datetime, timezone, timedelta
    now = datetime.now(timezone.utc)
    buckets: dict[str, dict] = {}
    # initialise last 7 months
    for i in range(6, -1, -1):
        d = now - timedelta(days=30 * i)
        key = d.strftime("%Y-%m")
        label = MONTH_NAMES[d.month - 1]
        buckets[key] = {"month": label, "positive": 0, "negative": 0, "neutral": 0}

    for item in items:
        ts = item.get("timestamp", "")
        if not ts:
            continue
        month_key = ts[:7]  # "YYYY-MM"
        if month_key in buckets:
            s = str(item.get("sentiment", "neutral")).lower()
            if s not in ("positive", "negative", "neutral"):
                s = "neutral"
            buckets[month_key][s] += 1

    return list(buckets.values())


def _top_topics(items, n: int = 5) -> list:
    counter: Counter = Counter()
    for item in items:
        topics = item.get("topics", [])
        if isinstance(topics, str):
            try:
                topics = json.loads(topics)
            except Exception:
                topics = [t.strip() for t in topics.split(",") if t.strip()]
        if isinstance(topics, list):
            for t in topics:
                counter[str(t).strip()] += 1
    return [{"topic": t, "count": c} for t, c in counter.most_common(n)]


def _link_stats(brand_id: str, product_id: str | None = None) -> dict:
    filt = Attr("brandId").eq(brand_id)
    if product_id:
        filt = filt & Attr("productId").eq(product_id)
    links = _full_scan(links_tbl, filt)
    total_sent = len(links)
    total_used = sum(1 for l in links if l.get("used") is True)
    usage_rate = round((total_used / total_sent * 100), 1) if total_sent else 0.0
    return {"total_sent": total_sent, "total_used": total_used, "usage_rate": usage_rate}


# ===========================================================================
# ROUTE: GET /insights/{brandId}/{productId}
# ===========================================================================
def _handle_product_insights(brand_id: str, product_id: str) -> dict:
    reviews = _full_scan(
        feedback_tbl,
        Attr("brandId").eq(brand_id) & Attr("productId").eq(product_id),
    )

    if not reviews:
        return _response(404, {"error": "No reviews found for this product"})

    # Sort by timestamp descending for recent reviews
    reviews_sorted = sorted(reviews, key=lambda r: r.get("timestamp", ""), reverse=True)

    recent = []
    for r in reviews_sorted[:10]:
        recent.append({
            "FeedbackId": r.get("FeedbackId", ""),
            "customerName": r.get("customerName", r.get("name", "")),
            "rating": r.get("rating", 0),
            "reviewText": r.get("reviewText", r.get("message", "")),
            "sentiment": r.get("sentiment", "neutral"),
            "summary": r.get("summary", ""),
            "topics": r.get("topics", []),
            "timestamp": r.get("timestamp", ""),
        })

    return _response(200, {
        "total_reviews": len(reviews),
        "avg_rating": _avg_rating(reviews),
        "sentiment_distribution": _sentiment_distribution(reviews),
        "sentiment_trend": _sentiment_trend(reviews),
        "recent_reviews": recent,
        "top_topics": _top_topics(reviews, 5),
        "link_stats": _link_stats(brand_id, product_id),
    })


# ===========================================================================
# ROUTE: GET /insights/{brandId}
# ===========================================================================
def _handle_brand_insights(brand_id: str) -> dict:
    # Fetch brand name
    with xray_recorder.in_subsegment("dynamodb-get-brand") as seg:
        seg.put_annotation("table", BRANDS_TABLE)
        seg.put_annotation("operation", "get_item")
        brand_resp = brands_tbl.get_item(Key={"brandId": brand_id})
    brand = brand_resp.get("Item")
    brand_name = brand.get("brandName", brand_id) if brand else brand_id

    # All reviews for this brand
    reviews = _full_scan(feedback_tbl, Attr("brandId").eq(brand_id))
    if not reviews:
        return _response(404, {"error": "No reviews found for this brand"})

    # All products belonging to this brand
    products = _full_scan(products_tbl, Attr("brandId").eq(brand_id))
    product_map = {p["productId"]: p.get("productName", p["productId"]) for p in products}

    # Group reviews by productId
    by_product: dict[str, list] = {}
    for r in reviews:
        pid = r.get("productId", "unknown")
        by_product.setdefault(pid, []).append(r)

    product_summaries = []
    for pid, p_reviews in by_product.items():
        dist = _sentiment_distribution(p_reviews)
        total = len(p_reviews)
        pos_pct = round(dist["positive"] / total * 100, 1) if total else 0.0
        product_summaries.append({
            "productId": pid,
            "productName": product_map.get(pid, pid),
            "total_reviews": total,
            "avg_rating": _avg_rating(p_reviews),
            "sentiment_score": pos_pct,
        })

    product_summaries.sort(key=lambda x: x["total_reviews"], reverse=True)

    # Recent activity — last 5 reviews
    all_sorted = sorted(reviews, key=lambda r: r.get("timestamp", ""), reverse=True)
    recent_activity = []
    for r in all_sorted[:5]:
        recent_activity.append({
            "FeedbackId": r.get("FeedbackId", ""),
            "customerName": r.get("customerName", r.get("name", "")),
            "rating": r.get("rating", 0),
            "reviewText": r.get("reviewText", r.get("message", "")),
            "sentiment": r.get("sentiment", "neutral"),
            "productId": r.get("productId", ""),
            "timestamp": r.get("timestamp", ""),
        })

    return _response(200, {
        "brand_name": brand_name,
        "total_reviews": len(reviews),
        "avg_rating": _avg_rating(reviews),
        "products": product_summaries,
        "overall_sentiment_distribution": _sentiment_distribution(reviews),
        "recent_activity": recent_activity,
    })


# ===========================================================================
# ROUTE: GET /insights  (admin overview — all brands)
# ===========================================================================
def _handle_all_brands_insights() -> dict:
    brands = _full_scan(brands_tbl)
    reviews = _full_scan(feedback_tbl)

    brand_map = {b["brandId"]: b.get("brandName", b["brandId"]) for b in brands}

    by_brand: dict[str, list] = {}
    for r in reviews:
        bid = r.get("brandId", "unknown")
        by_brand.setdefault(bid, []).append(r)

    brand_summaries = []
    for bid, b_reviews in by_brand.items():
        dist = _sentiment_distribution(b_reviews)
        total = len(b_reviews)
        pos_pct = round(dist["positive"] / total * 100, 1) if total else 0.0
        brand_summaries.append({
            "brandId": bid,
            "brandName": brand_map.get(bid, bid),
            "total_reviews": total,
            "avg_rating": _avg_rating(b_reviews),
            "sentiment_score": pos_pct,
            "sentiment_distribution": dist,
        })

    brand_summaries.sort(key=lambda x: x["total_reviews"], reverse=True)

    return _response(200, {
        "total_brands": len(brands),
        "total_reviews_all_brands": len(reviews),
        "brands": brand_summaries,
    })


# ===========================================================================
# Lambda entry point
# ===========================================================================
def lambda_handler(event, context):
    with xray_recorder.in_subsegment("get-insights-handler") as subsegment:
        subsegment.put_annotation("function", "get-insights")
        subsegment.put_annotation("environment", ENVIRONMENT)
        try:
            http_method = event.get("httpMethod", "")
            path = event.get("path", "")
            path_params = event.get("pathParameters") or {}
            subsegment.put_annotation("http_method", http_method)

            # CORS preflight
            if http_method == "OPTIONS":
                return _response(200, {"message": "CORS preflight"})

            if http_method != "GET":
                return _response(405, {"error": f"Method {http_method} not allowed"})

            # ------- JWT verification (required for every route) -------
            caller = _verify_jwt(event)
            if not caller:
                return _response(401, {"error": "Unauthorized — valid JWT required"})
            subsegment.put_annotation("caller_email", caller.get("email", "unknown"))

            # ------- Route matching -------
            brand_id = path_params.get("brandId")
            product_id = path_params.get("productId")

            if brand_id and product_id:
                subsegment.put_annotation("route", "GET /insights/{brandId}/{productId}")
                return _handle_product_insights(brand_id, product_id)
            elif brand_id:
                subsegment.put_annotation("route", "GET /insights/{brandId}")
                return _handle_brand_insights(brand_id)
            else:
                subsegment.put_annotation("route", "GET /insights")
                return _handle_all_brands_insights()

        except json.JSONDecodeError:
            subsegment.add_exception(Exception("Invalid JSON"), stack=False)
            return _response(400, {"error": "Invalid JSON"})
        except Exception as exc:
            subsegment.add_exception(exc, stack=True)
            print(f"[ERROR] {exc}")
            return _response(500, {"error": "Internal server error"})
