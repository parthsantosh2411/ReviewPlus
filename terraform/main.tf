# =============================================================================
# ReviewPulse — Root Module
# Wires all child modules in dependency order
# =============================================================================

# -----------------------------------------------------------------------------
# 1. IAM (no dependencies)
# -----------------------------------------------------------------------------
module "iam" {
  source       = "./modules/iam"
  project_name = var.project_name
  environment  = var.environment
}

# -----------------------------------------------------------------------------
# 2. DynamoDB (no dependencies)
# -----------------------------------------------------------------------------
module "dynamodb" {
  source       = "./modules/dynamodb"
  project_name = var.project_name
  environment  = var.environment
}

# -----------------------------------------------------------------------------
# 3. S3 (no dependencies)
# -----------------------------------------------------------------------------
module "s3" {
  source       = "./modules/s3"
  project_name = var.project_name
  environment  = var.environment
}

# -----------------------------------------------------------------------------
# 4. SES (no dependencies)
# -----------------------------------------------------------------------------
module "ses" {
  source         = "./modules/ses"
  project_name   = var.project_name
  environment    = var.environment
  ses_from_email = "tripathiparth2411@gmail.com"
}

# -----------------------------------------------------------------------------
# 5. Lambda (depends on: IAM, DynamoDB)
# -----------------------------------------------------------------------------
module "lambda" {
  source              = "./modules/lambda"
  project_name        = var.project_name
  environment         = var.environment
  lambda_role_arn     = module.iam.lambda_role_arn
  feedback_table_name = module.dynamodb.feedback_table_name
  users_table_name    = module.dynamodb.users_table_name
  products_table_name = module.dynamodb.products_table_name
  brands_table_name   = module.dynamodb.brands_table_name
  links_table_name    = module.dynamodb.review_links_table_name
  ses_from_email      = "tripathiparth2411@gmail.com"
}

# -----------------------------------------------------------------------------
# 6. API Gateway (depends on: Lambda)
# -----------------------------------------------------------------------------
module "api_gateway" {
  source                      = "./modules/api_gateway"
  project_name                = var.project_name
  environment                 = var.environment
  submit_review_function_arn  = module.lambda.submit_review_function_arn
  submit_review_function_name = module.lambda.submit_review_function_name
  get_insights_function_arn   = module.lambda.get_insights_function_arn
  get_insights_function_name  = module.lambda.get_insights_function_name
  auth_otp_function_arn       = module.lambda.auth_otp_function_arn
  auth_otp_function_name      = module.lambda.auth_otp_function_name
}

# -----------------------------------------------------------------------------
# 7. EventBridge (depends on: DynamoDB, Lambda)
# -----------------------------------------------------------------------------
module "eventbridge" {
  source                    = "./modules/eventbridge"
  project_name              = var.project_name
  environment               = var.environment
  feedback_table_stream_arn = module.dynamodb.feedback_table_stream_arn
  ai_processor_function_arn = module.lambda.ai_processor_function_arn
}

# -----------------------------------------------------------------------------
# 8. X-Ray & CloudWatch Observability (depends on: API Gateway)
# -----------------------------------------------------------------------------
module "xray" {
  source             = "./modules/xray"
  project_name       = var.project_name
  environment        = var.environment
  api_gateway_id     = module.api_gateway.api_id
  api_gateway_stage  = "dev"
  notification_email = "tripathiparth2411@gmail.com"
}
