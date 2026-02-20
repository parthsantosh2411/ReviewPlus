# =============================================================================
# TABLE 1: reviewpulse-feedback
# Attributes: FeedbackId, brandId, productId, orderId, name, email, phone,
#             message, rating, sentiment, topics, summary, timestamp
# =============================================================================
resource "aws_dynamodb_table" "feedback" {
  name         = "${var.project_name}-feedback"
  billing_mode = "PAY_PER_REQUEST"

  hash_key = "FeedbackId"

  attribute {
    name = "FeedbackId"
    type = "S"
  }

  stream_enabled   = true
  stream_view_type = "NEW_AND_OLD_IMAGES"

  ttl {
    attribute_name = "expiresAt"
    enabled        = true
  }

  tags = {
    Project     = var.project_name
    Environment = var.environment
  }
}

# =============================================================================
# TABLE 2: reviewpulse-brands
# Attributes: brandId, brandName, adminEmail, createdAt
# =============================================================================
resource "aws_dynamodb_table" "brands" {
  name         = "${var.project_name}-brands"
  billing_mode = "PAY_PER_REQUEST"

  hash_key = "brandId"

  attribute {
    name = "brandId"
    type = "S"
  }

  tags = {
    Project     = var.project_name
    Environment = var.environment
  }
}

# =============================================================================
# TABLE 3: reviewpulse-products
# Attributes: productId, brandId, productName, createdAt
# =============================================================================
resource "aws_dynamodb_table" "products" {
  name         = "${var.project_name}-products"
  billing_mode = "PAY_PER_REQUEST"

  hash_key  = "productId"
  range_key = "brandId"

  attribute {
    name = "productId"
    type = "S"
  }

  attribute {
    name = "brandId"
    type = "S"
  }

  tags = {
    Project     = var.project_name
    Environment = var.environment
  }
}

# =============================================================================
# TABLE 4: reviewpulse-users (brand admins and employees)
# Attributes: userId, email, passwordHash, role (admin/viewer),
#             brandId, otpCode, otpExpiry, createdAt
# =============================================================================
resource "aws_dynamodb_table" "users" {
  name         = "${var.project_name}-users"
  billing_mode = "PAY_PER_REQUEST"

  hash_key = "userId"

  attribute {
    name = "userId"
    type = "S"
  }

  tags = {
    Project     = var.project_name
    Environment = var.environment
  }
}

# =============================================================================
# TABLE 5: reviewpulse-review-links (72-hour secure links)
# Attributes: linkToken, orderId, productId, brandId,
#             customerEmail, customerPhone, customerName, used, createdAt
# =============================================================================
resource "aws_dynamodb_table" "review_links" {
  name         = "${var.project_name}-review-links"
  billing_mode = "PAY_PER_REQUEST"

  hash_key = "linkToken"

  attribute {
    name = "linkToken"
    type = "S"
  }

  ttl {
    attribute_name = "expiresAt"
    enabled        = true
  }

  tags = {
    Project     = var.project_name
    Environment = var.environment
  }
}
