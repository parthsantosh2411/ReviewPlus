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
BEDROCK_MODEL_ID = os.environ.get("BEDROCK_MODEL_ID", "anthropic.claude-v2")
REGION = os.environ.get("AWS_REGION_NAME", "ca-central-1")
ENVIRONMENT = os.environ.get("ENVIRONMENT", "dev")

dynamodb = boto3.resource("dynamodb", region_name=REGION)
feedback_tbl = dynamodb.Table(FEEDBACK_TABLE)
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
    """Call Bedrock Claude and return parsed JSON response."""
    body = json.dumps({
        "prompt": f"\n\nHuman: {prompt}\n\nAssistant:",
        "max_tokens_to_sample": 500,
        "temperature": 0.1,
        "top_p": 0.9,
        "stop_sequences": ["\n\nHuman:"],
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
        completion = response_body.get("completion", "").strip()

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
