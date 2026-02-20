# =============================================================================
# Variables for the X-Ray & CloudWatch Observability Module
# =============================================================================

variable "project_name" {
  description = "Project name prefix used for all resource naming"
  type        = string
  default     = "reviewpulse"
}

variable "environment" {
  description = "Deployment environment (dev, staging, prod)"
  type        = string
  default     = "dev"
}

variable "api_gateway_id" {
  description = "ID of the API Gateway REST API"
  type        = string
}

variable "api_gateway_stage" {
  description = "API Gateway stage name (e.g. dev)"
  type        = string
  default     = "dev"
}

variable "notification_email" {
  description = "Email address for CloudWatch alarm notifications via SNS"
  type        = string
  default     = "tripathiparth2411@gmail.com"
}
