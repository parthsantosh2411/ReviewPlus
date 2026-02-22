import json
import os
import re
from datetime import datetime, timezone

import boto3
from aws_xray_sdk.core import xray_recorder, patch_all

# Patch boto3 for X-Ray tracing
patch_all()

# ---------------------------------------------------------------------------
# Environment
# ---------------------------------------------------------------------------
FEEDBACK_TABLE = os.environ.get("DYNAMODB_TABLE_FEEDBACK", "reviewpulse-feedback")
PRODUCTS_TABLE = os.environ.get("DYNAMODB_TABLE_PRODUCTS", "reviewpulse-products")
BEDROCK_MODEL_ID = os.environ.get("BEDROCK_MODEL_ID", "anthropic.claude-3-haiku-20240307-v1:0")
REGION = os.environ.get("AWS_REGION_NAME", "ca-central-1")
ENVIRONMENT = os.environ.get("ENVIRONMENT", "dev")

dynamodb = boto3.resource("dynamodb", region_name=REGION)
feedback_tbl = dynamodb.Table(FEEDBACK_TABLE)
products_tbl = dynamodb.Table(PRODUCTS_TABLE)
bedrock = boto3.client("bedrock-runtime", region_name=REGION)


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _unmarshall_dynamodb(record: dict) -> dict:
    """Convert DynamoDB stream image (typed map) to plain dict."""
    from boto3.dynamodb.types import TypeDeserializer
    deser = TypeDeserializer()
    return {k: deser.deserialize(v) for k, v in record.items()}


def _build_prompt(review_text: str, rating) -> str:
    return f"""Analyze this product review and respond ONLY with valid JSON.

Review: "{review_text}"
Star Rating: {rating}/5

Respond with this exact JSON structure:
{{
  "sentiment": "positive" or "neutral" or "negative",
  "confidence": 0.0 to 1.0,
  "topics": ["topic1", "topic2", "topic3"],
  "summary": "One sentence summary of the review",
  "pros": ["pro1", "pro2"],
  "cons": ["con1", "con2"],
  "feature_requests": ["any feature requests mentioned or empty array"]
}}

Rules:
- sentiment: positive if rating 4-5, negative if 1-2, neutral if 3
- topics: extract 2-5 key themes (quality, delivery, packaging, etc.)
- summary: max 20 words, objective
- Respond ONLY with JSON, no other text"""


def _invoke_bedrock(prompt: str) -> dict:
    """Call Bedrock Claude (Messages API) and return parsed JSON response."""
    body = json.dumps({
        "anthropic_version": "bedrock-2023-05-31",
        "max_tokens": 500,
        "temperature": 0.1,
        "top_p": 0.9,
        "messages": [
            {"role": "user", "content": prompt}
        ],
    })

    # X-Ray subsegment around Bedrock invocation
    subsegment = xray_recorder.begin_subsegment("BedrockInvokeModel")
    try:
        subsegment.put_annotation("model_id", BEDROCK_MODEL_ID)
        subsegment.put_metadata("prompt_length", len(body))
        response = bedrock.invoke_model(
            modelId=BEDROCK_MODEL_ID,
            contentType="application/json",
            accept="application/json",
            body=body,
        )
        response_body = json.loads(response["body"].read())
        # Messages API returns content as a list of blocks
        completion = ""
        for block in response_body.get("content", []):
            if block.get("type") == "text":
                completion += block["text"]
        completion = completion.strip()

        # Log full prompt & response for audit
        print(f"[BEDROCK PROMPT]\n{prompt}")
        print(f"[BEDROCK RESPONSE]\n{completion}")

        subsegment.put_metadata("response_length", len(completion))
    except Exception as exc:
        subsegment.add_exception(exc, stack=True)
        raise
    finally:
        xray_recorder.end_subsegment()

    # Extract JSON from response (handle markdown fences or extra text)
    json_match = re.search(r"\{[\s\S]*\}", completion)
    if not json_match:
        raise ValueError(f"No JSON found in Bedrock response: {completion[:200]}")

    return json.loads(json_match.group())


def _update_feedback(feedback_id: str, ai_result: dict) -> None:
    """Write AI analysis fields back to the feedback record."""
    now_iso = datetime.now(timezone.utc).isoformat()

    with xray_recorder.in_subsegment("dynamodb-update-feedback") as seg:
        seg.put_annotation("table", FEEDBACK_TABLE)
        seg.put_annotation("operation", "update_item")
        seg.put_annotation("feedback_id", feedback_id)
        seg.put_annotation("sentiment", ai_result.get("sentiment", "neutral"))
        feedback_tbl.update_item(
            Key={"FeedbackId": feedback_id},
            UpdateExpression=(
                "SET sentiment = :sent, "
                "topics = :top, "
                "summary = :sum, "
                "pros = :pro, "
                "cons = :con, "
                "feature_requests = :fr, "
                "ai_confidence = :conf, "
                "ai_processed_at = :ts"
            ),
            ExpressionAttributeValues={
                ":sent": ai_result.get("sentiment", "neutral"),
                ":top": ai_result.get("topics", []),
                ":sum": ai_result.get("summary", ""),
                ":pro": ai_result.get("pros", []),
                ":con": ai_result.get("cons", []),
                ":fr": ai_result.get("feature_requests", []),
                ":conf": str(ai_result.get("confidence", 0)),
                ":ts": now_iso,
            },
        )


def _mark_unprocessed(feedback_id: str, error_msg: str) -> None:
    """Fallback: mark record so we know AI processing failed."""
    now_iso = datetime.now(timezone.utc).isoformat()
    with xray_recorder.in_subsegment("dynamodb-mark-unprocessed") as seg:
        seg.put_annotation("table", FEEDBACK_TABLE)
        seg.put_annotation("operation", "update_item")
        seg.put_annotation("feedback_id", feedback_id)
        seg.put_annotation("error_type", "ai_processing_failed")
        feedback_tbl.update_item(
            Key={"FeedbackId": feedback_id},
            UpdateExpression=(
                "SET sentiment = :sent, ai_processed_at = :ts, ai_error = :err"
            ),
            ExpressionAttributeValues={
                ":sent": "unprocessed",
                ":ts": now_iso,
                ":err": error_msg[:500],
            },
        )


# ---------------------------------------------------------------------------
# Product-level AI summary generation
# ---------------------------------------------------------------------------

def _full_scan(table, filter_expr=None):
    """Paginated scan that returns ALL items."""
    from boto3.dynamodb.conditions import Attr
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


def _build_product_summary_prompt(reviews: list, product_name: str) -> str:
    """Build a prompt that summarizes ALL reviews for a product."""
    review_texts = []
    for i, r in enumerate(reviews[:30], 1):  # Cap at 30 reviews for token limits
        text = r.get("message", r.get("reviewText", ""))
        rating = r.get("rating", "?")
        sentiment = r.get("sentiment", "unknown")
        review_texts.append(f"Review {i} (Rating: {rating}/5, Sentiment: {sentiment}): \"{text}\"")

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


def _generate_product_summary(product_id: str, brand_id: str) -> None:
    """Fetch all reviews for a product, generate AI summary, store in products table."""
    from boto3.dynamodb.conditions import Attr

    with xray_recorder.in_subsegment("generate-product-summary") as seg:
        seg.put_annotation("product_id", product_id)
        seg.put_annotation("brand_id", brand_id)

        try:
            # Fetch all processed reviews for this product
            reviews = _full_scan(
                feedback_tbl,
                Attr("productId").eq(product_id) & Attr("brandId").eq(brand_id)
            )

            # Only generate if we have at least 1 review with AI processing done
            processed_reviews = [
                r for r in reviews
                if r.get("sentiment") not in ("pending", "unprocessed", None)
            ]

            if not processed_reviews:
                print(f"[PRODUCT SUMMARY] No processed reviews for product={product_id}, skipping")
                return

            # Get product name
            try:
                prod_resp = products_tbl.get_item(
                    Key={"productId": product_id, "brandId": brand_id}
                )
                product_name = prod_resp.get("Item", {}).get("productName", product_id)
            except Exception:
                product_name = product_id

            prompt = _build_product_summary_prompt(processed_reviews, product_name)
            ai_result = _invoke_bedrock(prompt)

            now_iso = datetime.now(timezone.utc).isoformat()

            # Store summary in products table
            products_tbl.update_item(
                Key={"productId": product_id, "brandId": brand_id},
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
                    ":cnt": len(processed_reviews),
                },
            )

            print(f"[PRODUCT SUMMARY] Updated product={product_id} with AI summary "
                  f"({len(processed_reviews)} reviews)")

        except Exception as exc:
            print(f"[PRODUCT SUMMARY ERROR] product={product_id}: {exc}")
            seg.add_exception(exc, stack=True)


# ===========================================================================
# Lambda entry point — DynamoDB Streams trigger
# ===========================================================================
def lambda_handler(event, context):
    records = event.get("Records", [])
    processed = 0
    errors = 0

    with xray_recorder.in_subsegment("ai-processor-handler") as handler_seg:
        handler_seg.put_annotation("function", "ai-processor")
        handler_seg.put_annotation("environment", ENVIRONMENT)
        handler_seg.put_annotation("total_records", len(records))

        for record in records:
            event_name = record.get("eventName", "")

            # Only process INSERT events
            if event_name != "INSERT":
                print(f"[SKIP] eventName={event_name}, not INSERT")
                continue

            new_image = record.get("dynamodb", {}).get("NewImage", {})
            if not new_image:
                print("[SKIP] No NewImage in stream record")
                continue

            item = _unmarshall_dynamodb(new_image)
            feedback_id = item.get("FeedbackId", "")
            review_text = item.get("reviewText", item.get("message", ""))
            rating = item.get("rating", 3)

            if not feedback_id:
                print("[SKIP] Missing FeedbackId")
                continue

            if not review_text:
                print(f"[SKIP] FeedbackId={feedback_id} — empty review text")
                _mark_unprocessed(feedback_id, "Empty review text")
                errors += 1
                continue

            print(f"[PROCESS] FeedbackId={feedback_id}, rating={rating}, "
                  f"text_length={len(review_text)}")

            with xray_recorder.in_subsegment("process-single-review") as rec_seg:
                rec_seg.put_annotation("feedback_id", feedback_id)
                rec_seg.put_annotation("rating", int(rating))
                rec_seg.put_metadata("text_length", len(review_text))
                try:
                    prompt = _build_prompt(review_text, rating)
                    ai_result = _invoke_bedrock(prompt)

                    print(f"[AI RESULT] FeedbackId={feedback_id}: "
                          f"sentiment={ai_result.get('sentiment')}, "
                          f"topics={ai_result.get('topics')}")

                    _update_feedback(feedback_id, ai_result)
                    rec_seg.put_annotation("sentiment", ai_result.get("sentiment", "unknown"))
                    processed += 1

                    # After processing individual review, regenerate product-level AI summary
                    p_id = item.get("productId", "")
                    b_id = item.get("brandId", "")
                    if p_id and b_id:
                        _generate_product_summary(p_id, b_id)

                except Exception as exc:
                    error_msg = str(exc)
                    print(f"[ERROR] FeedbackId={feedback_id}: {error_msg}")
                    rec_seg.add_exception(exc, stack=True)
                    _mark_unprocessed(feedback_id, error_msg)
                    errors += 1

        handler_seg.put_metadata("processed", processed)
        handler_seg.put_metadata("errors", errors)
        handler_seg.put_metadata("skipped", len(records) - processed - errors)

    summary = {
        "total_records": len(records),
        "processed": processed,
        "errors": errors,
        "skipped": len(records) - processed - errors,
    }
    print(f"[DONE] {json.dumps(summary)}")
    return summary
