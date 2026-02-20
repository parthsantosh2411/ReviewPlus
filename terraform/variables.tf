variable "aws_region" {
  description = "AWS region to deploy resources"
  type        = string
  default     = "ca-central-1"
}

variable "project_name" {
  description = "Name of the project"
  type        = string
  default     = "reviewpulse"
}

variable "environment" {
  description = "Deployment environment"
  type        = string
  default     = "dev"
}

variable "brands" {
  description = "List of brand identifiers"
  type        = list(string)
  default     = ["brand1", "brand2", "brand3", "brand4"]
}
