import json
import os
import uuid
import time
from datetime import datetime, timezone

import boto3
from boto3.dynamodb.conditions import Key
from aws_xray_sdk.core import xray_recorder, patch_all

# Patch all supported libraries (boto3, requests, etc.) for X-Ray tracing
patch_all()

# ---------------------------------------------------------------------------
# Environment variables (set by Terraform)
# ---------------------------------------------------------------------------
LINKS_TABLE = os.environ.get("REVIEW_LINKS_TABLE", "reviewpulse-review-links")
FEEDBACK_TABLE = os.environ.get("DYNAMODB_TABLE_FEEDBACK", "reviewpulse-feedback")
PRODUCTS_TABLE = os.environ.get("DYNAMODB_TABLE_PRODUCTS", "reviewpulse-products")
REGION = os.environ.get("AWS_REGION_NAME", "ca-central-1")
ENVIRONMENT = os.environ.get("ENVIRONMENT", "dev")

dynamodb = boto3.resource("dynamodb", region_name=REGION)
links_table = dynamodb.Table(LINKS_TABLE)
feedback_table = dynamodb.Table(FEEDBACK_TABLE)
products_table = dynamodb.Table(PRODUCTS_TABLE)

# ---------------------------------------------------------------------------
# CORS headers applied to every response
# ---------------------------------------------------------------------------
CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Content-Type": "application/json",
}


def _response(status_code: int, body: dict) -> dict:
    """Return an API Gateway-compatible response with CORS headers."""
    return {
        "statusCode": status_code,
        "headers": CORS_HEADERS,
        "body": json.dumps(body),
    }


# ===========================================================================
# GET /review/{token}  —  return pre-filled form data
# ===========================================================================
def _handle_get_review(token: str) -> dict:
    # Look up the token
    with xray_recorder.in_subsegment("dynamodb-get-link-token") as seg:
        seg.put_annotation("table", LINKS_TABLE)
        seg.put_annotation("operation", "get_item")
        resp = links_table.get_item(Key={"linkToken": token})
    item = resp.get("Item")

    if not item:
        return _response(404, {"error": "Review link not found"})

    # Check if already used
    if item.get("used", False):
        return _response(410, {"error": "This review link has already been used"})

    # Check TTL expiry (expiresAt is epoch seconds)
    expires_at = item.get("expiresAt")
    if expires_at is not None and int(expires_at) < int(time.time()):
        return _response(404, {"error": "This review link has expired"})

    # Optionally fetch product name for display
    product_name = ""
    product_id = item.get("productId", "")
    brand_id = item.get("brandId", "")
    if product_id and brand_id:
        try:
            with xray_recorder.in_subsegment("dynamodb-get-product") as seg:
                seg.put_annotation("table", PRODUCTS_TABLE)
                seg.put_annotation("operation", "get_item")
                prod_resp = products_table.get_item(
                    Key={"productId": product_id, "brandId": brand_id}
                )
            prod_item = prod_resp.get("Item")
            if prod_item:
                product_name = prod_item.get("productName", "")
        except Exception:
            pass  # non-critical — form still works without product name

    return _response(200, {
        "orderId": item.get("orderId", ""),
        "productId": product_id,
        "brandId": brand_id,
        "customerName": item.get("customerName", ""),
        "customerEmail": item.get("customerEmail", ""),
        "customerPhone": item.get("customerPhone", ""),
        "productName": product_name,
    })


# ===========================================================================
# POST /review  —  submit customer review
# ===========================================================================
def _handle_post_review(body: dict) -> dict:
    # ---- Parse & validate input ----
    token = body.get("token", "").strip()
    rating = body.get("rating")
    review_text = body.get("reviewText", "").strip()
    customer_name = body.get("customerName", "").strip()
    customer_email = body.get("customerEmail", "").strip()
    customer_phone = body.get("customerPhone", "").strip()

    if not token:
        return _response(400, {"error": "token is required"})

    # Rating validation
    try:
        rating = int(rating)
    except (TypeError, ValueError):
        return _response(400, {"error": "rating must be an integer between 1 and 5"})
    if rating < 1 or rating > 5:
        return _response(400, {"error": "rating must be between 1 and 5"})

    # Review text validation
    if len(review_text) < 10 or len(review_text) > 500:
        return _response(400, {"error": "reviewText must be between 10 and 500 characters"})

    # ---- Look up the token ----
    with xray_recorder.in_subsegment("dynamodb-get-link-token") as seg:
        seg.put_annotation("table", LINKS_TABLE)
        seg.put_annotation("operation", "get_item")
        resp = links_table.get_item(Key={"linkToken": token})
    item = resp.get("Item")

    if not item:
        return _response(404, {"error": "Review link not found"})

    if item.get("used", False):
        return _response(410, {"error": "This review link has already been used"})

    expires_at = item.get("expiresAt")
    if expires_at is not None and int(expires_at) < int(time.time()):
        return _response(404, {"error": "This review link has expired"})

    # ---- Mark token as used ----
    with xray_recorder.in_subsegment("dynamodb-mark-token-used") as seg:
        seg.put_annotation("table", LINKS_TABLE)
        seg.put_annotation("operation", "update_item")
        links_table.update_item(
            Key={"linkToken": token},
            UpdateExpression="SET used = :t",
            ExpressionAttributeValues={":t": True},
        )

    # ---- Save feedback ----
    feedback_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()

    feedback_item = {
        "FeedbackId": feedback_id,
        "brandId": item.get("brandId", ""),
        "productId": item.get("productId", ""),
        "orderId": item.get("orderId", ""),
        "name": customer_name or item.get("customerName", ""),
        "email": customer_email or item.get("customerEmail", ""),
        "phone": customer_phone or item.get("customerPhone", ""),
        "message": review_text,
        "rating": rating,
        "sentiment": "pending",
        "topics": [],
        "summary": "",
        "timestamp": now,
    }

    with xray_recorder.in_subsegment("dynamodb-put-feedback") as seg:
        seg.put_annotation("table", FEEDBACK_TABLE)
        seg.put_annotation("operation", "put_item")
        seg.put_annotation("feedback_id", feedback_id)
        feedback_table.put_item(Item=feedback_item)

    return _response(201, {
        "message": "Review submitted successfully",
        "FeedbackId": feedback_id,
    })


# ===========================================================================
# Lambda entry point
# ===========================================================================
def lambda_handler(event, context):
    with xray_recorder.in_subsegment("submit-review-handler") as subsegment:
        subsegment.put_annotation("function", "submit-review")
        subsegment.put_annotation("environment", ENVIRONMENT)
        try:
            http_method = event.get("httpMethod", "")
            path_params = event.get("pathParameters") or {}
            subsegment.put_annotation("http_method", http_method)

            # OPTIONS preflight
            if http_method == "OPTIONS":
                return _response(200, {"message": "CORS preflight"})

            # GET /review/{token}
            if http_method == "GET":
                token = path_params.get("token", "")
                if not token:
                    return _response(400, {"error": "Missing token in path"})
                subsegment.put_annotation("route", "GET /review/{token}")
                return _handle_get_review(token)

            # POST /review
            if http_method == "POST":
                body = event.get("body", "{}")
                if isinstance(body, str):
                    body = json.loads(body)
                subsegment.put_annotation("route", "POST /review")
                return _handle_post_review(body)

            return _response(405, {"error": f"Method {http_method} not allowed"})

        except json.JSONDecodeError:
            subsegment.add_exception(Exception("Invalid JSON"), stack=False)
            return _response(400, {"error": "Invalid JSON in request body"})
        except Exception as exc:
            subsegment.add_exception(exc, stack=True)
            print(f"[ERROR] {exc}")
            return _response(500, {"error": "Internal server error"})

