import json
import os
import uuid
import base64
import time
from datetime import datetime, timezone

import boto3
from aws_xray_sdk.core import xray_recorder, patch_all

# Patch all supported libraries (boto3, requests, etc.) for X-Ray tracing
patch_all()

# ---------------------------------------------------------------------------
# Environment variables
# ---------------------------------------------------------------------------
LINKS_TABLE = os.environ.get("DYNAMODB_TABLE_LINKS", "reviewpulse-review-links")
SES_FROM_EMAIL = os.environ.get("SES_FROM_EMAIL", "tripathiparth2411@gmail.com")
COGNITO_CLIENT_ID = os.environ.get("COGNITO_CLIENT_ID", "")
COGNITO_USER_POOL_ID = os.environ.get("COGNITO_USER_POOL_ID", "")
REGION = os.environ.get("AWS_REGION_NAME", "ca-central-1")
API_URL = os.environ.get("API_URL", "")  # set after deploy if needed
CLOUDFRONT_URL = os.environ.get("CLOUDFRONT_URL", "")  # frontend origin
ENVIRONMENT = os.environ.get("ENVIRONMENT", "dev")

dynamodb = boto3.resource("dynamodb", region_name=REGION)
ses_client = boto3.client("ses", region_name=REGION)
cognito = boto3.client("cognito-idp", region_name=REGION)
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
# Helper: verify Cognito AccessToken via get_user API
# ---------------------------------------------------------------------------
def _verify_cognito_token(access_token: str) -> dict | None:
    """Call Cognito get_user to verify an AccessToken. Returns user info or None."""
    with xray_recorder.in_subsegment("cognito-verify-token") as seg:
        seg.put_annotation("service", "cognito-idp")
        seg.put_annotation("operation", "get_user")
        try:
            response = cognito.get_user(AccessToken=access_token)
            return response
        except Exception:
            return None


def _extract_bearer_token(event: dict) -> str | None:
    """Extract Bearer token from Authorization header."""
    auth_header = (event.get("headers") or {}).get("Authorization", "")
    if not auth_header:
        auth_header = (event.get("headers") or {}).get("authorization", "")
    if not auth_header:
        return None
    return auth_header.replace("Bearer ", "").strip() or None


# ===========================================================================
# ROUTE 1 — POST /auth/login  (Cognito USER_PASSWORD_AUTH)
# ===========================================================================
def _handle_login(body: dict) -> dict:
    email = body.get("email", "").strip().lower()
    password = body.get("password", "")

    if not email or not password:
        return _response(400, {"error": "email and password are required"})

    with xray_recorder.in_subsegment("cognito-initiate-auth") as seg:
        seg.put_annotation("service", "cognito-idp")
        seg.put_annotation("operation", "initiate_auth")
        try:
            response = cognito.initiate_auth(
                AuthFlow="USER_PASSWORD_AUTH",
                AuthParameters={
                    "USERNAME": email,
                    "PASSWORD": password,
                },
                ClientId=COGNITO_CLIENT_ID,
            )
        except cognito.exceptions.NotAuthorizedException:
            return _response(401, {"error": "Invalid credentials"})
        except cognito.exceptions.UserNotFoundException:
            return _response(401, {"error": "Invalid credentials"})
        except cognito.exceptions.UserNotConfirmedException:
            return _response(403, {"error": "User email not confirmed"})
        except Exception as exc:
            print(f"[COGNITO ERROR] initiate_auth: {exc}")
            return _response(500, {"error": "Authentication service error"})

    # Check if MFA challenge is required
    challenge = response.get("ChallengeName")
    if challenge == "SMS_MFA":
        seg.put_annotation("mfa_required", True)
        return _response(200, {
            "message": "OTP sent to your registered phone",
            "challengeName": "SMS_MFA",
            "session": response["Session"],
            "email": email,
        })

    # No MFA — return tokens directly
    auth_result = response.get("AuthenticationResult", {})
    return _response(200, {
        "message": "Login successful",
        "accessToken": auth_result.get("AccessToken"),
        "idToken": auth_result.get("IdToken"),
        "refreshToken": auth_result.get("RefreshToken"),
    })


# ===========================================================================
# ROUTE 2 — POST /auth/verify  (Cognito SMS_MFA challenge response)
# ===========================================================================
def _handle_verify(body: dict) -> dict:
    session = body.get("session", "").strip()
    otp_code = body.get("otpCode", "").strip()
    email = body.get("email", "").strip().lower()

    if not session or not otp_code or not email:
        return _response(400, {"error": "session, otpCode, and email are required"})

    with xray_recorder.in_subsegment("cognito-respond-to-challenge") as seg:
        seg.put_annotation("service", "cognito-idp")
        seg.put_annotation("operation", "respond_to_auth_challenge")
        try:
            response = cognito.respond_to_auth_challenge(
                ClientId=COGNITO_CLIENT_ID,
                ChallengeName="SMS_MFA",
                Session=session,
                ChallengeResponses={
                    "USERNAME": email,
                    "SMS_MFA_CODE": otp_code,
                },
            )
        except cognito.exceptions.CodeMismatchException:
            return _response(401, {"error": "Invalid OTP code"})
        except cognito.exceptions.ExpiredCodeException:
            return _response(401, {"error": "OTP code expired. Please login again."})
        except Exception as exc:
            print(f"[COGNITO ERROR] respond_to_auth_challenge: {exc}")
            return _response(500, {"error": "Verification service error"})

    auth_result = response.get("AuthenticationResult", {})
    id_token = auth_result.get("IdToken", "")

    # Decode IdToken payload to extract custom attributes
    role = "viewer"
    brand_id = ""
    if id_token:
        try:
            payload_part = id_token.split(".")[1]
            payload_part += "=" * (4 - len(payload_part) % 4)
            decoded = json.loads(base64.b64decode(payload_part))
            role = decoded.get("custom:role", "viewer")
            brand_id = decoded.get("custom:brandId", "")
        except Exception:
            pass  # fallback to defaults

    return _response(200, {
        "message": "OTP verified successfully",
        "accessToken": auth_result.get("AccessToken"),
        "idToken": id_token,
        "refreshToken": auth_result.get("RefreshToken"),
        "role": role,
        "brandId": brand_id,
        "email": email,
    })


# ===========================================================================
# ROUTE 3 — POST /auth/send-review-link
# ===========================================================================
def _handle_send_review_link(event: dict, body: dict) -> dict:
    # Verify Cognito AccessToken
    access_token = _extract_bearer_token(event)
    if not access_token:
        return _response(401, {"error": "Unauthorized — Bearer token required"})

    caller = _verify_cognito_token(access_token)
    if not caller:
        return _response(401, {"error": "Unauthorized — invalid or expired token"})

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

    # Build the review URL (frontend page served by CloudFront)
    base_url = CLOUDFRONT_URL or API_URL
    review_url = f"{base_url}/review/{link_token}" if base_url else f"/review/{link_token}"

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

