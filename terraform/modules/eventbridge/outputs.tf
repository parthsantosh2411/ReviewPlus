output "event_rule_arn" {
  description = "ARN of the EventBridge rule"
  value       = aws_cloudwatch_event_rule.new_review.arn
}

output "log_group_name" {
  description = "Name of the AI processor CloudWatch log group"
  value       = aws_cloudwatch_log_group.ai_processor.name
}
