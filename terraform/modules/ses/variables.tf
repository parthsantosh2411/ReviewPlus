variable "project_name" {
  description = "Name of the project"
  type        = string
}

variable "environment" {
  description = "Deployment environment"
  type        = string
}

variable "ses_from_email" {
  description = "Primary verified SES sender email address"
  type        = string
  default     = "tripathiparth2411@gmail.com"
}

variable "ses_secondary_email" {
  description = "Secondary verified SES sender email address"
  type        = string
  default     = "parthtripathi2411@gmail.com"
}
