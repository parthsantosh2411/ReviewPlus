# =============================================================================
# ReviewPulse — X-Ray & CloudWatch Observability Module
# Region: ca-central-1
# =============================================================================

locals {
  lambda_functions = [
    "${var.project_name}-submit-review",
    "${var.project_name}-get-insights",
    "${var.project_name}-auth-otp",
    "${var.project_name}-ai-processor",
  ]
}

# =============================================================================
# PART A — CloudWatch Log Groups (one per Lambda, 14-day retention)
# =============================================================================

resource "aws_cloudwatch_log_group" "submit_review" {
  name              = "/aws/lambda/${var.project_name}-submit-review"
  retention_in_days = 14

  lifecycle {
    ignore_changes = all
  }

  tags = {
    Project     = var.project_name
    Environment = var.environment
  }
}

resource "aws_cloudwatch_log_group" "get_insights" {
  name              = "/aws/lambda/${var.project_name}-get-insights"
  retention_in_days = 14

  lifecycle {
    ignore_changes = all
  }

  tags = {
    Project     = var.project_name
    Environment = var.environment
  }
}

resource "aws_cloudwatch_log_group" "auth_otp" {
  name              = "/aws/lambda/${var.project_name}-auth-otp"
  retention_in_days = 14

  lifecycle {
    ignore_changes = all
  }

  tags = {
    Project     = var.project_name
    Environment = var.environment
  }
}

resource "aws_cloudwatch_log_group" "ai_processor" {
  name              = "/aws/lambda/${var.project_name}-ai-processor"
  retention_in_days = 14

  lifecycle {
    ignore_changes = all
  }

  tags = {
    Project     = var.project_name
    Environment = var.environment
  }
}

# =============================================================================
# SNS Topic for Alarm Notifications
# =============================================================================

resource "aws_sns_topic" "alarm_notifications" {
  name = "${var.project_name}-alarm-notifications"

  tags = {
    Project     = var.project_name
    Environment = var.environment
  }
}

resource "aws_sns_topic_subscription" "email_alert" {
  topic_arn = aws_sns_topic.alarm_notifications.arn
  protocol  = "email"
  endpoint  = var.notification_email
}

# =============================================================================
# PART B — CloudWatch Alarms
# =============================================================================

# ---------------------------------------------------------------------------
# Alarm 1: Lambda Errors across all 4 functions (>= 5 in 5 min)
# ---------------------------------------------------------------------------
resource "aws_cloudwatch_metric_alarm" "lambda_errors" {
  alarm_name          = "${var.project_name}-lambda-errors"
  alarm_description   = "Fires when total Lambda errors across all 4 functions >= 5 in 5 minutes"
  comparison_operator = "GreaterThanOrEqualToThreshold"
  evaluation_periods  = 1
  threshold           = 5
  treat_missing_data  = "notBreaching"

  metric_query {
    id          = "total_errors"
    expression  = "e1 + e2 + e3 + e4"
    label       = "Total Lambda Errors"
    return_data = true
  }

  metric_query {
    id = "e1"
    metric {
      metric_name = "Errors"
      namespace   = "AWS/Lambda"
      period      = 300
      stat        = "Sum"
      dimensions = {
        FunctionName = "${var.project_name}-submit-review"
      }
    }
  }

  metric_query {
    id = "e2"
    metric {
      metric_name = "Errors"
      namespace   = "AWS/Lambda"
      period      = 300
      stat        = "Sum"
      dimensions = {
        FunctionName = "${var.project_name}-get-insights"
      }
    }
  }

  metric_query {
    id = "e3"
    metric {
      metric_name = "Errors"
      namespace   = "AWS/Lambda"
      period      = 300
      stat        = "Sum"
      dimensions = {
        FunctionName = "${var.project_name}-auth-otp"
      }
    }
  }

  metric_query {
    id = "e4"
    metric {
      metric_name = "Errors"
      namespace   = "AWS/Lambda"
      period      = 300
      stat        = "Sum"
      dimensions = {
        FunctionName = "${var.project_name}-ai-processor"
      }
    }
  }

  alarm_actions = [aws_sns_topic.alarm_notifications.arn]
  ok_actions    = [aws_sns_topic.alarm_notifications.arn]

  tags = {
    Project     = var.project_name
    Environment = var.environment
  }
}

# ---------------------------------------------------------------------------
# Alarm 2: Lambda Throttles across all 4 functions (>= 3 in 5 min)
# ---------------------------------------------------------------------------
resource "aws_cloudwatch_metric_alarm" "lambda_throttles" {
  alarm_name          = "${var.project_name}-lambda-throttles"
  alarm_description   = "Fires when total Lambda throttles across all 4 functions >= 3 in 5 minutes"
  comparison_operator = "GreaterThanOrEqualToThreshold"
  evaluation_periods  = 1
  threshold           = 3
  treat_missing_data  = "notBreaching"

  metric_query {
    id          = "total_throttles"
    expression  = "t1 + t2 + t3 + t4"
    label       = "Total Lambda Throttles"
    return_data = true
  }

  metric_query {
    id = "t1"
    metric {
      metric_name = "Throttles"
      namespace   = "AWS/Lambda"
      period      = 300
      stat        = "Sum"
      dimensions = {
        FunctionName = "${var.project_name}-submit-review"
      }
    }
  }

  metric_query {
    id = "t2"
    metric {
      metric_name = "Throttles"
      namespace   = "AWS/Lambda"
      period      = 300
      stat        = "Sum"
      dimensions = {
        FunctionName = "${var.project_name}-get-insights"
      }
    }
  }

  metric_query {
    id = "t3"
    metric {
      metric_name = "Throttles"
      namespace   = "AWS/Lambda"
      period      = 300
      stat        = "Sum"
      dimensions = {
        FunctionName = "${var.project_name}-auth-otp"
      }
    }
  }

  metric_query {
    id = "t4"
    metric {
      metric_name = "Throttles"
      namespace   = "AWS/Lambda"
      period      = 300
      stat        = "Sum"
      dimensions = {
        FunctionName = "${var.project_name}-ai-processor"
      }
    }
  }

  alarm_actions = [aws_sns_topic.alarm_notifications.arn]
  ok_actions    = [aws_sns_topic.alarm_notifications.arn]

  tags = {
    Project     = var.project_name
    Environment = var.environment
  }
}

# ---------------------------------------------------------------------------
# Alarm 3: AI Processor Duration (>= 45000ms — near 60s timeout)
# ---------------------------------------------------------------------------
resource "aws_cloudwatch_metric_alarm" "ai_duration" {
  alarm_name          = "${var.project_name}-ai-duration"
  alarm_description   = "Fires when AI Processor (Bedrock) duration >= 45s — approaching 60s timeout"
  comparison_operator = "GreaterThanOrEqualToThreshold"
  evaluation_periods  = 1
  threshold           = 45000
  metric_name         = "Duration"
  namespace           = "AWS/Lambda"
  period              = 300
  statistic           = "Maximum"
  treat_missing_data  = "notBreaching"

  dimensions = {
    FunctionName = "${var.project_name}-ai-processor"
  }

  alarm_actions = [aws_sns_topic.alarm_notifications.arn]
  ok_actions    = [aws_sns_topic.alarm_notifications.arn]

  tags = {
    Project     = var.project_name
    Environment = var.environment
  }
}

# ---------------------------------------------------------------------------
# Alarm 4: API Gateway 4XX Errors (>= 20 in 5 min)
# ---------------------------------------------------------------------------
resource "aws_cloudwatch_metric_alarm" "api_4xx" {
  alarm_name          = "${var.project_name}-api-4xx"
  alarm_description   = "Fires when API Gateway 4XX errors >= 20 in 5 minutes"
  comparison_operator = "GreaterThanOrEqualToThreshold"
  evaluation_periods  = 1
  threshold           = 20
  metric_name         = "4XXError"
  namespace           = "AWS/ApiGateway"
  period              = 300
  statistic           = "Sum"
  treat_missing_data  = "notBreaching"

  dimensions = {
    ApiName = "${var.project_name}-api"
    Stage   = var.api_gateway_stage
  }

  alarm_actions = [aws_sns_topic.alarm_notifications.arn]
  ok_actions    = [aws_sns_topic.alarm_notifications.arn]

  tags = {
    Project     = var.project_name
    Environment = var.environment
  }
}

# ---------------------------------------------------------------------------
# Alarm 5: API Gateway 5XX Errors (>= 5 in 5 min)
# ---------------------------------------------------------------------------
resource "aws_cloudwatch_metric_alarm" "api_5xx" {
  alarm_name          = "${var.project_name}-api-5xx"
  alarm_description   = "Fires when API Gateway 5XX errors >= 5 in 5 minutes"
  comparison_operator = "GreaterThanOrEqualToThreshold"
  evaluation_periods  = 1
  threshold           = 5
  metric_name         = "5XXError"
  namespace           = "AWS/ApiGateway"
  period              = 300
  statistic           = "Sum"
  treat_missing_data  = "notBreaching"

  dimensions = {
    ApiName = "${var.project_name}-api"
    Stage   = var.api_gateway_stage
  }

  alarm_actions = [aws_sns_topic.alarm_notifications.arn]
  ok_actions    = [aws_sns_topic.alarm_notifications.arn]

  tags = {
    Project     = var.project_name
    Environment = var.environment
  }
}

# =============================================================================
# PART C — CloudWatch Dashboard: ReviewPlus-Operations
# =============================================================================

resource "aws_cloudwatch_dashboard" "operations" {
  dashboard_name = "ReviewPulse-Operations"

  dashboard_body = jsonencode({
    widgets = [
      # ---- Widget 1: Lambda Invocations (all 4 functions) ----
      {
        type   = "metric"
        x      = 0
        y      = 0
        width  = 12
        height = 6
        properties = {
          title  = "Lambda Invocations"
          region = "ca-central-1"
          period = 300
          stat   = "Sum"
          view   = "timeSeries"
          stacked = false
          metrics = [
            ["AWS/Lambda", "Invocations", "FunctionName", "${var.project_name}-submit-review", { label = "submit-review" }],
            ["AWS/Lambda", "Invocations", "FunctionName", "${var.project_name}-get-insights", { label = "get-insights" }],
            ["AWS/Lambda", "Invocations", "FunctionName", "${var.project_name}-auth-otp", { label = "auth-otp" }],
            ["AWS/Lambda", "Invocations", "FunctionName", "${var.project_name}-ai-processor", { label = "ai-processor" }],
          ]
          yAxis = { left = { min = 0 } }
        }
      },

      # ---- Widget 2: Lambda Errors (all 4 functions) ----
      {
        type   = "metric"
        x      = 12
        y      = 0
        width  = 12
        height = 6
        properties = {
          title  = "Lambda Errors"
          region = "ca-central-1"
          period = 300
          stat   = "Sum"
          view   = "timeSeries"
          stacked = false
          metrics = [
            ["AWS/Lambda", "Errors", "FunctionName", "${var.project_name}-submit-review", { label = "submit-review" }],
            ["AWS/Lambda", "Errors", "FunctionName", "${var.project_name}-get-insights", { label = "get-insights" }],
            ["AWS/Lambda", "Errors", "FunctionName", "${var.project_name}-auth-otp", { label = "auth-otp" }],
            ["AWS/Lambda", "Errors", "FunctionName", "${var.project_name}-ai-processor", { label = "ai-processor" }],
          ]
          yAxis = { left = { min = 0 } }
        }
      },

      # ---- Widget 3: Lambda Duration (all 4 functions) ----
      {
        type   = "metric"
        x      = 0
        y      = 6
        width  = 12
        height = 6
        properties = {
          title  = "Lambda Duration (ms)"
          region = "ca-central-1"
          period = 300
          stat   = "Average"
          view   = "timeSeries"
          stacked = false
          metrics = [
            ["AWS/Lambda", "Duration", "FunctionName", "${var.project_name}-submit-review", { label = "submit-review" }],
            ["AWS/Lambda", "Duration", "FunctionName", "${var.project_name}-get-insights", { label = "get-insights" }],
            ["AWS/Lambda", "Duration", "FunctionName", "${var.project_name}-auth-otp", { label = "auth-otp" }],
            ["AWS/Lambda", "Duration", "FunctionName", "${var.project_name}-ai-processor", { label = "ai-processor" }],
          ]
          yAxis = { left = { min = 0, label = "ms" } }
        }
      },

      # ---- Widget 4: AI Processor Duration (Bedrock latency) ----
      {
        type   = "metric"
        x      = 12
        y      = 6
        width  = 12
        height = 6
        properties = {
          title  = "AI Processor Duration — Bedrock Latency (ms)"
          region = "ca-central-1"
          period = 60
          view   = "timeSeries"
          stacked = false
          metrics = [
            ["AWS/Lambda", "Duration", "FunctionName", "${var.project_name}-ai-processor", { stat = "Average", label = "Avg Duration" }],
            ["AWS/Lambda", "Duration", "FunctionName", "${var.project_name}-ai-processor", { stat = "Maximum", label = "Max Duration" }],
            ["AWS/Lambda", "Duration", "FunctionName", "${var.project_name}-ai-processor", { stat = "p99", label = "p99 Duration" }],
          ]
          yAxis = { left = { min = 0, label = "ms" } }
          annotations = {
            horizontal = [
              {
                label = "Timeout Warning (45s)"
                value = 45000
                color = "#ff6961"
              }
            ]
          }
        }
      },

      # ---- Widget 5: API Gateway Request Count ----
      {
        type   = "metric"
        x      = 0
        y      = 12
        width  = 12
        height = 6
        properties = {
          title  = "API Gateway — Request Count"
          region = "ca-central-1"
          period = 300
          stat   = "Sum"
          view   = "timeSeries"
          stacked = false
          metrics = [
            ["AWS/ApiGateway", "Count", "ApiName", "${var.project_name}-api", "Stage", var.api_gateway_stage, { label = "Total Requests" }],
          ]
          yAxis = { left = { min = 0 } }
        }
      },

      # ---- Widget 6: API Gateway 4XX & 5XX Errors ----
      {
        type   = "metric"
        x      = 12
        y      = 12
        width  = 12
        height = 6
        properties = {
          title  = "API Gateway — 4XX & 5XX Errors"
          region = "ca-central-1"
          period = 300
          stat   = "Sum"
          view   = "timeSeries"
          stacked = false
          metrics = [
            ["AWS/ApiGateway", "4XXError", "ApiName", "${var.project_name}-api", "Stage", var.api_gateway_stage, { label = "4XX Errors", color = "#ff9900" }],
            ["AWS/ApiGateway", "5XXError", "ApiName", "${var.project_name}-api", "Stage", var.api_gateway_stage, { label = "5XX Errors", color = "#ff0000" }],
          ]
          yAxis = { left = { min = 0 } }
        }
      },
    ]
  })
}
