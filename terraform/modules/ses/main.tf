# =============================================================================
# SES Email Identities
# =============================================================================

# Primary sender identity
resource "aws_ses_email_identity" "primary" {
  email = var.ses_from_email
}

# Secondary sender identity
resource "aws_ses_email_identity" "secondary" {
  email = var.ses_secondary_email
}

# =============================================================================
# NOTE: After running `terraform apply`, you MUST manually verify both email
# addresses by clicking the verification link that AWS sends to each inbox.
# SES will not send emails from unverified identities.
#
# If your account is still in the SES Sandbox, you must also verify every
# recipient address. Request Production Access via the AWS console to lift
# that restriction.
# =============================================================================

# =============================================================================
# SES Configuration Set — tracks reputation metrics (bounces, complaints)
# =============================================================================
resource "aws_ses_configuration_set" "this" {
  name = "${var.project_name}-email-config"

  reputation_metrics_enabled = true

  # Delivery options default to TLS "Optional" which is fine for dev
}

# =============================================================================
# Contact info (for reference in Lambda env vars / support flows)
# Phone: +91 8237407325
# =============================================================================
