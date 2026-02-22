output "api_gateway_url" {
  description = "Full invoke URL of the API Gateway"
  value       = module.api_gateway.api_url
}

output "feedback_table_name" {
  description = "Name of the feedback DynamoDB table"
  value       = module.dynamodb.feedback_table_name
}

output "frontend_bucket" {
  description = "Name of the S3 frontend hosting bucket"
  value       = module.s3.frontend_bucket_name
}

output "frontend_website_endpoint" {
  description = "Website endpoint of the frontend S3 bucket"
  value       = module.s3.frontend_bucket_website_endpoint
}

output "exports_bucket" {
  description = "Name of the S3 exports bucket"
  value       = module.s3.exports_bucket_name
}

output "cloudwatch_dashboard" {
  description = "Name of the CloudWatch Operations dashboard"
  value       = module.xray.dashboard_name
}

output "alarm_arns" {
  description = "ARNs of all CloudWatch alarms"
  value       = module.xray.alarm_arns
}

output "sns_topic_arn" {
  description = "ARN of the SNS alarm notification topic"
  value       = module.xray.sns_topic_arn
}

# ─── Cognito outputs ─────────────────────────────────────────────────────────
output "cognito_user_pool_id" {
  description = "ID of the Cognito User Pool"
  value       = module.cognito.user_pool_id
}

output "cognito_client_id" {
  description = "ID of the Cognito User Pool Client"
  value       = module.cognito.user_pool_client_id
}

# ─── CloudFront outputs ─────────────────────────────────────────────────────
output "cloudfront_url" {
  description = "Full HTTPS URL of the CloudFront distribution"
  value       = module.cloudfront.cloudfront_url
}

output "cloudfront_domain" {
  description = "Domain name of the CloudFront distribution"
  value       = module.cloudfront.cloudfront_domain_name
}

