# =============================================================================
# PART A — DynamoDB Streams → AI Processor Lambda trigger
# Fires on every new review INSERT so Bedrock can analyse sentiment
# =============================================================================
resource "aws_lambda_event_source_mapping" "feedback_stream" {
  event_source_arn  = var.feedback_table_stream_arn
  function_name     = var.ai_processor_function_arn
  starting_position = "LATEST"
  batch_size        = 1

  filter_criteria {
    filter {
      pattern = jsonencode({
        eventName = ["INSERT"]
      })
    }
  }
}

# =============================================================================
# PART B — EventBridge rule for hourly batch summary (future use)
# =============================================================================
resource "aws_cloudwatch_event_rule" "new_review" {
  name                = "${var.project_name}-new-review"
  description         = "Hourly batch summary trigger for AI processor (enable when needed)"
  schedule_expression = "rate(1 hour)"
  state               = "DISABLED"

  tags = {
    Project     = var.project_name
    Environment = var.environment
  }
}

resource "aws_cloudwatch_event_target" "ai_processor" {
  rule      = aws_cloudwatch_event_rule.new_review.name
  target_id = "${var.project_name}-ai-processor"
  arn       = var.ai_processor_function_arn
}

resource "aws_lambda_permission" "allow_eventbridge" {
  statement_id  = "AllowEventBridgeInvoke"
  action        = "lambda:InvokeFunction"
  function_name = var.ai_processor_function_arn
  principal     = "events.amazonaws.com"
  source_arn    = aws_cloudwatch_event_rule.new_review.arn
}

# =============================================================================
# PART C — CloudWatch Log Group for AI processing logs (14-day retention)
# =============================================================================
resource "aws_cloudwatch_log_group" "ai_processor" {
  name              = "/aws/lambda/${var.project_name}-ai-processor"
  retention_in_days = 14

  tags = {
    Project     = var.project_name
    Environment = var.environment
  }
}
