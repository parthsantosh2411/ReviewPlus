#!/bin/bash
##############################################################################
# ReviewPulse — Pipeline Trigger Script
#
# Zips the project source code and uploads to S3, which triggers the
# CodePipeline → CodeBuild → Deploy flow automatically.
#
# Usage:
#   chmod +x trigger-pipeline.sh
#   ./trigger-pipeline.sh
#
# Or on Windows (PowerShell):
#   .\trigger-pipeline.ps1
##############################################################################

set -euo pipefail

PIPELINE_SOURCE_BUCKET="reviewpulse-pipeline-source-742504ac"
SOURCE_KEY="source.zip"
REGION="ca-central-1"

echo "========================================"
echo "  ReviewPulse — CI/CD Pipeline Trigger"
echo "========================================"
echo ""

# Navigate to project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_ROOT"

echo "[1/3] Packaging source code..."

# Create a clean zip excluding non-essential files
zip -r /tmp/source.zip . \
  -x ".git/*" \
  -x "node_modules/*" \
  -x "frontend/node_modules/*" \
  -x "frontend/build/*" \
  -x "build/*" \
  -x ".terraform/*" \
  -x "*.tfstate*" \
  -x "__pycache__/*" \
  -x "*.pyc" \
  -x ".env" \
  -x "terraform/.terraform/*" \
  -x "terraform/*.tfstate*" \
  -x "terraform/.terraform.lock.hcl" \
  -x "terraform/reviewpulse.tfplan"

echo "[2/3] Uploading to S3 (triggers pipeline)..."
aws s3 cp /tmp/source.zip "s3://${PIPELINE_SOURCE_BUCKET}/${SOURCE_KEY}" --region "$REGION"

echo "[3/3] Cleaning up..."
rm -f /tmp/source.zip

echo ""
echo "✅ Pipeline triggered!"
echo "   Source:   s3://${PIPELINE_SOURCE_BUCKET}/${SOURCE_KEY}"
echo "   Pipeline: reviewpulse-pipeline"
echo ""
echo "   Monitor in AWS Console:"
echo "   https://${REGION}.console.aws.amazon.com/codesuite/codepipeline/pipelines/reviewpulse-pipeline/view?region=${REGION}"
echo ""
