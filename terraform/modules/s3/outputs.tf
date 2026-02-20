output "exports_bucket_name" {
  description = "Name of the exports S3 bucket"
  value       = aws_s3_bucket.exports.bucket
}

output "exports_bucket_arn" {
  description = "ARN of the exports S3 bucket"
  value       = aws_s3_bucket.exports.arn
}

output "frontend_bucket_name" {
  description = "Name of the frontend S3 bucket"
  value       = aws_s3_bucket.frontend.bucket
}

output "frontend_bucket_website_endpoint" {
  description = "Website endpoint of the frontend S3 bucket"
  value       = aws_s3_bucket_website_configuration.frontend.website_endpoint
}

