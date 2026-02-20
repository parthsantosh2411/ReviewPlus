# --- Function ARNs ---

output "submit_review_function_arn" {
  description = "ARN of the submit-review Lambda function"
  value       = aws_lambda_function.submit_review.arn
}

output "get_insights_function_arn" {
  description = "ARN of the get-insights Lambda function"
  value       = aws_lambda_function.get_insights.arn
}

output "auth_otp_function_arn" {
  description = "ARN of the auth-otp Lambda function"
  value       = aws_lambda_function.auth_otp.arn
}

output "ai_processor_function_arn" {
  description = "ARN of the ai-processor Lambda function"
  value       = aws_lambda_function.ai_processor.arn
}

# --- Function Names ---

output "submit_review_function_name" {
  description = "Name of the submit-review Lambda function"
  value       = aws_lambda_function.submit_review.function_name
}

output "get_insights_function_name" {
  description = "Name of the get-insights Lambda function"
  value       = aws_lambda_function.get_insights.function_name
}

output "auth_otp_function_name" {
  description = "Name of the auth-otp Lambda function"
  value       = aws_lambda_function.auth_otp.function_name
}

output "ai_processor_function_name" {
  description = "Name of the ai-processor Lambda function"
  value       = aws_lambda_function.ai_processor.function_name
}
