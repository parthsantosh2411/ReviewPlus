variable "project_name" {
  description = "Name of the project"
  type        = string
}

variable "environment" {
  description = "Deployment environment"
  type        = string
}

variable "s3_website_endpoint" {
  description = "S3 website endpoint domain (without http://), e.g. bucket.s3-website.region.amazonaws.com"
  type        = string
}
