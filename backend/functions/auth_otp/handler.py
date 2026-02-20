import json
import os
import uuid
import random
import time
from datetime import datetime, timezone, timedelta

import boto3
from boto3.dynamodb.conditions import Attr
from passlib.hash import bcrypt
from jose import jwt
from aws_xray_sdk.core import xray_recorder, patch_all

# Patch all supported libraries (boto3, requests, etc.) for X-Ray tracing
patch_all()

# ---------------------------------------------------------------------------
# Environment variables
# ---------------------------------------------------------------------------
USERS_TABLE = os.environ.get("DYNAMODB_TABLE_USERS", "reviewpulse-users")
LINKS_TABLE = os.environ.get("DYNAMODB_TABLE_LINKS", "reviewpulse-review-links")
SES_FROM_EMAIL = os.environ.get("SES_FROM_EMAIL", "tripathiparth2411@gmail.com")
JWT_SECRET = os.environ.get("JWT_SECRET", "reviewpulse-dev-secret-change-me")
REGION = os.environ.get("AWS_REGION_NAME", "ca-central-1")
API_URL = os.environ.get("API_URL", "")  # set after deploy if needed
ENVIRONMENT = os.environ.get("ENVIRONMENT", "dev")

dynamodb = boto3.resource("dynamodb", region_name=REGION)
ses_client = boto3.client("ses", region_name=REGION)
users_table = dynamodb.Table(USERS_TABLE)
links_table = dynamodb.Table(LINKS_TABLE)

CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type,Authorization",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Content-Type": "application/json",
}


def _response(status_code: int, body: dict) -> dict:
    return {
        "statusCode": status_code,
        "headers": CORS_HEADERS,
        "body": json.dumps(body),
    }


# ---------------------------------------------------------------------------
# Helper: find user by email (scan — fine for small user base)
# ---------------------------------------------------------------------------
def _find_user_by_email(email: str) -> dict | None:
    with xray_recorder.in_subsegment("dynamodb-scan-user-by-email") as seg:
        seg.put_annotation("table", USERS_TABLE)
        seg.put_annotation("operation", "scan")
        resp = users_table.scan(
            FilterExpression=Attr("email").eq(email),
            Limit=1,
        )
    items = resp.get("Items", [])
    return items[0] if items else None


# ---------------------------------------------------------------------------
# Helper: decode & verify JWT from Authorization header
# ---------------------------------------------------------------------------
def _verify_jwt(event: dict) -> dict | None:
    auth_header = (event.get("headers") or {}).get("Authorization", "")
    if not auth_header:
        # also try lowercase (API GW may normalise)
        auth_header = (event.get("headers") or {}).get("authorization", "")
    if not auth_header:
        return None
    token = auth_header.replace("Bearer ", "").strip()
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        return payload
    except Exception:
        return None


# ===========================================================================
# ROUTE 1 — POST /auth/login
# ===========================================================================
def _handle_login(body: dict) -> dict:
    email = body.get("email", "").strip().lower()
    password = body.get("password", "")

    if not email or not password:
        return _response(400, {"error": "email and password are required"})

    user = _find_user_by_email(email)
    if not user:
        return _response(401, {"error": "Invalid credentials"})

    # Verify password
    stored_hash = user.get("passwordHash", "")
    if not stored_hash or not bcrypt.verify(password, stored_hash):
        return _response(401, {"error": "Invalid credentials"})

    # Generate 6-digit OTP
    otp_code = str(random.randint(100000, 999999))
    otp_expiry = int(time.time()) + 600  # 10 minutes

    # Store OTP in user record
    with xray_recorder.in_subsegment("dynamodb-store-otp") as seg:
        seg.put_annotation("table", USERS_TABLE)
        seg.put_annotation("operation", "update_item")
        users_table.update_item(
            Key={"userId": user["userId"]},
            UpdateExpression="SET otpCode = :otp, otpExpiry = :exp",
            ExpressionAttributeValues={":otp": otp_code, ":exp": otp_expiry},
        )

    # Send OTP via SES
    with xray_recorder.in_subsegment("ses-send-otp-email") as seg:
        seg.put_annotation("service", "ses")
        seg.put_annotation("email_type", "otp")
        ses_client.send_email(
            Source=SES_FROM_EMAIL,
            Destination={"ToAddresses": [email]},
            Message={
                "Subject": {"Data": "Your ReviewPulse Login Code"},
                "Body": {
                    "Text": {
                        "Data": f"Your verification code is: {otp_code}. Valid for 10 minutes."
                    }
                },
            },
        )

    return _response(200, {
        "message": "OTP sent to your email",
        "userId": user["userId"],
    })


# ===========================================================================
# ROUTE 2 — POST /auth/verify
# ===========================================================================
def _handle_verify(body: dict) -> dict:
    user_id = body.get("userId", "").strip()
    otp_code = body.get("otpCode", "").strip()

    if not user_id or not otp_code:
        return _response(400, {"error": "userId and otpCode are required"})

    with xray_recorder.in_subsegment("dynamodb-get-user") as seg:
        seg.put_annotation("table", USERS_TABLE)
        seg.put_annotation("operation", "get_item")
        resp = users_table.get_item(Key={"userId": user_id})
    user = resp.get("Item")
    if not user:
        return _response(401, {"error": "Invalid credentials"})

    stored_otp = user.get("otpCode", "")
    otp_expiry = int(user.get("otpExpiry", 0))

    if stored_otp != otp_code:
        return _response(401, {"error": "Invalid OTP code"})

    if int(time.time()) > otp_expiry:
        return _response(401, {"error": "OTP has expired"})

    # Clear OTP fields
    with xray_recorder.in_subsegment("dynamodb-clear-otp") as seg:
        seg.put_annotation("table", USERS_TABLE)
        seg.put_annotation("operation", "update_item")
        users_table.update_item(
            Key={"userId": user_id},
            UpdateExpression="REMOVE otpCode, otpExpiry",
        )

    # Generate JWT (24-hour expiry)
    now = datetime.now(timezone.utc)
    payload = {
        "userId": user_id,
        "email": user.get("email", ""),
        "role": user.get("role", "viewer"),
        "brandId": user.get("brandId", ""),
        "exp": int((now + timedelta(hours=24)).timestamp()),
        "iat": int(now.timestamp()),
    }
    token = jwt.encode(payload, JWT_SECRET, algorithm="HS256")

    return _response(200, {
        "token": token,
        "role": user.get("role", "viewer"),
        "brandId": user.get("brandId", ""),
        "email": user.get("email", ""),
    })


# ===========================================================================
# ROUTE 3 — POST /auth/send-review-link
# ===========================================================================
def _handle_send_review_link(event: dict, body: dict) -> dict:
    # Verify JWT
    caller = _verify_jwt(event)
    if not caller:
        return _response(401, {"error": "Unauthorized — valid JWT required"})

    customer_email = body.get("customerEmail", "").strip()
    customer_phone = body.get("customerPhone", "").strip()
    customer_name = body.get("customerName", "").strip()
    order_id = body.get("orderId", "").strip()
    product_id = body.get("productId", "").strip()
    brand_id = body.get("brandId", "").strip()
    product_name = body.get("productName", "").strip()

    if not customer_email or not order_id or not product_id or not brand_id:
        return _response(400, {
            "error": "customerEmail, orderId, productId, and brandId are required"
        })

    # Generate unique link token
    link_token = str(uuid.uuid4())
    now_epoch = int(time.time())
    expires_at = now_epoch + (72 * 3600)  # 72 hours

    # Store in review-links table
    with xray_recorder.in_subsegment("dynamodb-put-review-link") as seg:
        seg.put_annotation("table", LINKS_TABLE)
        seg.put_annotation("operation", "put_item")
        links_table.put_item(Item={
            "linkToken": link_token,
            "orderId": order_id,
            "productId": product_id,
            "brandId": brand_id,
            "customerEmail": customer_email,
            "customerPhone": customer_phone,
            "customerName": customer_name,
            "used": False,
            "createdAt": datetime.now(timezone.utc).isoformat(),
            "expiresAt": expires_at,
        })

    # Build the review URL
    review_url = f"{API_URL}/review/{link_token}" if API_URL else f"/review/{link_token}"

    # Send email via SES
    email_body = (
        f"Hi {customer_name or 'Valued Customer'},\n\n"
        f"Thank you for your recent purchase of {product_name or 'our product'}!\n"
        f"We'd love to hear about your experience.\n\n"
        f"Please click the link below to leave a quick review:\n"
        f"{review_url}\n\n"
        f"This link will expire in 72 hours.\n\n"
        f"Thank you,\nThe ReviewPulse Team"
    )

    # Send email via SES
    with xray_recorder.in_subsegment("ses-send-review-link") as seg:
        seg.put_annotation("service", "ses")
        seg.put_annotation("email_type", "review_link")
        ses_client.send_email(
            Source=SES_FROM_EMAIL,
            Destination={"ToAddresses": [customer_email]},
            Message={
                "Subject": {"Data": f"Share your experience with {product_name or 'our product'}"},
                "Body": {"Text": {"Data": email_body}},
            },
        )

    return _response(200, {
        "message": "Review link sent",
        "token": link_token,
    })


# ===========================================================================
# Lambda entry point — routes by path
# ===========================================================================
def lambda_handler(event, context):
    with xray_recorder.in_subsegment("auth-otp-handler") as subsegment:
        subsegment.put_annotation("function", "auth-otp")
        subsegment.put_annotation("environment", ENVIRONMENT)
        try:
            http_method = event.get("httpMethod", "")
            path = event.get("path", "")
            subsegment.put_annotation("http_method", http_method)

            if http_method == "OPTIONS":
                return _response(200, {"message": "CORS preflight"})

            if http_method != "POST":
                return _response(405, {"error": f"Method {http_method} not allowed"})

            body = event.get("body", "{}")
            if isinstance(body, str):
                body = json.loads(body) if body else {}

            if path.endswith("/login"):
                subsegment.put_annotation("route", "POST /auth/login")
                return _handle_login(body)
            elif path.endswith("/verify"):
                subsegment.put_annotation("route", "POST /auth/verify")
                return _handle_verify(body)
            elif path.endswith("/send-review-link"):
                subsegment.put_annotation("route", "POST /auth/send-review-link")
                return _handle_send_review_link(event, body)
            else:
                return _response(404, {"error": f"Unknown auth route: {path}"})

        except json.JSONDecodeError:
            subsegment.add_exception(Exception("Invalid JSON"), stack=False)
            return _response(400, {"error": "Invalid JSON in request body"})
        except Exception as exc:
            subsegment.add_exception(exc, stack=True)
            print(f"[ERROR] {exc}")
            return _response(500, {"error": "Internal server error"})

