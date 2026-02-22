# =============================================================================
# ReviewPulse — Cognito User Pool (replaces custom JWT auth)
# =============================================================================

# ─────────────────────────────────────────────────────────────────────────────
# PART A — Cognito User Pool
# ─────────────────────────────────────────────────────────────────────────────
resource "aws_cognito_user_pool" "reviewpulse" {
  name = "reviewpulse-user-pool"

  # Username is email
  username_attributes        = ["email"]
  auto_verified_attributes   = ["email"]

  # Password policy (reasonable, not too strict)
  password_policy {
    minimum_length    = 8
    require_uppercase = true
    require_lowercase = true
    require_numbers   = true
    require_symbols   = false
  }

  # MFA configuration — Email based OTP (SMS kept as fallback)
  mfa_configuration = "OPTIONAL"

  sms_configuration {
    external_id    = "reviewpulse-sns-external"
    sns_caller_arn = aws_iam_role.cognito_sms_role.arn
    sns_region     = "ca-central-1"
  }

  sms_authentication_message = "Your ReviewPulse verification code is: {####}"

  # Email MFA is configured via AWS CLI (set-user-pool-mfa-config)
  # as Terraform aws_cognito_user_pool does not yet support email_mfa_configuration natively.
  # Command used:
  #   aws cognito-idp set-user-pool-mfa-config \
  #     --user-pool-id <pool-id> \
  #     --email-mfa-configuration '{"Message":"Your ReviewPulse code is {####}","Subject":"ReviewPulse Code"}' \
  #     --mfa-configuration OPTIONAL

  # Account recovery
  account_recovery_setting {
    recovery_mechanism {
      name     = "verified_email"
      priority = 1
    }
  }

  # User attributes
  schema {
    name                = "email"
    attribute_data_type = "String"
    mutable             = true
    required            = true
  }

  schema {
    name                = "role"
    attribute_data_type = "String"
    mutable             = true
    required            = false

    string_attribute_constraints {
      min_length = 0
      max_length = 50
    }
  }

  schema {
    name                = "brandId"
    attribute_data_type = "String"
    mutable             = true
    required            = false

    string_attribute_constraints {
      min_length = 0
      max_length = 100
    }
  }

  tags = {
    Project     = var.project_name
    Environment = var.environment
  }
}

# ─────────────────────────────────────────────────────────────────────────────
# PART B — IAM Role for Cognito SMS (needed for MFA)
# ─────────────────────────────────────────────────────────────────────────────
resource "aws_iam_role" "cognito_sms_role" {
  name = "reviewpulse-cognito-sms-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = { Service = "cognito-idp.amazonaws.com" }
      Action    = "sts:AssumeRole"
      Condition = {
        StringEquals = {
          "sts:ExternalId" = "reviewpulse-sns-external"
        }
      }
    }]
  })

  tags = {
    Project     = var.project_name
    Environment = var.environment
  }
}

resource "aws_iam_role_policy" "cognito_sms_policy" {
  name = "reviewpulse-cognito-sms-policy"
  role = aws_iam_role.cognito_sms_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect   = "Allow"
      Action   = ["sns:Publish"]
      Resource = "*"
    }]
  })
}

# ─────────────────────────────────────────────────────────────────────────────
# PART C — Cognito User Pool Client
# ─────────────────────────────────────────────────────────────────────────────
resource "aws_cognito_user_pool_client" "reviewpulse_client" {
  name         = "reviewpulse-web-client"
  user_pool_id = aws_cognito_user_pool.reviewpulse.id

  # No client secret (public web app)
  generate_secret = false

  # Auth flows supported
  explicit_auth_flows = [
    "ALLOW_USER_PASSWORD_AUTH",
    "ALLOW_USER_SRP_AUTH",
    "ALLOW_REFRESH_TOKEN_AUTH"
  ]

  # Token validity
  access_token_validity  = 1   # 1 hour
  id_token_validity      = 1   # 1 hour
  refresh_token_validity = 7   # 7 days

  token_validity_units {
    access_token  = "hours"
    id_token      = "hours"
    refresh_token = "days"
  }

  prevent_user_existence_errors = "ENABLED"
}

# ─────────────────────────────────────────────────────────────────────────────
# PART D — Cognito User Groups (for roles)
# ─────────────────────────────────────────────────────────────────────────────
resource "aws_cognito_user_group" "admin_group" {
  name         = "admin"
  user_pool_id = aws_cognito_user_pool.reviewpulse.id
  description  = "Brand administrators with full access"
}

resource "aws_cognito_user_group" "viewer_group" {
  name         = "viewer"
  user_pool_id = aws_cognito_user_pool.reviewpulse.id
  description  = "Read-only access for brand employees"
}
