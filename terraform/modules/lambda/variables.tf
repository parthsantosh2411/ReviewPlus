variable "project_name" {
  description = "Name of the project"
  type        = string
}

variable "environment" {
  description = "Deployment environment"
  type        = string
}

variable "lambda_role_arn" {
  description = "ARN of the IAM role for Lambda execution"
  type        = string
}

variable "feedback_table_name" {
  description = "Name of the feedback DynamoDB table"
  type        = string
}

variable "users_table_name" {
  description = "Name of the users DynamoDB table"
  type        = string
}

variable "products_table_name" {
  description = "Name of the products DynamoDB table"
  type        = string
}

variable "brands_table_name" {
  description = "Name of the brands DynamoDB table"
  type        = string
}

variable "links_table_name" {
  description = "Name of the review links DynamoDB table"
  type        = string
}

variable "ses_from_email" {
  description = "Verified SES sender email address"
  type        = string
}

variable "cognito_user_pool_id" {
  description = "ID of the Cognito User Pool"
  type        = string
}

variable "cognito_client_id" {
  description = "ID of the Cognito User Pool Client"
  type        = string
}

variable "cloudfront_url" {
  description = "CloudFront distribution URL"
  type        = string
}
