# =============================================================================
# Outputs for the X-Ray & CloudWatch Observability Module
# =============================================================================

output "dashboard_name" {
  description = "Name of the CloudWatch Operations dashboard"
  value       = aws_cloudwatch_dashboard.operations.dashboard_name
}

output "alarm_arns" {
  description = "List of all CloudWatch Alarm ARNs"
  value = [
    aws_cloudwatch_metric_alarm.lambda_errors.arn,
    aws_cloudwatch_metric_alarm.lambda_throttles.arn,
    aws_cloudwatch_metric_alarm.ai_duration.arn,
    aws_cloudwatch_metric_alarm.api_4xx.arn,
    aws_cloudwatch_metric_alarm.api_5xx.arn,
  ]
}

output "sns_topic_arn" {
  description = "ARN of the SNS topic for alarm notifications"
  value       = aws_sns_topic.alarm_notifications.arn
}

output "log_group_arns" {
  description = "ARNs of the CloudWatch Log Groups"
  value = [
    aws_cloudwatch_log_group.submit_review.arn,
    aws_cloudwatch_log_group.get_insights.arn,
    aws_cloudwatch_log_group.auth_otp.arn,
    aws_cloudwatch_log_group.ai_processor.arn,
  ]
}
