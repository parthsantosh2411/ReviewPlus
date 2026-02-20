# =============================================================================
# REST API
# =============================================================================
resource "aws_api_gateway_rest_api" "this" {
  name        = "${var.project_name}-api"
  description = "ReviewPulse REST API"

  endpoint_configuration {
    types = ["REGIONAL"]
  }

  tags = {
    Project     = var.project_name
    Environment = var.environment
  }
}

# =============================================================================
# Shared CORS response parameters & templates
# =============================================================================
locals {
  cors_headers = {
    "method.response.header.Access-Control-Allow-Origin"  = "'*'"
    "method.response.header.Access-Control-Allow-Methods" = "'GET,POST,OPTIONS'"
    "method.response.header.Access-Control-Allow-Headers" = "'Content-Type,Authorization,X-Amz-Date'"
  }

  cors_method_response_parameters = {
    "method.response.header.Access-Control-Allow-Origin"  = true
    "method.response.header.Access-Control-Allow-Methods" = true
    "method.response.header.Access-Control-Allow-Headers" = true
  }
}

# =============================================================================
# RESOURCE TREE
# =============================================================================

# --- /review ---
resource "aws_api_gateway_resource" "review" {
  rest_api_id = aws_api_gateway_rest_api.this.id
  parent_id   = aws_api_gateway_rest_api.this.root_resource_id
  path_part   = "review"
}

# --- /review/{token} ---
resource "aws_api_gateway_resource" "review_token" {
  rest_api_id = aws_api_gateway_rest_api.this.id
  parent_id   = aws_api_gateway_resource.review.id
  path_part   = "{token}"
}

# --- /insights ---
resource "aws_api_gateway_resource" "insights" {
  rest_api_id = aws_api_gateway_rest_api.this.id
  parent_id   = aws_api_gateway_rest_api.this.root_resource_id
  path_part   = "insights"
}

# --- /insights/{brandId} ---
resource "aws_api_gateway_resource" "insights_brand" {
  rest_api_id = aws_api_gateway_rest_api.this.id
  parent_id   = aws_api_gateway_resource.insights.id
  path_part   = "{brandId}"
}

# --- /insights/{brandId}/{productId} ---
resource "aws_api_gateway_resource" "insights_brand_product" {
  rest_api_id = aws_api_gateway_rest_api.this.id
  parent_id   = aws_api_gateway_resource.insights_brand.id
  path_part   = "{productId}"
}

# --- /auth ---
resource "aws_api_gateway_resource" "auth" {
  rest_api_id = aws_api_gateway_rest_api.this.id
  parent_id   = aws_api_gateway_rest_api.this.root_resource_id
  path_part   = "auth"
}

# --- /auth/login ---
resource "aws_api_gateway_resource" "auth_login" {
  rest_api_id = aws_api_gateway_rest_api.this.id
  parent_id   = aws_api_gateway_resource.auth.id
  path_part   = "login"
}

# --- /auth/verify ---
resource "aws_api_gateway_resource" "auth_verify" {
  rest_api_id = aws_api_gateway_rest_api.this.id
  parent_id   = aws_api_gateway_resource.auth.id
  path_part   = "verify"
}

# --- /auth/send-review-link ---
resource "aws_api_gateway_resource" "auth_send_review_link" {
  rest_api_id = aws_api_gateway_rest_api.this.id
  parent_id   = aws_api_gateway_resource.auth.id
  path_part   = "send-review-link"
}

# =============================================================================
# ROUTE 1: POST /review → submit-review Lambda
# =============================================================================
resource "aws_api_gateway_method" "post_review" {
  rest_api_id   = aws_api_gateway_rest_api.this.id
  resource_id   = aws_api_gateway_resource.review.id
  http_method   = "POST"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "post_review" {
  rest_api_id             = aws_api_gateway_rest_api.this.id
  resource_id             = aws_api_gateway_resource.review.id
  http_method             = aws_api_gateway_method.post_review.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = "arn:aws:apigateway:ca-central-1:lambda:path/2015-03-31/functions/${var.submit_review_function_arn}/invocations"
}

# OPTIONS /review (CORS)
resource "aws_api_gateway_method" "options_review" {
  rest_api_id   = aws_api_gateway_rest_api.this.id
  resource_id   = aws_api_gateway_resource.review.id
  http_method   = "OPTIONS"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "options_review" {
  rest_api_id = aws_api_gateway_rest_api.this.id
  resource_id = aws_api_gateway_resource.review.id
  http_method = aws_api_gateway_method.options_review.http_method
  type        = "MOCK"

  request_templates = {
    "application/json" = "{\"statusCode\": 200}"
  }
}

resource "aws_api_gateway_method_response" "options_review" {
  rest_api_id = aws_api_gateway_rest_api.this.id
  resource_id = aws_api_gateway_resource.review.id
  http_method = aws_api_gateway_method.options_review.http_method
  status_code = "200"

  response_parameters = local.cors_method_response_parameters
}

resource "aws_api_gateway_integration_response" "options_review" {
  rest_api_id = aws_api_gateway_rest_api.this.id
  resource_id = aws_api_gateway_resource.review.id
  http_method = aws_api_gateway_method.options_review.http_method
  status_code = aws_api_gateway_method_response.options_review.status_code

  response_parameters = local.cors_headers

  depends_on = [aws_api_gateway_integration.options_review]
}

# =============================================================================
# ROUTE 2: GET /review/{token} → submit-review Lambda
# =============================================================================
resource "aws_api_gateway_method" "get_review_token" {
  rest_api_id   = aws_api_gateway_rest_api.this.id
  resource_id   = aws_api_gateway_resource.review_token.id
  http_method   = "GET"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "get_review_token" {
  rest_api_id             = aws_api_gateway_rest_api.this.id
  resource_id             = aws_api_gateway_resource.review_token.id
  http_method             = aws_api_gateway_method.get_review_token.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = "arn:aws:apigateway:ca-central-1:lambda:path/2015-03-31/functions/${var.submit_review_function_arn}/invocations"
}

# OPTIONS /review/{token} (CORS)
resource "aws_api_gateway_method" "options_review_token" {
  rest_api_id   = aws_api_gateway_rest_api.this.id
  resource_id   = aws_api_gateway_resource.review_token.id
  http_method   = "OPTIONS"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "options_review_token" {
  rest_api_id = aws_api_gateway_rest_api.this.id
  resource_id = aws_api_gateway_resource.review_token.id
  http_method = aws_api_gateway_method.options_review_token.http_method
  type        = "MOCK"

  request_templates = {
    "application/json" = "{\"statusCode\": 200}"
  }
}

resource "aws_api_gateway_method_response" "options_review_token" {
  rest_api_id = aws_api_gateway_rest_api.this.id
  resource_id = aws_api_gateway_resource.review_token.id
  http_method = aws_api_gateway_method.options_review_token.http_method
  status_code = "200"

  response_parameters = local.cors_method_response_parameters
}

resource "aws_api_gateway_integration_response" "options_review_token" {
  rest_api_id = aws_api_gateway_rest_api.this.id
  resource_id = aws_api_gateway_resource.review_token.id
  http_method = aws_api_gateway_method.options_review_token.http_method
  status_code = aws_api_gateway_method_response.options_review_token.status_code

  response_parameters = local.cors_headers

  depends_on = [aws_api_gateway_integration.options_review_token]
}

# =============================================================================
# ROUTE 3: GET /insights → get-insights Lambda
# =============================================================================
resource "aws_api_gateway_method" "get_insights" {
  rest_api_id   = aws_api_gateway_rest_api.this.id
  resource_id   = aws_api_gateway_resource.insights.id
  http_method   = "GET"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "get_insights" {
  rest_api_id             = aws_api_gateway_rest_api.this.id
  resource_id             = aws_api_gateway_resource.insights.id
  http_method             = aws_api_gateway_method.get_insights.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = "arn:aws:apigateway:ca-central-1:lambda:path/2015-03-31/functions/${var.get_insights_function_arn}/invocations"
}

# OPTIONS /insights (CORS)
resource "aws_api_gateway_method" "options_insights" {
  rest_api_id   = aws_api_gateway_rest_api.this.id
  resource_id   = aws_api_gateway_resource.insights.id
  http_method   = "OPTIONS"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "options_insights" {
  rest_api_id = aws_api_gateway_rest_api.this.id
  resource_id = aws_api_gateway_resource.insights.id
  http_method = aws_api_gateway_method.options_insights.http_method
  type        = "MOCK"

  request_templates = {
    "application/json" = "{\"statusCode\": 200}"
  }
}

resource "aws_api_gateway_method_response" "options_insights" {
  rest_api_id = aws_api_gateway_rest_api.this.id
  resource_id = aws_api_gateway_resource.insights.id
  http_method = aws_api_gateway_method.options_insights.http_method
  status_code = "200"

  response_parameters = local.cors_method_response_parameters
}

resource "aws_api_gateway_integration_response" "options_insights" {
  rest_api_id = aws_api_gateway_rest_api.this.id
  resource_id = aws_api_gateway_resource.insights.id
  http_method = aws_api_gateway_method.options_insights.http_method
  status_code = aws_api_gateway_method_response.options_insights.status_code

  response_parameters = local.cors_headers

  depends_on = [aws_api_gateway_integration.options_insights]
}

# =============================================================================
# ROUTE 4: GET /insights/{brandId} → get-insights Lambda
# =============================================================================
resource "aws_api_gateway_method" "get_insights_brand" {
  rest_api_id   = aws_api_gateway_rest_api.this.id
  resource_id   = aws_api_gateway_resource.insights_brand.id
  http_method   = "GET"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "get_insights_brand" {
  rest_api_id             = aws_api_gateway_rest_api.this.id
  resource_id             = aws_api_gateway_resource.insights_brand.id
  http_method             = aws_api_gateway_method.get_insights_brand.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = "arn:aws:apigateway:ca-central-1:lambda:path/2015-03-31/functions/${var.get_insights_function_arn}/invocations"
}

# OPTIONS /insights/{brandId} (CORS)
resource "aws_api_gateway_method" "options_insights_brand" {
  rest_api_id   = aws_api_gateway_rest_api.this.id
  resource_id   = aws_api_gateway_resource.insights_brand.id
  http_method   = "OPTIONS"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "options_insights_brand" {
  rest_api_id = aws_api_gateway_rest_api.this.id
  resource_id = aws_api_gateway_resource.insights_brand.id
  http_method = aws_api_gateway_method.options_insights_brand.http_method
  type        = "MOCK"

  request_templates = {
    "application/json" = "{\"statusCode\": 200}"
  }
}

resource "aws_api_gateway_method_response" "options_insights_brand" {
  rest_api_id = aws_api_gateway_rest_api.this.id
  resource_id = aws_api_gateway_resource.insights_brand.id
  http_method = aws_api_gateway_method.options_insights_brand.http_method
  status_code = "200"

  response_parameters = local.cors_method_response_parameters
}

resource "aws_api_gateway_integration_response" "options_insights_brand" {
  rest_api_id = aws_api_gateway_rest_api.this.id
  resource_id = aws_api_gateway_resource.insights_brand.id
  http_method = aws_api_gateway_method.options_insights_brand.http_method
  status_code = aws_api_gateway_method_response.options_insights_brand.status_code

  response_parameters = local.cors_headers

  depends_on = [aws_api_gateway_integration.options_insights_brand]
}

# =============================================================================
# ROUTE 5: GET /insights/{brandId}/{productId} → get-insights Lambda
# =============================================================================
resource "aws_api_gateway_method" "get_insights_brand_product" {
  rest_api_id   = aws_api_gateway_rest_api.this.id
  resource_id   = aws_api_gateway_resource.insights_brand_product.id
  http_method   = "GET"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "get_insights_brand_product" {
  rest_api_id             = aws_api_gateway_rest_api.this.id
  resource_id             = aws_api_gateway_resource.insights_brand_product.id
  http_method             = aws_api_gateway_method.get_insights_brand_product.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = "arn:aws:apigateway:ca-central-1:lambda:path/2015-03-31/functions/${var.get_insights_function_arn}/invocations"
}

# OPTIONS /insights/{brandId}/{productId} (CORS)
resource "aws_api_gateway_method" "options_insights_brand_product" {
  rest_api_id   = aws_api_gateway_rest_api.this.id
  resource_id   = aws_api_gateway_resource.insights_brand_product.id
  http_method   = "OPTIONS"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "options_insights_brand_product" {
  rest_api_id = aws_api_gateway_rest_api.this.id
  resource_id = aws_api_gateway_resource.insights_brand_product.id
  http_method = aws_api_gateway_method.options_insights_brand_product.http_method
  type        = "MOCK"

  request_templates = {
    "application/json" = "{\"statusCode\": 200}"
  }
}

resource "aws_api_gateway_method_response" "options_insights_brand_product" {
  rest_api_id = aws_api_gateway_rest_api.this.id
  resource_id = aws_api_gateway_resource.insights_brand_product.id
  http_method = aws_api_gateway_method.options_insights_brand_product.http_method
  status_code = "200"

  response_parameters = local.cors_method_response_parameters
}

resource "aws_api_gateway_integration_response" "options_insights_brand_product" {
  rest_api_id = aws_api_gateway_rest_api.this.id
  resource_id = aws_api_gateway_resource.insights_brand_product.id
  http_method = aws_api_gateway_method.options_insights_brand_product.http_method
  status_code = aws_api_gateway_method_response.options_insights_brand_product.status_code

  response_parameters = local.cors_headers

  depends_on = [aws_api_gateway_integration.options_insights_brand_product]
}

# =============================================================================
# ROUTE 6: POST /auth/login → auth-otp Lambda
# =============================================================================
resource "aws_api_gateway_method" "post_auth_login" {
  rest_api_id   = aws_api_gateway_rest_api.this.id
  resource_id   = aws_api_gateway_resource.auth_login.id
  http_method   = "POST"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "post_auth_login" {
  rest_api_id             = aws_api_gateway_rest_api.this.id
  resource_id             = aws_api_gateway_resource.auth_login.id
  http_method             = aws_api_gateway_method.post_auth_login.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = "arn:aws:apigateway:ca-central-1:lambda:path/2015-03-31/functions/${var.auth_otp_function_arn}/invocations"
}

# OPTIONS /auth/login (CORS)
resource "aws_api_gateway_method" "options_auth_login" {
  rest_api_id   = aws_api_gateway_rest_api.this.id
  resource_id   = aws_api_gateway_resource.auth_login.id
  http_method   = "OPTIONS"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "options_auth_login" {
  rest_api_id = aws_api_gateway_rest_api.this.id
  resource_id = aws_api_gateway_resource.auth_login.id
  http_method = aws_api_gateway_method.options_auth_login.http_method
  type        = "MOCK"

  request_templates = {
    "application/json" = "{\"statusCode\": 200}"
  }
}

resource "aws_api_gateway_method_response" "options_auth_login" {
  rest_api_id = aws_api_gateway_rest_api.this.id
  resource_id = aws_api_gateway_resource.auth_login.id
  http_method = aws_api_gateway_method.options_auth_login.http_method
  status_code = "200"

  response_parameters = local.cors_method_response_parameters
}

resource "aws_api_gateway_integration_response" "options_auth_login" {
  rest_api_id = aws_api_gateway_rest_api.this.id
  resource_id = aws_api_gateway_resource.auth_login.id
  http_method = aws_api_gateway_method.options_auth_login.http_method
  status_code = aws_api_gateway_method_response.options_auth_login.status_code

  response_parameters = local.cors_headers

  depends_on = [aws_api_gateway_integration.options_auth_login]
}

# =============================================================================
# ROUTE 7: POST /auth/verify → auth-otp Lambda
# =============================================================================
resource "aws_api_gateway_method" "post_auth_verify" {
  rest_api_id   = aws_api_gateway_rest_api.this.id
  resource_id   = aws_api_gateway_resource.auth_verify.id
  http_method   = "POST"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "post_auth_verify" {
  rest_api_id             = aws_api_gateway_rest_api.this.id
  resource_id             = aws_api_gateway_resource.auth_verify.id
  http_method             = aws_api_gateway_method.post_auth_verify.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = "arn:aws:apigateway:ca-central-1:lambda:path/2015-03-31/functions/${var.auth_otp_function_arn}/invocations"
}

# OPTIONS /auth/verify (CORS)
resource "aws_api_gateway_method" "options_auth_verify" {
  rest_api_id   = aws_api_gateway_rest_api.this.id
  resource_id   = aws_api_gateway_resource.auth_verify.id
  http_method   = "OPTIONS"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "options_auth_verify" {
  rest_api_id = aws_api_gateway_rest_api.this.id
  resource_id = aws_api_gateway_resource.auth_verify.id
  http_method = aws_api_gateway_method.options_auth_verify.http_method
  type        = "MOCK"

  request_templates = {
    "application/json" = "{\"statusCode\": 200}"
  }
}

resource "aws_api_gateway_method_response" "options_auth_verify" {
  rest_api_id = aws_api_gateway_rest_api.this.id
  resource_id = aws_api_gateway_resource.auth_verify.id
  http_method = aws_api_gateway_method.options_auth_verify.http_method
  status_code = "200"

  response_parameters = local.cors_method_response_parameters
}

resource "aws_api_gateway_integration_response" "options_auth_verify" {
  rest_api_id = aws_api_gateway_rest_api.this.id
  resource_id = aws_api_gateway_resource.auth_verify.id
  http_method = aws_api_gateway_method.options_auth_verify.http_method
  status_code = aws_api_gateway_method_response.options_auth_verify.status_code

  response_parameters = local.cors_headers

  depends_on = [aws_api_gateway_integration.options_auth_verify]
}

# =============================================================================
# ROUTE 8: POST /auth/send-review-link → auth-otp Lambda
# =============================================================================
resource "aws_api_gateway_method" "post_auth_send_review_link" {
  rest_api_id   = aws_api_gateway_rest_api.this.id
  resource_id   = aws_api_gateway_resource.auth_send_review_link.id
  http_method   = "POST"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "post_auth_send_review_link" {
  rest_api_id             = aws_api_gateway_rest_api.this.id
  resource_id             = aws_api_gateway_resource.auth_send_review_link.id
  http_method             = aws_api_gateway_method.post_auth_send_review_link.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = "arn:aws:apigateway:ca-central-1:lambda:path/2015-03-31/functions/${var.auth_otp_function_arn}/invocations"
}

# OPTIONS /auth/send-review-link (CORS)
resource "aws_api_gateway_method" "options_auth_send_review_link" {
  rest_api_id   = aws_api_gateway_rest_api.this.id
  resource_id   = aws_api_gateway_resource.auth_send_review_link.id
  http_method   = "OPTIONS"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "options_auth_send_review_link" {
  rest_api_id = aws_api_gateway_rest_api.this.id
  resource_id = aws_api_gateway_resource.auth_send_review_link.id
  http_method = aws_api_gateway_method.options_auth_send_review_link.http_method
  type        = "MOCK"

  request_templates = {
    "application/json" = "{\"statusCode\": 200}"
  }
}

resource "aws_api_gateway_method_response" "options_auth_send_review_link" {
  rest_api_id = aws_api_gateway_rest_api.this.id
  resource_id = aws_api_gateway_resource.auth_send_review_link.id
  http_method = aws_api_gateway_method.options_auth_send_review_link.http_method
  status_code = "200"

  response_parameters = local.cors_method_response_parameters
}

resource "aws_api_gateway_integration_response" "options_auth_send_review_link" {
  rest_api_id = aws_api_gateway_rest_api.this.id
  resource_id = aws_api_gateway_resource.auth_send_review_link.id
  http_method = aws_api_gateway_method.options_auth_send_review_link.http_method
  status_code = aws_api_gateway_method_response.options_auth_send_review_link.status_code

  response_parameters = local.cors_headers

  depends_on = [aws_api_gateway_integration.options_auth_send_review_link]
}

# =============================================================================
# LAMBDA PERMISSIONS — allow API Gateway to invoke each function
# =============================================================================
resource "aws_lambda_permission" "submit_review" {
  statement_id  = "AllowAPIGatewayInvoke-submit-review"
  action        = "lambda:InvokeFunction"
  function_name = var.submit_review_function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.this.execution_arn}/*/*"
}

resource "aws_lambda_permission" "get_insights" {
  statement_id  = "AllowAPIGatewayInvoke-get-insights"
  action        = "lambda:InvokeFunction"
  function_name = var.get_insights_function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.this.execution_arn}/*/*"
}

resource "aws_lambda_permission" "auth_otp" {
  statement_id  = "AllowAPIGatewayInvoke-auth-otp"
  action        = "lambda:InvokeFunction"
  function_name = var.auth_otp_function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.this.execution_arn}/*/*"
}

# =============================================================================
# DEPLOYMENT & STAGE
# =============================================================================
resource "aws_api_gateway_deployment" "this" {
  rest_api_id = aws_api_gateway_rest_api.this.id

  # Redeploy whenever any method or integration changes
  triggers = {
    redeployment = sha1(jsonencode([
      aws_api_gateway_method.post_review.id,
      aws_api_gateway_integration.post_review.id,
      aws_api_gateway_method.get_review_token.id,
      aws_api_gateway_integration.get_review_token.id,
      aws_api_gateway_method.get_insights.id,
      aws_api_gateway_integration.get_insights.id,
      aws_api_gateway_method.get_insights_brand.id,
      aws_api_gateway_integration.get_insights_brand.id,
      aws_api_gateway_method.get_insights_brand_product.id,
      aws_api_gateway_integration.get_insights_brand_product.id,
      aws_api_gateway_method.post_auth_login.id,
      aws_api_gateway_integration.post_auth_login.id,
      aws_api_gateway_method.post_auth_verify.id,
      aws_api_gateway_integration.post_auth_verify.id,
      aws_api_gateway_method.post_auth_send_review_link.id,
      aws_api_gateway_integration.post_auth_send_review_link.id,
    ]))
  }

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_api_gateway_stage" "dev" {
  rest_api_id   = aws_api_gateway_rest_api.this.id
  deployment_id = aws_api_gateway_deployment.this.id
  stage_name    = var.environment

  tags = {
    Project     = var.project_name
    Environment = var.environment
  }
}

resource "aws_api_gateway_method_settings" "all" {
  rest_api_id = aws_api_gateway_rest_api.this.id
  stage_name  = aws_api_gateway_stage.dev.stage_name
  method_path = "*/*"

  settings {
    throttling_burst_limit = 100
    throttling_rate_limit  = 50
  }
}
