"""
ReviewPlus — DynamoDB Seed Script + SES Review Link Emails
Region: ca-central-1
Tables: reviewpulse-brands, reviewpulse-products, reviewpulse-users,
        reviewpulse-feedback, reviewpulse-review-links
"""

import json
import random
import uuid
from datetime import datetime, timezone, timedelta
from decimal import Decimal

import boto3
import bcrypt

# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------
REGION = "ca-central-1"
FRONTEND_URL = (
    "http://reviewpulse-frontend-f020c3de"
    ".s3-website.ca-central-1.amazonaws.com"
)
API_URL = "https://oj6pwu8j86.execute-api.ca-central-1.amazonaws.com/dev"
SES_FROM_EMAIL = "tripathiparth2411@gmail.com"

dynamodb = boto3.resource("dynamodb", region_name=REGION)
ses = boto3.client("ses", region_name=REGION)

brands_tbl = dynamodb.Table("reviewpulse-brands")
products_tbl = dynamodb.Table("reviewpulse-products")
users_tbl = dynamodb.Table("reviewpulse-users")
feedback_tbl = dynamodb.Table("reviewpulse-feedback")
links_tbl = dynamodb.Table("reviewpulse-review-links")

NOW = datetime.now(timezone.utc)
NOW_ISO = NOW.isoformat()

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def feb_date(day, hour=10, minute=0, second=0):
    """Return an ISO timestamp for a day in February 2025."""
    return datetime(2025, 2, day, hour, minute, second).isoformat()


def random_feb_ts():
    """Random ISO timestamp between Feb 1–21, 2025."""
    day = random.randint(1, 21)
    hour = random.randint(6, 23)
    minute = random.randint(0, 59)
    second = random.randint(0, 59)
    return feb_date(day, hour, minute, second)


# ---------------------------------------------------------------------------
# 1) Brands
# ---------------------------------------------------------------------------
BRANDS = [
    {"brandId": "brand-001", "brandName": "TechGear Pro",
     "adminEmail": "tripathiparth2411@gmail.com", "createdAt": "2025-01-15T09:00:00"},
    {"brandId": "brand-002", "brandName": "HomeEssentials",
     "adminEmail": "admin@homeessentials.com", "createdAt": "2025-01-16T10:00:00"},
    {"brandId": "brand-003", "brandName": "FitLife Sports",
     "adminEmail": "admin@fitlifesports.com", "createdAt": "2025-01-17T11:00:00"},
]

# ---------------------------------------------------------------------------
# 2) Products
# ---------------------------------------------------------------------------
PRODUCTS = [
    # TechGear Pro
    {"productId": "prod-001", "brandId": "brand-001",
     "productName": "Wireless Earbuds Pro X1", "createdAt": "2025-01-20T09:00:00"},
    {"productId": "prod-002", "brandId": "brand-001",
     "productName": "SmartWatch Ultra S3", "createdAt": "2025-01-20T09:10:00"},
    {"productId": "prod-003", "brandId": "brand-001",
     "productName": "USB-C Hub 7-in-1", "createdAt": "2025-01-20T09:20:00"},
    # HomeEssentials
    {"productId": "prod-004", "brandId": "brand-002",
     "productName": "Organic Cotton Towel Set", "createdAt": "2025-01-21T10:00:00"},
    {"productId": "prod-005", "brandId": "brand-002",
     "productName": "Bamboo Cutting Board", "createdAt": "2025-01-21T10:10:00"},
    # FitLife Sports
    {"productId": "prod-006", "brandId": "brand-003",
     "productName": "Resistance Bands Elite", "createdAt": "2025-01-22T11:00:00"},
    {"productId": "prod-007", "brandId": "brand-003",
     "productName": "Yoga Mat Premium 6mm", "createdAt": "2025-01-22T11:10:00"},
]

# ---------------------------------------------------------------------------
# 3) Users (admin for demo login)
# ---------------------------------------------------------------------------
ADMIN_PASSWORD = "Admin@123"
ADMIN_PASSWORD_HASH = bcrypt.hashpw(ADMIN_PASSWORD.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

USERS = [
    {
        "userId": "user-demo-admin",
        "email": "tripathiparth2411@gmail.com",
        "passwordHash": ADMIN_PASSWORD_HASH,
        "role": "admin",
        "brandId": "brand-001",
        "otpCode": "",
        "otpExpiry": "",
        "createdAt": NOW_ISO,
    },
]

# ---------------------------------------------------------------------------
# 4) Review links (2 real demo links)
# ---------------------------------------------------------------------------
EXPIRES_AT = int((NOW + timedelta(hours=72)).timestamp())

REVIEW_LINKS = [
    {
        "linkToken": "demo-link-parth-sitpune-001",
        "orderId": "ORD-2025-FEB-001",
        "productId": "prod-001",
        "brandId": "brand-001",
        "productName": "Wireless Earbuds Pro X1",
        "customerName": "Parth Tripathi",
        "customerEmail": "parth.tripathi.btech2022@sitpune.edu.in",
        "customerPhone": "+91-9999999999",
        "used": False,
        "createdAt": NOW_ISO,
        "expiresAt": EXPIRES_AT,
    },
    {
        "linkToken": "demo-link-parth-gmail-002",
        "orderId": "ORD-2025-FEB-002",
        "productId": "prod-001",
        "brandId": "brand-001",
        "productName": "Wireless Earbuds Pro X1",
        "customerName": "Parth Tripathi",
        "customerEmail": "parthtripathi2411@gmail.com",
        "customerPhone": "+91-9999999999",
        "used": False,
        "createdAt": NOW_ISO,
        "expiresAt": EXPIRES_AT,
    },
]

# ---------------------------------------------------------------------------
# 5) Feedback — 5 curated reviews for prod-001 + 75 random reviews
# ---------------------------------------------------------------------------

CURATED_REVIEWS = [
    {
        "FeedbackId": "fb-curated-001",
        "productId": "prod-001",
        "brandId": "brand-001",
        "orderId": "ORD-CUR-001",
        "name": "Rahul Sharma",
        "email": "rahul.sharma@gmail.com",
        "phone": "+91-9876543210",
        "rating": Decimal("5"),
        "message": (
            "Absolutely love these earbuds! The sound quality is crystal clear "
            "and the noise cancellation works perfectly even in noisy environments. "
            "Battery easily lasts 8 hours on a single charge. Best purchase I made "
            "this year!"
        ),
        "sentiment": "positive",
        "ai_confidence": "0.95",
        "topics": ["sound quality", "battery life", "noise cancellation"],
        "summary": "Exceptional earbuds with outstanding sound and battery performance.",
        "pros": ["crystal clear sound", "8-hour battery", "excellent noise cancellation"],
        "cons": [],
        "feature_requests": [],
        "ai_processed_at": feb_date(3, 15, 0, 0),
        "timestamp": feb_date(3, 14, 23, 11),
    },
    {
        "FeedbackId": "fb-curated-002",
        "productId": "prod-001",
        "brandId": "brand-001",
        "orderId": "ORD-CUR-002",
        "name": "Priya Mehta",
        "email": "priya.mehta@yahoo.com",
        "phone": "+91-9876543211",
        "rating": Decimal("4"),
        "message": (
            "Really good earbuds for the price. Sound is rich and balanced. "
            "The only minor issue is the case feels a bit plasticky but overall "
            "very satisfied with the purchase. Would recommend."
        ),
        "sentiment": "positive",
        "ai_confidence": "0.88",
        "topics": ["value for money", "sound quality", "build quality"],
        "summary": "Great value earbuds with rich sound, minor build quality concerns.",
        "pros": ["rich balanced sound", "good value for money"],
        "cons": ["plasticky case"],
        "feature_requests": [],
        "ai_processed_at": feb_date(7, 16, 0, 0),
        "timestamp": feb_date(7, 15, 45, 22),
    },
    {
        "FeedbackId": "fb-curated-003",
        "productId": "prod-001",
        "brandId": "brand-001",
        "orderId": "ORD-CUR-003",
        "name": "Amit Patel",
        "email": "amit.patel@hotmail.com",
        "phone": "+91-9876543212",
        "rating": Decimal("5"),
        "message": (
            "These earbuds are a game changer for my daily commute. The fit is "
            "perfect and they stay in even during workouts. Pairing with my phone "
            "is instant every single time. Truly impressed with TechGear Pro quality!"
        ),
        "sentiment": "positive",
        "ai_confidence": "0.93",
        "topics": ["comfort", "connectivity", "workout use"],
        "summary": "Perfect commute and workout companion with reliable connectivity.",
        "pros": ["perfect fit", "instant pairing", "stays in during workouts"],
        "cons": [],
        "feature_requests": [],
        "ai_processed_at": feb_date(11, 12, 0, 0),
        "timestamp": feb_date(11, 11, 32, 45),
    },
    {
        "FeedbackId": "fb-curated-004",
        "productId": "prod-001",
        "brandId": "brand-001",
        "orderId": "ORD-CUR-004",
        "name": "Sneha Joshi",
        "email": "sneha.joshi@gmail.com",
        "phone": "+91-9876543213",
        "rating": Decimal("3"),
        "message": (
            "Decent earbuds but I expected a bit more bass for the price point. "
            "The noise cancellation is okay but not great in very loud environments. "
            "Call quality is clear though. Neutral experience overall."
        ),
        "sentiment": "neutral",
        "ai_confidence": "0.82",
        "topics": ["bass", "noise cancellation", "call quality"],
        "summary": "Average performance with decent call quality but lacking in bass.",
        "pros": ["clear call quality"],
        "cons": ["lacking bass", "average noise cancellation"],
        "feature_requests": ["stronger bass mode"],
        "ai_processed_at": feb_date(15, 10, 0, 0),
        "timestamp": feb_date(15, 9, 18, 37),
    },
    {
        "FeedbackId": "fb-curated-005",
        "productId": "prod-001",
        "brandId": "brand-001",
        "orderId": "ORD-CUR-005",
        "name": "Vikram Singh",
        "email": "vikram.singh@gmail.com",
        "phone": "+91-9876543214",
        "rating": Decimal("5"),
        "message": (
            "Honestly the best earbuds I have owned under this price range. "
            "Touch controls are intuitive, sound stage is wide and immersive. "
            "Customer support from TechGear Pro was also very helpful when I had "
            "a setup question. 10 out of 10!"
        ),
        "sentiment": "positive",
        "ai_confidence": "0.96",
        "topics": ["touch controls", "sound quality", "customer support"],
        "summary": "Top rated earbuds with intuitive controls and excellent customer support.",
        "pros": ["intuitive touch controls", "wide sound stage", "great customer support"],
        "cons": [],
        "feature_requests": [],
        "ai_processed_at": feb_date(19, 17, 0, 0),
        "timestamp": feb_date(19, 16, 42, 58),
    },
]

# --- Random review templates for the remaining 75 reviews ---

FIRST_NAMES = [
    "Aarav", "Ananya", "Arjun", "Diya", "Ishaan", "Kavya", "Rohan",
    "Meera", "Vivaan", "Saanvi", "Aditya", "Riya", "Kabir", "Nisha",
    "Yash", "Pooja", "Dev", "Tanya", "Nikhil", "Simran", "Harsh",
    "Neha", "Akash", "Shreya", "Kunal", "Divya",
]
LAST_NAMES = [
    "Kumar", "Sharma", "Gupta", "Verma", "Reddy", "Iyer", "Nair",
    "Desai", "Chopra", "Malhotra", "Thakur", "Banerjee", "Das", "Jain",
    "Bhat", "Kapoor", "Saxena", "Mishra", "Pandey", "Agarwal",
]
EMAIL_DOMAINS = ["gmail.com", "yahoo.com", "hotmail.com", "outlook.com"]

POSITIVE_MSGS = [
    "Absolutely love this product! Exceeded my expectations in every way.",
    "Great quality for the price. Very happy with my purchase.",
    "Fast delivery and product works exactly as described. Highly recommend!",
    "This is my second purchase from this brand. Consistently excellent quality.",
    "Perfect gift for my family member. They absolutely loved it!",
    "The build quality is solid and it feels premium. Worth every penny.",
    "Amazing product! My friends are all asking where I bought it.",
    "Sleek design and works flawlessly. Could not be happier.",
    "Five stars well deserved. Will definitely buy from this brand again.",
    "Impressed with the packaging and product quality. Top notch!",
]
NEUTRAL_MSGS = [
    "Product is okay. Does what it says but nothing extraordinary.",
    "Decent product for the price range. Could be improved in some areas.",
    "Average experience. Works fine but expected a bit more polish.",
    "It is fine for daily use. Not amazing but gets the job done.",
    "Mixed feelings. Some features are great, others need improvement.",
]
NEGATIVE_MSGS = [
    "Disappointed with the quality. Does not match the product images.",
    "Product broke after two weeks of normal use. Very poor build quality.",
    "Not worth the price. Would not recommend to others.",
    "Delivery was late and product had minor defects. Expected better.",
    "Below average product. The competition offers much better alternatives.",
]

POSITIVE_TOPICS = [
    ["quality", "value"], ["design", "performance"], ["packaging", "delivery"],
    ["durability", "comfort"], ["ease of use", "features"],
]
NEUTRAL_TOPICS = [
    ["value", "performance"], ["design", "durability"], ["features", "price"],
]
NEGATIVE_TOPICS = [
    ["quality", "durability"], ["delivery", "packaging"], ["price", "build quality"],
]


def _gen_random_review(idx: int, product: dict) -> dict:
    """Generate a random review for a given product."""
    first = random.choice(FIRST_NAMES)
    last = random.choice(LAST_NAMES)
    name = f"{first} {last}"
    domain = random.choice(EMAIL_DOMAINS)
    email = f"{first.lower()}.{last.lower()}@{domain}"

    # Weighted: 55% positive, 25% neutral, 20% negative
    roll = random.random()
    if roll < 0.55:
        rating = random.choice([4, 5])
        message = random.choice(POSITIVE_MSGS)
        sentiment = "positive"
        topics = random.choice(POSITIVE_TOPICS)
        confidence = round(random.uniform(0.80, 0.98), 2)
    elif roll < 0.80:
        rating = 3
        message = random.choice(NEUTRAL_MSGS)
        sentiment = "neutral"
        topics = random.choice(NEUTRAL_TOPICS)
        confidence = round(random.uniform(0.65, 0.85), 2)
    else:
        rating = random.choice([1, 2])
        message = random.choice(NEGATIVE_MSGS)
        sentiment = "negative"
        topics = random.choice(NEGATIVE_TOPICS)
        confidence = round(random.uniform(0.70, 0.92), 2)

    ts = random_feb_ts()

    return {
        "FeedbackId": f"fb-seed-{idx:03d}",
        "productId": product["productId"],
        "brandId": product["brandId"],
        "orderId": f"ORD-SEED-{idx:03d}",
        "name": name,
        "email": email,
        "phone": f"+91-{random.randint(7000000000, 9999999999)}",
        "rating": Decimal(str(rating)),
        "message": message,
        "sentiment": sentiment,
        "ai_confidence": str(confidence),
        "topics": topics,
        "summary": message[:60] + "...",
        "pros": [topics[0]] if sentiment != "negative" else [],
        "cons": [topics[-1]] if sentiment != "positive" else [],
        "feature_requests": [],
        "ai_processed_at": ts,
        "timestamp": ts,
    }


def generate_random_reviews(count: int = 75) -> list:
    """Generate `count` random reviews spread across all 7 products."""
    reviews = []
    for i in range(count):
        product = PRODUCTS[i % len(PRODUCTS)]
        reviews.append(_gen_random_review(i + 1, product))
    return reviews


# ===========================================================================
# Seed functions
# ===========================================================================

def seed_brands():
    print("\n--- Seeding reviewpulse-brands ---")
    for b in BRANDS:
        brands_tbl.put_item(Item=b)
        print(f"  + {b['brandId']}: {b['brandName']}")
    print(f"  Total: {len(BRANDS)} brands")


def seed_products():
    print("\n--- Seeding reviewpulse-products ---")
    for p in PRODUCTS:
        products_tbl.put_item(Item=p)
        print(f"  + {p['productId']}: {p['productName']} ({p['brandId']})")
    print(f"  Total: {len(PRODUCTS)} products")


def seed_users():
    print("\n--- Seeding reviewpulse-users ---")
    for u in USERS:
        users_tbl.put_item(Item=u)
        print(f"  + {u['userId']}: {u['email']} (role={u['role']})")
    print(f"  Total: {len(USERS)} users")


def seed_review_links():
    print("\n--- Seeding reviewpulse-review-links ---")
    for link in REVIEW_LINKS:
        links_tbl.put_item(Item=link)
        print(f"  + {link['linkToken']} -> {link['customerEmail']}")
    print(f"  Total: {len(REVIEW_LINKS)} review links")
    print(f"  Expires at: {datetime.fromtimestamp(EXPIRES_AT, tz=timezone.utc).isoformat()}")


def seed_feedback():
    print("\n--- Seeding reviewpulse-feedback ---")

    # 5 curated reviews for prod-001
    print("  [Curated reviews for Wireless Earbuds Pro X1]")
    for r in CURATED_REVIEWS:
        feedback_tbl.put_item(Item=r)
        print(f"    + {r['FeedbackId']}: {r['name']} — {r['sentiment']} "
              f"({r['rating']}★) — {r['timestamp'][:10]}")

    # 75 random reviews spread across all products
    random_reviews = generate_random_reviews(75)
    print(f"  [Random reviews: {len(random_reviews)}]")
    for r in random_reviews:
        feedback_tbl.put_item(Item=r)

    total = len(CURATED_REVIEWS) + len(random_reviews)
    print(f"  Total: {total} feedback reviews seeded")
    print("  Date range: 2025-02-01 to 2025-02-21")


# ===========================================================================
# SES — Verify recipients + send review link emails
# ===========================================================================

RECIPIENT_EMAILS = [
    "parth.tripathi.btech2022@sitpune.edu.in",
    "parthtripathi2411@gmail.com",
]


def build_review_email_html(customer_name, product_name, token, order_id):
    link = f"{FRONTEND_URL}/#/review/{token}"
    return f"""\
<html>
<body style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:20px;">
  <div style="background:#6C63FF;padding:20px;border-radius:12px 12px 0 0;text-align:center;">
    <h1 style="color:#fff;margin:0;">ReviewPlus</h1>
    <p style="color:#e0e0e0;margin:4px 0 0;">by TechGear Pro</p>
  </div>
  <div style="padding:24px;border:1px solid #e0e0e0;border-top:none;border-radius:0 0 12px 12px;">
    <p>Hi <strong>{customer_name}</strong>,</p>
    <p>Thank you for your recent purchase of <strong>{product_name}</strong>!</p>
    <p>We would love to hear about your experience. Please click the link below
       to share your review <em>(valid for 72 hours)</em>:</p>
    <p style="text-align:center;margin:24px 0;">
      <a href="{link}"
         style="background:#6C63FF;color:#fff;padding:14px 32px;border-radius:8px;
                text-decoration:none;font-weight:bold;font-size:16px;">
        Write Your Review
      </a>
    </p>
    <p style="font-size:13px;color:#666;">Direct link: <a href="{link}">{link}</a></p>
    <p style="font-size:13px;color:#666;">Order ID: {order_id}</p>
    <hr style="border:none;border-top:1px solid #eee;margin:20px 0;">
    <p style="font-size:12px;color:#999;">
      Thank you,<br>
      <strong>TechGear Pro Team</strong> | Powered by ReviewPlus
    </p>
  </div>
</body>
</html>"""


def verify_and_send_emails():
    print("\n--- SES: Verify recipient emails ---")

    for email in RECIPIENT_EMAILS:
        ses.verify_email_identity(EmailAddress=email)
        print(f"  Verification email sent to: {email}")

    print()
    print("=" * 56)
    print("  Verification emails sent to both addresses.")
    print("  CHECK BOTH INBOXES and click the AWS verification")
    print("  link first!")
    print("=" * 56)
    print()
    input("  Press ENTER here to continue sending the review links...")
    print()

    # Send review link emails
    print("--- SES: Sending review link emails ---")
    for link in REVIEW_LINKS:
        html_body = build_review_email_html(
            customer_name=link["customerName"],
            product_name=link["productName"],
            token=link["linkToken"],
            order_id=link["orderId"],
        )

        try:
            ses.send_email(
                Source=SES_FROM_EMAIL,
                Destination={"ToAddresses": [link["customerEmail"]]},
                Message={
                    "Subject": {
                        "Data": f"Your Review Link — {link['productName']} | TechGear Pro",
                        "Charset": "UTF-8",
                    },
                    "Body": {
                        "Html": {
                            "Data": html_body,
                            "Charset": "UTF-8",
                        },
                    },
                },
            )
            print(f"  ✓ Review link email sent to {link['customerEmail']}")
        except Exception as exc:
            print(f"  ✗ FAILED to send to {link['customerEmail']}: {exc}")

    print("  Done sending emails.")


# ===========================================================================
# Main
# ===========================================================================

def main():
    print("=" * 56)
    print("  ReviewPlus — DynamoDB Seed + SES Email Demo Setup")
    print("=" * 56)

    seed_brands()
    seed_products()
    seed_users()
    seed_review_links()
    seed_feedback()
    verify_and_send_emails()

    print()
    print("=" * 56)
    print("  Demo Setup Complete!")
    print("=" * 56)
    print(f"  Admin login:")
    print(f"    Email:    tripathiparth2411@gmail.com")
    print(f"    Password: Admin@123")
    print(f"    (OTP will be sent to this Gmail on login)")
    print()
    print(f"  Review links sent to:")
    print(f"    1. parth.tripathi.btech2022@sitpune.edu.in")
    print(f"       Token: demo-link-parth-sitpune-001")
    print(f"    2. parthtripathi2411@gmail.com")
    print(f"       Token: demo-link-parth-gmail-002")
    print()
    print(f"  Frontend URL:")
    print(f"    {FRONTEND_URL}")
    print()
    print(f"  API URL:")
    print(f"    {API_URL}")
    print("=" * 56)


if __name__ == "__main__":
    main()
