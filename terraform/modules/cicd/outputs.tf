# =============================================================================
# CICD Module Outputs
# =============================================================================

output "codepipeline_name" {
  description = "Name of the CodePipeline"
  value       = aws_codepipeline.reviewpulse.name
}

output "codepipeline_arn" {
  description = "ARN of the CodePipeline"
  value       = aws_codepipeline.reviewpulse.arn
}

output "codebuild_project_name" {
  description = "Name of the CodeBuild project"
  value       = aws_codebuild_project.reviewpulse.name
}

output "codebuild_project_arn" {
  description = "ARN of the CodeBuild project"
  value       = aws_codebuild_project.reviewpulse.arn
}

output "pipeline_source_bucket" {
  description = "S3 bucket for pipeline source zip uploads"
  value       = aws_s3_bucket.pipeline_source.bucket
}

output "pipeline_artifacts_bucket" {
  description = "Name of the pipeline artifacts S3 bucket"
  value       = aws_s3_bucket.pipeline_artifacts.bucket
}
