"""
ReviewPlus Capstone — Complete Demo Data Seeder
Seeds brands, products, reviews, and Cognito users.
"""

import subprocess
import uuid
import boto3

REGION = "ca-central-1"

# ── Get Cognito IDs from Terraform outputs ───────────────────────────────────

user_pool_id = subprocess.run(
    ["terraform", "output", "-raw", "cognito_user_pool_id"],
    capture_output=True, text=True, cwd="terraform"
).stdout.strip()

client_id = subprocess.run(
    ["terraform", "output", "-raw", "cognito_client_id"],
    capture_output=True, text=True, cwd="terraform"
).stdout.strip()

print(f"User Pool ID: {user_pool_id}")
print(f"Client ID: {client_id}")

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# SECTION 1 — Seed 2 Brands in DynamoDB
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

dynamodb = boto3.resource("dynamodb", region_name=REGION)
brands_table = dynamodb.Table("reviewpulse-brands")

brands = [
    {
        "brandId": "brand-001",
        "brandName": "TechGear Pro",
        "adminEmail": "tripathiparth2411@gmail.com",
        "createdAt": "2025-01-15T10:00:00",
    },
    {
        "brandId": "brand-002",
        "brandName": "StyleHouse",
        "adminEmail": "parthtripathi2411@gmail.com",
        "createdAt": "2025-01-20T10:00:00",
    },
]

for brand in brands:
    brands_table.put_item(Item=brand)
    print(f"Seeded brand: {brand['brandName']}")

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# SECTION 2 — Seed 4 Products (2 per brand)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

products_table = dynamodb.Table("reviewpulse-products")

products = [
    {
        "productId": "prod-001",
        "brandId": "brand-001",
        "productName": "Wireless Earbuds Pro X1",
        "category": "Electronics",
        "createdAt": "2025-01-15T10:00:00",
    },
    {
        "productId": "prod-002",
        "brandId": "brand-001",
        "productName": "Smart Watch Series 5",
        "category": "Electronics",
        "createdAt": "2025-01-15T10:00:00",
    },
    {
        "productId": "prod-003",
        "brandId": "brand-002",
        "productName": "Classic Leather Jacket",
        "category": "Fashion",
        "createdAt": "2025-01-20T10:00:00",
    },
    {
        "productId": "prod-004",
        "brandId": "brand-002",
        "productName": "Premium Denim Jeans",
        "category": "Fashion",
        "createdAt": "2025-01-20T10:00:00",
    },
]

for product in products:
    products_table.put_item(Item=product)
    print(f"Seeded product: {product['productName']}")

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# SECTION 3 — Seed Reviews (17-20 Feb 2025)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

feedback_table = dynamodb.Table("reviewpulse-feedback")

reviews = [
    # ── PROD-001: Wireless Earbuds Pro X1 (TechGear Pro) ──────────────────
    {
        "FeedbackId": str(uuid.uuid4()),
        "brandId": "brand-001",
        "productId": "prod-001",
        "productName": "Wireless Earbuds Pro X1",
        "orderId": "ORD-2025-0201",
        "customerName": "Rahul Sharma",
        "customerEmail": "rahul.sharma@gmail.com",
        "rating": 5,
        "message": "Absolutely love these earbuds! Sound quality is crystal clear and noise cancellation works perfectly even in crowded metros. Battery lasts all day easily. Best purchase this year!",
        "sentiment": "positive",
        "topics": ["sound quality", "battery life", "noise cancellation"],
        "summary": "Exceptional earbuds with outstanding sound and all-day battery life.",
        "pros": ["Great sound", "Long battery", "Strong noise cancellation"],
        "cons": [],
        "feature_requests": [],
        "timestamp": "2025-02-17T09:15:00",
    },
    {
        "FeedbackId": str(uuid.uuid4()),
        "brandId": "brand-001",
        "productId": "prod-001",
        "productName": "Wireless Earbuds Pro X1",
        "orderId": "ORD-2025-0202",
        "customerName": "Priya Mehta",
        "customerEmail": "priya.mehta@yahoo.com",
        "rating": 4,
        "message": "Really good earbuds for the price. Sound is rich and balanced. The case feels slightly plasticky but overall very satisfied. Would definitely recommend to friends.",
        "sentiment": "positive",
        "topics": ["value for money", "sound quality", "build quality"],
        "summary": "Great value earbuds with rich sound, minor build concerns.",
        "pros": ["Rich sound", "Good price", "Comfortable fit"],
        "cons": ["Plasticky case"],
        "feature_requests": ["Better case material"],
        "timestamp": "2025-02-17T14:30:00",
    },
    {
        "FeedbackId": str(uuid.uuid4()),
        "brandId": "brand-001",
        "productId": "prod-001",
        "productName": "Wireless Earbuds Pro X1",
        "orderId": "ORD-2025-0203",
        "customerName": "Amit Patel",
        "customerEmail": "amit.patel@hotmail.com",
        "rating": 5,
        "message": "Game changer for my daily commute. Fit is perfect, stays in even during workouts. Pairing is instant every single time. Truly impressed with TechGear Pro quality!",
        "sentiment": "positive",
        "topics": ["comfort", "connectivity", "workout use"],
        "summary": "Perfect commute companion with reliable connectivity and comfort.",
        "pros": ["Perfect fit", "Instant pairing", "Great for workouts"],
        "cons": [],
        "feature_requests": [],
        "timestamp": "2025-02-18T10:00:00",
    },
    {
        "FeedbackId": str(uuid.uuid4()),
        "brandId": "brand-001",
        "productId": "prod-001",
        "productName": "Wireless Earbuds Pro X1",
        "orderId": "ORD-2025-0204",
        "customerName": "Sneha Joshi",
        "customerEmail": "sneha.joshi@gmail.com",
        "rating": 3,
        "message": "Decent earbuds but expected more bass for this price point. Noise cancellation is okay but not great in very loud environments. Call quality is clear though.",
        "sentiment": "neutral",
        "topics": ["bass", "noise cancellation", "call quality"],
        "summary": "Average performance with decent call quality but lacking bass.",
        "pros": ["Clear call quality", "Decent price"],
        "cons": ["Weak bass", "Average noise cancellation"],
        "feature_requests": ["Better bass", "Stronger noise cancellation"],
        "timestamp": "2025-02-18T16:45:00",
    },
    {
        "FeedbackId": str(uuid.uuid4()),
        "brandId": "brand-001",
        "productId": "prod-001",
        "productName": "Wireless Earbuds Pro X1",
        "orderId": "ORD-2025-0205",
        "customerName": "Vikram Singh",
        "customerEmail": "vikram.singh@gmail.com",
        "rating": 5,
        "message": "Best earbuds I have owned under this price range. Touch controls are intuitive, sound stage is wide and immersive. Customer support from TechGear Pro was also very helpful. 10 out of 10!",
        "sentiment": "positive",
        "topics": ["touch controls", "sound quality", "customer support"],
        "summary": "Top rated earbuds with excellent sound and outstanding support.",
        "pros": ["Intuitive controls", "Wide soundstage", "Great support"],
        "cons": [],
        "feature_requests": [],
        "timestamp": "2025-02-19T11:20:00",
    },
    {
        "FeedbackId": str(uuid.uuid4()),
        "brandId": "brand-001",
        "productId": "prod-001",
        "productName": "Wireless Earbuds Pro X1",
        "orderId": "ORD-2025-0206",
        "customerName": "Divya Nair",
        "customerEmail": "divya.nair@gmail.com",
        "rating": 4,
        "message": "Very impressed with the audio quality and connectivity. The earbuds connected instantly to my phone and laptop both. Would have given 5 stars but the charging cable is too short.",
        "sentiment": "positive",
        "topics": ["audio quality", "multi-device", "accessories"],
        "summary": "Impressive audio and connectivity with minor accessory concern.",
        "pros": ["Great audio", "Multi-device connect", "Stable connection"],
        "cons": ["Short charging cable"],
        "feature_requests": ["Longer charging cable"],
        "timestamp": "2025-02-19T15:00:00",
    },
    {
        "FeedbackId": str(uuid.uuid4()),
        "brandId": "brand-001",
        "productId": "prod-001",
        "productName": "Wireless Earbuds Pro X1",
        "orderId": "ORD-2025-0207",
        "customerName": "Karan Verma",
        "customerEmail": "karan.verma@outlook.com",
        "rating": 2,
        "message": "Disappointed with the product. One earbud stopped working within a week. The sound was good initially but quality degraded quickly. Expected better from TechGear Pro.",
        "sentiment": "negative",
        "topics": ["durability", "sound quality", "reliability"],
        "summary": "Poor durability with one earbud failing within a week of use.",
        "pros": ["Initial sound was good"],
        "cons": ["Poor durability", "Quality degraded", "One earbud failed"],
        "feature_requests": ["Better quality control"],
        "timestamp": "2025-02-20T09:30:00",
    },
    {
        "FeedbackId": str(uuid.uuid4()),
        "brandId": "brand-001",
        "productId": "prod-001",
        "productName": "Wireless Earbuds Pro X1",
        "orderId": "ORD-2025-0208",
        "customerName": "Ananya Roy",
        "customerEmail": "ananya.roy@gmail.com",
        "rating": 5,
        "message": "Phenomenal product! The active noise cancellation is so good I can focus completely during work from home. Battery indicator in the app is super useful. Highly recommend!",
        "sentiment": "positive",
        "topics": ["noise cancellation", "work from home", "app features"],
        "summary": "Phenomenal ANC perfect for work from home with useful app features.",
        "pros": ["Excellent ANC", "Battery indicator", "Work-friendly"],
        "cons": [],
        "feature_requests": [],
        "timestamp": "2025-02-20T14:10:00",
    },
    # ── PROD-002: Smart Watch Series 5 (TechGear Pro) ─────────────────────
    {
        "FeedbackId": str(uuid.uuid4()),
        "brandId": "brand-001",
        "productId": "prod-002",
        "productName": "Smart Watch Series 5",
        "orderId": "ORD-2025-0209",
        "customerName": "Rohan Gupta",
        "customerEmail": "rohan.gupta@gmail.com",
        "rating": 5,
        "message": "This smartwatch is absolutely brilliant. Health tracking is accurate, the display is bright and clear even in sunlight. Battery lasts 5 full days. Looks premium on the wrist!",
        "sentiment": "positive",
        "topics": ["health tracking", "display", "battery life"],
        "summary": "Brilliant smartwatch with accurate health tracking and 5-day battery.",
        "pros": ["Accurate tracking", "Bright display", "5-day battery"],
        "cons": [],
        "feature_requests": [],
        "timestamp": "2025-02-17T08:00:00",
    },
    {
        "FeedbackId": str(uuid.uuid4()),
        "brandId": "brand-001",
        "productId": "prod-002",
        "productName": "Smart Watch Series 5",
        "orderId": "ORD-2025-0210",
        "customerName": "Meera Krishnan",
        "customerEmail": "meera.k@gmail.com",
        "rating": 4,
        "message": "Great watch overall. Sleep tracking and step counter are spot on. The watch face customization options are fantastic. Only wish the strap was a bit softer but easy to replace.",
        "sentiment": "positive",
        "topics": ["sleep tracking", "customization", "strap comfort"],
        "summary": "Great smartwatch with excellent tracking and customization options.",
        "pros": ["Accurate sleep track", "Many watch faces", "Easy strap replace"],
        "cons": ["Strap slightly stiff"],
        "feature_requests": ["Softer default strap"],
        "timestamp": "2025-02-17T18:20:00",
    },
    {
        "FeedbackId": str(uuid.uuid4()),
        "brandId": "brand-001",
        "productId": "prod-002",
        "productName": "Smart Watch Series 5",
        "orderId": "ORD-2025-0211",
        "customerName": "Suresh Babu",
        "customerEmail": "suresh.b@hotmail.com",
        "rating": 3,
        "message": "Decent smartwatch for the price. GPS takes a long time to lock on which is frustrating during runs. Other features like heart rate and notifications work fine though.",
        "sentiment": "neutral",
        "topics": ["GPS", "heart rate", "notifications"],
        "summary": "Decent watch with slow GPS but good heart rate and notifications.",
        "pros": ["Good heart rate", "Reliable notifications"],
        "cons": ["Slow GPS lock"],
        "feature_requests": ["Faster GPS"],
        "timestamp": "2025-02-18T12:00:00",
    },
    {
        "FeedbackId": str(uuid.uuid4()),
        "brandId": "brand-001",
        "productId": "prod-002",
        "productName": "Smart Watch Series 5",
        "orderId": "ORD-2025-0212",
        "customerName": "Pooja Iyer",
        "customerEmail": "pooja.iyer@gmail.com",
        "rating": 5,
        "message": "I bought this for fitness tracking and it exceeds expectations. The SpO2 sensor and ECG feature give me peace of mind. Notifications sync perfectly with my Android phone.",
        "sentiment": "positive",
        "topics": ["fitness tracking", "health sensors", "Android sync"],
        "summary": "Exceeds expectations for fitness with accurate health sensors.",
        "pros": ["SpO2 sensor", "ECG feature", "Perfect Android sync"],
        "cons": [],
        "feature_requests": [],
        "timestamp": "2025-02-19T07:45:00",
    },
    {
        "FeedbackId": str(uuid.uuid4()),
        "brandId": "brand-001",
        "productId": "prod-002",
        "productName": "Smart Watch Series 5",
        "orderId": "ORD-2025-0213",
        "customerName": "Arjun Das",
        "customerEmail": "arjun.das@yahoo.com",
        "rating": 4,
        "message": "Really happy with this purchase. The watch looks stylish and works great. Water resistance tested in swimming pool and it held up perfectly. A must buy for fitness lovers.",
        "sentiment": "positive",
        "topics": ["design", "water resistance", "fitness"],
        "summary": "Stylish water-resistant smartwatch perfect for active fitness use.",
        "pros": ["Stylish design", "Water resistant", "Fitness ready"],
        "cons": [],
        "feature_requests": [],
        "timestamp": "2025-02-20T10:30:00",
    },
    {
        "FeedbackId": str(uuid.uuid4()),
        "brandId": "brand-001",
        "productId": "prod-002",
        "productName": "Smart Watch Series 5",
        "orderId": "ORD-2025-0214",
        "customerName": "Kavya Reddy",
        "customerEmail": "kavya.reddy@gmail.com",
        "rating": 2,
        "message": "Watch stopped syncing with my iPhone after 3 days. Support took 5 days to respond and the fix did not work. Battery also drains much faster than advertised. Not happy.",
        "sentiment": "negative",
        "topics": ["iPhone compatibility", "customer support", "battery drain"],
        "summary": "Poor iPhone sync and battery drain issues with slow support response.",
        "pros": [],
        "cons": ["iPhone sync broken", "Slow support", "Battery drains fast"],
        "feature_requests": ["Better iOS support", "Faster support response"],
        "timestamp": "2025-02-20T16:00:00",
    },
    # ── PROD-003: Classic Leather Jacket (StyleHouse) ──────────────────────
    {
        "FeedbackId": str(uuid.uuid4()),
        "brandId": "brand-002",
        "productId": "prod-003",
        "productName": "Classic Leather Jacket",
        "orderId": "ORD-2025-0301",
        "customerName": "Nisha Kapoor",
        "customerEmail": "nisha.kapoor@gmail.com",
        "rating": 5,
        "message": "This leather jacket is absolutely stunning. The quality of leather is top notch and it fits perfectly. Got so many compliments wearing it. StyleHouse never disappoints!",
        "sentiment": "positive",
        "topics": ["leather quality", "fit", "style"],
        "summary": "Stunning jacket with top-notch leather quality and perfect fit.",
        "pros": ["Premium leather", "Perfect fit", "Stylish look"],
        "cons": [],
        "feature_requests": [],
        "timestamp": "2025-02-17T11:00:00",
    },
    {
        "FeedbackId": str(uuid.uuid4()),
        "brandId": "brand-002",
        "productId": "prod-003",
        "productName": "Classic Leather Jacket",
        "orderId": "ORD-2025-0302",
        "customerName": "Raj Malhotra",
        "customerEmail": "raj.malhotra@outlook.com",
        "rating": 4,
        "message": "Very good quality jacket. The stitching is clean and the inner lining is comfortable. Delivery was quick too. Slightly heavy for summer but perfect for winters.",
        "sentiment": "positive",
        "topics": ["stitching quality", "lining", "delivery"],
        "summary": "Quality jacket with clean stitching, ideal for winter use.",
        "pros": ["Clean stitching", "Comfortable lining", "Fast delivery"],
        "cons": ["Heavy for summer"],
        "feature_requests": ["Lighter summer version"],
        "timestamp": "2025-02-17T15:30:00",
    },
    {
        "FeedbackId": str(uuid.uuid4()),
        "brandId": "brand-002",
        "productId": "prod-003",
        "productName": "Classic Leather Jacket",
        "orderId": "ORD-2025-0303",
        "customerName": "Simran Walia",
        "customerEmail": "simran.walia@gmail.com",
        "rating": 5,
        "message": "Ordered medium size and it fits like a glove. The leather has that authentic smell and feel. Pockets are spacious and zipper glides smoothly. Absolutely worth every rupee!",
        "sentiment": "positive",
        "topics": ["sizing", "authenticity", "pockets"],
        "summary": "Perfect sizing with authentic leather feel and spacious pockets.",
        "pros": ["True to size", "Authentic leather", "Good pockets"],
        "cons": [],
        "feature_requests": [],
        "timestamp": "2025-02-18T09:00:00",
    },
    {
        "FeedbackId": str(uuid.uuid4()),
        "brandId": "brand-002",
        "productId": "prod-003",
        "productName": "Classic Leather Jacket",
        "orderId": "ORD-2025-0304",
        "customerName": "Deepak Tiwari",
        "customerEmail": "deepak.t@gmail.com",
        "rating": 3,
        "message": "Jacket looks good but the color was slightly different from the website photo. Expected darker brown but received lighter shade. Quality is okay but description could be more accurate.",
        "sentiment": "neutral",
        "topics": ["color accuracy", "product description", "quality"],
        "summary": "Good quality jacket but color differs from website photos.",
        "pros": ["Decent quality", "Good design"],
        "cons": ["Color not as shown"],
        "feature_requests": ["Better product photos", "More accurate color description"],
        "timestamp": "2025-02-19T13:15:00",
    },
    {
        "FeedbackId": str(uuid.uuid4()),
        "brandId": "brand-002",
        "productId": "prod-003",
        "productName": "Classic Leather Jacket",
        "orderId": "ORD-2025-0305",
        "customerName": "Ishaan Batra",
        "customerEmail": "ishaan.batra@gmail.com",
        "rating": 5,
        "message": "Premium feel jacket at a reasonable price. The leather is thick and durable. Already worn it 10 times and it still looks brand new. Great investment from StyleHouse!",
        "sentiment": "positive",
        "topics": ["durability", "value", "premium feel"],
        "summary": "Durable premium jacket that maintains its look after repeated use.",
        "pros": ["Thick leather", "Durable", "Value for money"],
        "cons": [],
        "feature_requests": [],
        "timestamp": "2025-02-19T17:45:00",
    },
    {
        "FeedbackId": str(uuid.uuid4()),
        "brandId": "brand-002",
        "productId": "prod-003",
        "productName": "Classic Leather Jacket",
        "orderId": "ORD-2025-0306",
        "customerName": "Tanya Sharma",
        "customerEmail": "tanya.s@yahoo.com",
        "rating": 4,
        "message": "Love the jacket overall. Fits great and looks very stylish. The only issue is it took 7 days to deliver when 3-4 days was promised. Product itself is excellent though.",
        "sentiment": "positive",
        "topics": ["style", "delivery time", "fit"],
        "summary": "Excellent stylish jacket with slight delay in delivery.",
        "pros": ["Great style", "Good fit", "Quality material"],
        "cons": ["Delayed delivery"],
        "feature_requests": ["Faster shipping"],
        "timestamp": "2025-02-20T08:00:00",
    },
    {
        "FeedbackId": str(uuid.uuid4()),
        "brandId": "brand-002",
        "productId": "prod-003",
        "productName": "Classic Leather Jacket",
        "orderId": "ORD-2025-0307",
        "customerName": "Manish Agarwal",
        "customerEmail": "manish.a@gmail.com",
        "rating": 1,
        "message": "Very disappointed. The jacket received had a broken zipper and the leather had a chemical smell that did not go away even after airing for days. Raised a return request.",
        "sentiment": "negative",
        "topics": ["zipper quality", "smell", "return process"],
        "summary": "Defective product with broken zipper and strong chemical odor.",
        "pros": [],
        "cons": ["Broken zipper", "Chemical smell", "Poor QC"],
        "feature_requests": ["Better quality check before shipping"],
        "timestamp": "2025-02-20T12:30:00",
    },
    # ── PROD-004: Premium Denim Jeans (StyleHouse) ─────────────────────────
    {
        "FeedbackId": str(uuid.uuid4()),
        "brandId": "brand-002",
        "productId": "prod-004",
        "productName": "Premium Denim Jeans",
        "orderId": "ORD-2025-0401",
        "customerName": "Aisha Khan",
        "customerEmail": "aisha.khan@gmail.com",
        "rating": 5,
        "message": "These jeans are incredible! The denim quality is thick and premium. Fits perfectly and the stretch is just right \u2014 comfortable all day even sitting at a desk for hours.",
        "sentiment": "positive",
        "topics": ["denim quality", "fit", "comfort"],
        "summary": "Incredible premium jeans with perfect fit and all-day comfort.",
        "pros": ["Thick denim", "Perfect fit", "All-day comfort"],
        "cons": [],
        "feature_requests": [],
        "timestamp": "2025-02-17T10:00:00",
    },
    {
        "FeedbackId": str(uuid.uuid4()),
        "brandId": "brand-002",
        "productId": "prod-004",
        "productName": "Premium Denim Jeans",
        "orderId": "ORD-2025-0402",
        "customerName": "Siddharth Rao",
        "customerEmail": "sid.rao@gmail.com",
        "rating": 4,
        "message": "Very good quality jeans. Color is rich dark blue and has not faded after 3 washes. Stitching is sturdy. Slightly high waisted for my preference but the quality is undeniable.",
        "sentiment": "positive",
        "topics": ["color fastness", "stitching", "waist fit"],
        "summary": "High quality jeans with excellent color retention and stitching.",
        "pros": ["Color does not fade", "Sturdy stitching", "Rich color"],
        "cons": ["Slightly high waisted"],
        "feature_requests": ["More waist size options"],
        "timestamp": "2025-02-18T08:30:00",
    },
    {
        "FeedbackId": str(uuid.uuid4()),
        "brandId": "brand-002",
        "productId": "prod-004",
        "productName": "Premium Denim Jeans",
        "orderId": "ORD-2025-0403",
        "customerName": "Riya Bose",
        "customerEmail": "riya.bose@outlook.com",
        "rating": 5,
        "message": "StyleHouse has nailed it with these jeans! The cut is modern and flattering. Pair it with anything and you look put together. Already ordered a second pair in a different wash.",
        "sentiment": "positive",
        "topics": ["cut and style", "versatility", "repeat purchase"],
        "summary": "Modern flattering cut that pairs with everything, customer reordered.",
        "pros": ["Modern cut", "Very versatile", "Flattering"],
        "cons": [],
        "feature_requests": ["More color options"],
        "timestamp": "2025-02-18T19:00:00",
    },
    {
        "FeedbackId": str(uuid.uuid4()),
        "brandId": "brand-002",
        "productId": "prod-004",
        "productName": "Premium Denim Jeans",
        "orderId": "ORD-2025-0404",
        "customerName": "Nikhil Jain",
        "customerEmail": "nikhil.j@gmail.com",
        "rating": 3,
        "message": "Jeans are decent quality but sizing runs small. I ordered my usual size 32 but had to return for size 34. Exchange process was smooth though. Quality is good once size was right.",
        "sentiment": "neutral",
        "topics": ["sizing", "exchange process", "quality"],
        "summary": "Good quality jeans but sizing runs small, smooth exchange process.",
        "pros": ["Good quality", "Smooth exchange"],
        "cons": ["Sizing runs small"],
        "feature_requests": ["Size guide on product page"],
        "timestamp": "2025-02-19T14:00:00",
    },
    {
        "FeedbackId": str(uuid.uuid4()),
        "brandId": "brand-002",
        "productId": "prod-004",
        "productName": "Premium Denim Jeans",
        "orderId": "ORD-2025-0405",
        "customerName": "Anjali Mishra",
        "customerEmail": "anjali.m@gmail.com",
        "rating": 5,
        "message": "Best denim jeans I have purchased online. The premium tag is justified \u2014 weight of the fabric, quality of buttons and zippers, everything feels high end. Will be a loyal StyleHouse customer!",
        "sentiment": "positive",
        "topics": ["premium quality", "hardware quality", "brand loyalty"],
        "summary": "Fully justifies premium tag with excellent fabric and hardware quality.",
        "pros": ["Premium fabric weight", "Quality hardware", "High-end feel"],
        "cons": [],
        "feature_requests": [],
        "timestamp": "2025-02-19T20:00:00",
    },
    {
        "FeedbackId": str(uuid.uuid4()),
        "brandId": "brand-002",
        "productId": "prod-004",
        "productName": "Premium Denim Jeans",
        "orderId": "ORD-2025-0406",
        "customerName": "Farhan Sheikh",
        "customerEmail": "farhan.s@gmail.com",
        "rating": 4,
        "message": "Good jeans with great finishing. Pocket depth is very practical unlike most fashion jeans. The only minor complaint is it took a few wears to break in and feel comfortable.",
        "sentiment": "positive",
        "topics": ["finishing", "pockets", "break-in period"],
        "summary": "Well finished practical jeans with deep pockets and short break-in.",
        "pros": ["Great finishing", "Deep pockets", "Practical design"],
        "cons": ["Needs break-in period"],
        "feature_requests": [],
        "timestamp": "2025-02-20T11:00:00",
    },
    {
        "FeedbackId": str(uuid.uuid4()),
        "brandId": "brand-002",
        "productId": "prod-004",
        "productName": "Premium Denim Jeans",
        "orderId": "ORD-2025-0407",
        "customerName": "Shreya Pillai",
        "customerEmail": "shreya.p@yahoo.com",
        "rating": 2,
        "message": "Disappointed with this purchase. The denim started fraying near the pocket after just 2 washes. For the premium price I expected much better durability. Raising a complaint.",
        "sentiment": "negative",
        "topics": ["durability", "fraying", "quality control"],
        "summary": "Denim frayed near pocket after only 2 washes, poor for premium price.",
        "pros": ["Good initial look"],
        "cons": ["Fraying after 2 washes", "Poor durability", "Overpriced"],
        "feature_requests": ["Better quality control", "Reinforced pocket stitching"],
        "timestamp": "2025-02-20T17:30:00",
    },
]

for review in reviews:
    feedback_table.put_item(Item=review)
    print(
        f"Seeded review: {review['customerName']} \u2192 {review['productName']} "
        f"({review['rating']}\u2b50) [{review['timestamp'][:10]}]"
    )

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# SECTION 4 — Create 2 Cognito Users
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

cognito = boto3.client("cognito-idp", region_name=REGION)

users_to_create = [
    {
        "email": "tripathiparth2411@gmail.com",
        "password": "Admin@123!",
        "role": "admin",
        "brandId": "brand-001",
        "brandName": "TechGear Pro",
        "phone": "+918237407325",
    },
    {
        "email": "parthtripathi2411@gmail.com",
        "password": "Admin@123!",
        "role": "admin",
        "brandId": "brand-002",
        "brandName": "StyleHouse",
        "phone": "+918237407325",
    },
]

for user in users_to_create:
    try:
        cognito.admin_create_user(
            UserPoolId=user_pool_id,
            Username=user["email"],
            UserAttributes=[
                {"Name": "email", "Value": user["email"]},
                {"Name": "email_verified", "Value": "true"},
                {"Name": "phone_number", "Value": user["phone"]},
                {"Name": "phone_number_verified", "Value": "true"},
                {"Name": "custom:role", "Value": user["role"]},
                {"Name": "custom:brandId", "Value": user["brandId"]},
            ],
            TemporaryPassword="TempPass@123",
            MessageAction="SUPPRESS",
        )
        print(f"Created Cognito user: {user['email']}")
    except cognito.exceptions.UsernameExistsException:
        print(f"User already exists, updating: {user['email']}")
        cognito.admin_update_user_attributes(
            UserPoolId=user_pool_id,
            Username=user["email"],
            UserAttributes=[
                {"Name": "phone_number", "Value": user["phone"]},
                {"Name": "phone_number_verified", "Value": "true"},
                {"Name": "custom:role", "Value": user["role"]},
                {"Name": "custom:brandId", "Value": user["brandId"]},
            ],
        )

    cognito.admin_set_user_password(
        UserPoolId=user_pool_id,
        Username=user["email"],
        Password=user["password"],
        Permanent=True,
    )

    cognito.admin_add_user_to_group(
        UserPoolId=user_pool_id,
        Username=user["email"],
        GroupName="admin",
    )

    cognito.admin_set_user_mfa_preference(
        UserPoolId=user_pool_id,
        Username=user["email"],
        EmailMfaSettings={"Enabled": True, "PreferredMfa": True},
        SMSMfaSettings={"Enabled": False, "PreferredMfa": False},
    )
    print(f"Password set + Email MFA enabled for: {user['email']}")

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# SECTION 5 — Final Summary
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

print("")
print("=" * 60)
print("  ReviewPlus Demo Data Setup Complete!")
print("=" * 60)
print("")
print("  COMPANIES & PRODUCTS:")
print("  \u250c\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u252c\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2510")
print("  \u2502 TechGear Pro    \u2502 Wireless Earbuds Pro X1        \u2502")
print("  \u2502   brand-001     \u2502 Smart Watch Series 5           \u2502")
print("  \u251c\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u253c\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2524")
print("  \u2502 StyleHouse      \u2502 Classic Leather Jacket         \u2502")
print("  \u2502   brand-002     \u2502 Premium Denim Jeans            \u2502")
print("  \u2514\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2534\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2518")
print("")
print("  ADMIN LOGINS:")
print("  \u250c\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u252c\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u252c\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2510")
print("  \u2502 Email                               \u2502 Password   \u2502 Company       \u2502")
print("  \u251c\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u253c\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u253c\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2524")
print("  \u2502 tripathiparth2411@gmail.com         \u2502 Admin@123! \u2502 TechGear Pro  \u2502")
print("  \u2502 parthtripathi2411@gmail.com         \u2502 Admin@123! \u2502 StyleHouse    \u2502")
print("  \u2514\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2534\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2534\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2518")
print("")
print("  OTP SMS sent to: +918237407325 (both accounts)")
print("")
print("  REVIEWS SEEDED:")
print("  Wireless Earbuds Pro X1  \u2192 8 reviews (17-20 Feb)")
print("  Smart Watch Series 5     \u2192 6 reviews (17-20 Feb)")
print("  Classic Leather Jacket   \u2192 7 reviews (17-20 Feb)")
print("  Premium Denim Jeans      \u2192 7 reviews (17-20 Feb)")
print("  Total                    \u2192 28 reviews")
print("")
print("  DATE RANGE: 17 Feb 2025 \u2014 20 Feb 2025")
print("=" * 60)
