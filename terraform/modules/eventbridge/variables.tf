variable "project_name" {
  description = "Name of the project"
  type        = string
}

variable "environment" {
  description = "Deployment environment"
  type        = string
}

variable "feedback_table_stream_arn" {
  description = "ARN of the DynamoDB Streams for the feedback table"
  type        = string
}

variable "ai_processor_function_arn" {
  description = "ARN of the AI processor Lambda function"
  type        = string
}
