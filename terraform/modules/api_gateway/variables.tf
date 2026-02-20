variable "project_name" {
  description = "Name of the project"
  type        = string
}

variable "environment" {
  description = "Deployment environment"
  type        = string
}

variable "submit_review_function_arn" {
  description = "ARN of the submit-review Lambda function"
  type        = string
}

variable "submit_review_function_name" {
  description = "Name of the submit-review Lambda function"
  type        = string
}

variable "get_insights_function_arn" {
  description = "ARN of the get-insights Lambda function"
  type        = string
}

variable "get_insights_function_name" {
  description = "Name of the get-insights Lambda function"
  type        = string
}

variable "auth_otp_function_arn" {
  description = "ARN of the auth-otp Lambda function"
  type        = string
}

variable "auth_otp_function_name" {
  description = "Name of the auth-otp Lambda function"
  type        = string
}
