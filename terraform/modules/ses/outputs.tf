output "ses_primary_email_identity_arn" {
  description = "ARN of the primary SES email identity"
  value       = aws_ses_email_identity.primary.arn
}

output "ses_secondary_email_identity_arn" {
  description = "ARN of the secondary SES email identity"
  value       = aws_ses_email_identity.secondary.arn
}

output "ses_configuration_set_name" {
  description = "Name of the SES configuration set"
  value       = aws_ses_configuration_set.this.name
}
