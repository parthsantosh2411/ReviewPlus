"""
Seed AI product summaries for all existing products.
Replicates the _generate_product_summary logic from ai_processor/handler.py
but runs locally (no X-Ray dependency).
"""
import json
import re
from datetime import datetime, timezone

import boto3

REGION = "ca-central-1"
FEEDBACK_TABLE = "reviewpulse-feedback"
PRODUCTS_TABLE = "reviewpulse-products"
BEDROCK_MODEL_ID = "anthropic.claude-3-haiku-20240307-v1:0"

dynamodb = boto3.resource("dynamodb", region_name=REGION)
feedback_tbl = dynamodb.Table(FEEDBACK_TABLE)
products_tbl = dynamodb.Table(PRODUCTS_TABLE)
bedrock = boto3.client("bedrock-runtime", region_name=REGION)


def full_scan(table, filter_expr=None):
    kwargs = {}
    if filter_expr is not None:
        kwargs["FilterExpression"] = filter_expr
    items = []
    while True:
        resp = table.scan(**kwargs)
        items.extend(resp.get("Items", []))
        last_key = resp.get("LastEvaluatedKey")
        if not last_key:
            break
        kwargs["ExclusiveStartKey"] = last_key
    return items


def invoke_bedrock(prompt: str) -> dict:
    body = json.dumps({
        "anthropic_version": "bedrock-2023-05-31",
        "max_tokens": 500,
        "temperature": 0.1,
        "messages": [{"role": "user", "content": prompt}],
    })
    resp = bedrock.invoke_model(modelId=BEDROCK_MODEL_ID, body=body, contentType="application/json", accept="application/json")
    result = json.loads(resp["body"].read())
    raw = result.get("content", [{}])[0].get("text", "{}")
    m = re.search(r"\{.*\}", raw, re.DOTALL)
    if m:
        return json.loads(m.group())
    return json.loads(raw)


def build_prompt(reviews, product_name):
    review_texts = []
    for i, r in enumerate(reviews[:30], 1):
        text = r.get("message", r.get("reviewText", ""))
        rating = r.get("rating", "?")
        sentiment = r.get("sentiment", "unknown")
        review_texts.append(f'Review {i} (Rating: {rating}/5, Sentiment: {sentiment}): "{text}"')

    reviews_block = "\n".join(review_texts)
    total = len(reviews)
    avg_rating = round(sum(float(r.get("rating", 0)) for r in reviews) / total, 1) if total else 0

    return f"""You are a product analytics expert. Analyze ALL {total} customer reviews for the product "{product_name}" and provide a comprehensive summary.

Product: {product_name}
Total Reviews: {total}
Average Rating: {avg_rating}/5

Reviews:
{reviews_block}

Respond ONLY with valid JSON using this exact structure:
{{
  "overall_summary": "A 2-3 sentence summary of what customers overall think about this product",
  "key_strengths": ["strength1", "strength2", "strength3"],
  "key_weaknesses": ["weakness1", "weakness2"],
  "recommendations": ["actionable recommendation 1", "actionable recommendation 2", "actionable recommendation 3"],
  "customer_sentiment_overview": "One sentence describing the overall customer mood/satisfaction"
}}

Rules:
- overall_summary: objective, data-driven, 2-3 sentences max
- key_strengths: top 2-4 things customers love
- key_weaknesses: top 1-3 things customers dislike (empty array if none)
- recommendations: 2-4 actionable suggestions for the business to improve
- customer_sentiment_overview: one concise sentence
- Respond ONLY with JSON, no other text"""


def main():
    from boto3.dynamodb.conditions import Attr

    # Get all products
    products = full_scan(products_tbl)
    print(f"Found {len(products)} products\n")

    for prod in products:
        pid = prod["productId"]
        bid = prod["brandId"]
        pname = prod.get("productName", pid)
        print(f"--- Processing: {pname} ({pid} / {bid}) ---")

        # Fetch all processed reviews
        reviews = full_scan(
            feedback_tbl,
            Attr("productId").eq(pid) & Attr("brandId").eq(bid)
        )
        processed = [r for r in reviews if r.get("sentiment") not in ("pending", "unprocessed", None)]
        print(f"  Found {len(processed)} processed reviews")

        if not processed:
            print("  Skipping — no processed reviews")
            continue

        prompt = build_prompt(processed, pname)
        print("  Calling Bedrock...")
        try:
            ai_result = invoke_bedrock(prompt)
        except Exception as e:
            print(f"  ERROR from Bedrock: {e}")
            continue

        now_iso = datetime.now(timezone.utc).isoformat()

        products_tbl.update_item(
            Key={"productId": pid, "brandId": bid},
            UpdateExpression=(
                "SET ai_summary = :summary, "
                "ai_strengths = :strengths, "
                "ai_weaknesses = :weaknesses, "
                "ai_recommendations = :recs, "
                "ai_sentiment_overview = :overview, "
                "ai_summary_updated_at = :ts, "
                "ai_summary_review_count = :cnt"
            ),
            ExpressionAttributeValues={
                ":summary": ai_result.get("overall_summary", ""),
                ":strengths": ai_result.get("key_strengths", []),
                ":weaknesses": ai_result.get("key_weaknesses", []),
                ":recs": ai_result.get("recommendations", []),
                ":overview": ai_result.get("customer_sentiment_overview", ""),
                ":ts": now_iso,
                ":cnt": len(processed),
            },
        )
        print(f"  ✓ Updated with AI summary ({len(processed)} reviews)")
        print(f"    Summary: {ai_result.get('overall_summary', '')[:80]}...")
        print()

    print("Done!")


if __name__ == "__main__":
    main()
