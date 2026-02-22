# =============================================================================
# ReviewPulse — CloudFront Distribution
# Points to S3 WEBSITE endpoint as custom origin (HTTP, NO OAC/OAI)
# S3 bucket stays PUBLIC — CloudFront simply fronts the website endpoint
# =============================================================================

resource "aws_cloudfront_distribution" "reviewpulse" {
  enabled             = true
  default_root_object = "index.html"
  price_class         = "PriceClass_100"
  comment             = "ReviewPlus frontend distribution"

  # ───────────────────────────────────────────────────────────────────────────
  # Origin: S3 WEBSITE endpoint (custom origin, HTTP port 80)
  # NOT an S3 origin — no OAC, no OAI, completely open
  # ───────────────────────────────────────────────────────────────────────────
  origin {
    domain_name = var.s3_website_endpoint
    origin_id   = "S3-Website-reviewpulse"

    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "http-only"
      origin_ssl_protocols   = ["TLSv1.2"]
    }
  }

  # ───────────────────────────────────────────────────────────────────────────
  # Default cache behavior
  # ───────────────────────────────────────────────────────────────────────────
  default_cache_behavior {
    allowed_methods        = ["GET", "HEAD", "OPTIONS"]
    cached_methods         = ["GET", "HEAD"]
    target_origin_id       = "S3-Website-reviewpulse"
    viewer_protocol_policy = "redirect-to-https"
    compress               = true

    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }

    min_ttl     = 0
    default_ttl = 3600
    max_ttl     = 86400
  }

  # ───────────────────────────────────────────────────────────────────────────
  # Handle React Router — serve index.html for all 404s and 403s
  # ───────────────────────────────────────────────────────────────────────────
  custom_error_response {
    error_code            = 404
    response_code         = 200
    response_page_path    = "/index.html"
    error_caching_min_ttl = 0
  }

  custom_error_response {
    error_code            = 403
    response_code         = 200
    response_page_path    = "/index.html"
    error_caching_min_ttl = 0
  }

  # ───────────────────────────────────────────────────────────────────────────
  # Restrictions & certificate
  # ───────────────────────────────────────────────────────────────────────────
  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    cloudfront_default_certificate = true
  }

  tags = {
    Project     = var.project_name
    Environment = var.environment
  }
}
