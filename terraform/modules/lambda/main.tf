# =============================================================================
# ZIP archives for Lambda deployment packages
# =============================================================================

data "archive_file" "submit_review" {
  type        = "zip"
  source_dir  = "${path.module}/../../../backend/functions/submit_review"
  output_path = "${path.module}/zip/submit_review.zip"
}

data "archive_file" "get_insights" {
  type        = "zip"
  source_dir  = "${path.module}/../../../backend/functions/get_insights"
  output_path = "${path.module}/zip/get_insights.zip"
}

data "archive_file" "auth_otp" {
  type        = "zip"
  source_dir  = "${path.module}/../../../backend/functions/auth_otp"
  output_path = "${path.module}/zip/auth_otp.zip"
}

data "archive_file" "ai_processor" {
  type        = "zip"
  source_dir  = "${path.module}/../../../backend/functions/ai_processor"
  output_path = "${path.module}/zip/ai_processor.zip"
}

# =============================================================================
# FUNCTION 1: reviewpulse-submit-review
# =============================================================================
resource "aws_lambda_function" "submit_review" {
  function_name    = "${var.project_name}-submit-review"
  role             = var.lambda_role_arn
  handler          = "handler.lambda_handler"
  runtime          = "python3.11"
  timeout          = 30
  memory_size      = 256
  filename         = data.archive_file.submit_review.output_path
  source_code_hash = data.archive_file.submit_review.output_base64sha256

  tracing_config {
    mode = "Active"
  }

  environment {
    variables = {
      DYNAMODB_TABLE_FEEDBACK = var.feedback_table_name
      DYNAMODB_TABLE_USERS    = var.users_table_name
      DYNAMODB_TABLE_PRODUCTS = var.products_table_name
      DYNAMODB_TABLE_BRANDS   = var.brands_table_name
      DYNAMODB_TABLE_LINKS    = var.links_table_name
      REVIEW_LINKS_TABLE      = var.links_table_name
      AWS_REGION_NAME         = "ca-central-1"
      ENVIRONMENT             = var.environment
    }
  }

  tags = {
    Project     = var.project_name
    Environment = var.environment
  }
}

# =============================================================================
# FUNCTION 2: reviewpulse-get-insights
# =============================================================================
resource "aws_lambda_function" "get_insights" {
  function_name    = "${var.project_name}-get-insights"
  role             = var.lambda_role_arn
  handler          = "handler.lambda_handler"
  runtime          = "python3.11"
  timeout          = 30
  memory_size      = 256
  filename         = data.archive_file.get_insights.output_path
  source_code_hash = data.archive_file.get_insights.output_base64sha256

  tracing_config {
    mode = "Active"
  }

  environment {
    variables = {
      DYNAMODB_TABLE_FEEDBACK = var.feedback_table_name
      DYNAMODB_TABLE_USERS    = var.users_table_name
      DYNAMODB_TABLE_PRODUCTS = var.products_table_name
      DYNAMODB_TABLE_BRANDS   = var.brands_table_name
      DYNAMODB_TABLE_LINKS    = var.links_table_name
      AWS_REGION_NAME         = "ca-central-1"
      ENVIRONMENT             = var.environment
    }
  }

  tags = {
    Project     = var.project_name
    Environment = var.environment
  }
}

# =============================================================================
# FUNCTION 3: reviewpulse-auth-otp
# =============================================================================
resource "aws_lambda_function" "auth_otp" {
  function_name    = "${var.project_name}-auth-otp"
  role             = var.lambda_role_arn
  handler          = "handler.lambda_handler"
  runtime          = "python3.11"
  timeout          = 30
  memory_size      = 256
  filename         = data.archive_file.auth_otp.output_path
  source_code_hash = data.archive_file.auth_otp.output_base64sha256

  tracing_config {
    mode = "Active"
  }

  environment {
    variables = {
      DYNAMODB_TABLE_FEEDBACK = var.feedback_table_name
      DYNAMODB_TABLE_USERS    = var.users_table_name
      DYNAMODB_TABLE_PRODUCTS = var.products_table_name
      DYNAMODB_TABLE_BRANDS   = var.brands_table_name
      DYNAMODB_TABLE_LINKS    = var.links_table_name
      SES_FROM_EMAIL          = var.ses_from_email
      AWS_REGION_NAME         = "ca-central-1"
      ENVIRONMENT             = var.environment
    }
  }

  tags = {
    Project     = var.project_name
    Environment = var.environment
  }
}

# =============================================================================
# FUNCTION 4: reviewpulse-ai-processor (512 MB / 60s for Bedrock calls)
# =============================================================================
resource "aws_lambda_function" "ai_processor" {
  function_name    = "${var.project_name}-ai-processor"
  role             = var.lambda_role_arn
  handler          = "handler.lambda_handler"
  runtime          = "python3.11"
  timeout          = 60
  memory_size      = 512
  filename         = data.archive_file.ai_processor.output_path
  source_code_hash = data.archive_file.ai_processor.output_base64sha256

  tracing_config {
    mode = "Active"
  }

  environment {
    variables = {
      DYNAMODB_TABLE_FEEDBACK = var.feedback_table_name
      DYNAMODB_TABLE_USERS    = var.users_table_name
      DYNAMODB_TABLE_PRODUCTS = var.products_table_name
      DYNAMODB_TABLE_BRANDS   = var.brands_table_name
      DYNAMODB_TABLE_LINKS    = var.links_table_name
      BEDROCK_MODEL_ID        = "anthropic.claude-v2"
      AWS_REGION_NAME         = "ca-central-1"
      ENVIRONMENT             = var.environment
    }
  }

  tags = {
    Project     = var.project_name
    Environment = var.environment
  }
}
