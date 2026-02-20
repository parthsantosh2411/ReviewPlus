output "api_id" {
  description = "ID of the REST API"
  value       = aws_api_gateway_rest_api.this.id
}

output "api_url" {
  description = "Full invoke URL of the API (with stage)"
  value       = "https://${aws_api_gateway_rest_api.this.id}.execute-api.ca-central-1.amazonaws.com/${aws_api_gateway_stage.dev.stage_name}"
}
