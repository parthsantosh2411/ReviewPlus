# --- Table Names ---

output "feedback_table_name" {
  description = "Name of the feedback table"
  value       = aws_dynamodb_table.feedback.name
}

output "brands_table_name" {
  description = "Name of the brands table"
  value       = aws_dynamodb_table.brands.name
}

output "products_table_name" {
  description = "Name of the products table"
  value       = aws_dynamodb_table.products.name
}

output "users_table_name" {
  description = "Name of the users table"
  value       = aws_dynamodb_table.users.name
}

output "review_links_table_name" {
  description = "Name of the review links table"
  value       = aws_dynamodb_table.review_links.name
}

# --- Table ARNs ---

output "feedback_table_arn" {
  description = "ARN of the feedback table"
  value       = aws_dynamodb_table.feedback.arn
}

output "brands_table_arn" {
  description = "ARN of the brands table"
  value       = aws_dynamodb_table.brands.arn
}

output "products_table_arn" {
  description = "ARN of the products table"
  value       = aws_dynamodb_table.products.arn
}

output "users_table_arn" {
  description = "ARN of the users table"
  value       = aws_dynamodb_table.users.arn
}

output "review_links_table_arn" {
  description = "ARN of the review links table"
  value       = aws_dynamodb_table.review_links.arn
}

# --- Stream ARN ---

output "feedback_table_stream_arn" {
  description = "Stream ARN of the feedback table"
  value       = aws_dynamodb_table.feedback.stream_arn
}
