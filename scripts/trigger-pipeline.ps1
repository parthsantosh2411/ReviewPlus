##############################################################################
# ReviewPulse — Pipeline Trigger Script (PowerShell)
#
# Packages the project source and uploads to S3 to trigger the
# CodePipeline → CodeBuild → Deploy flow.
#
# Usage:  .\scripts\trigger-pipeline.ps1
##############################################################################

$ErrorActionPreference = "Stop"

$PIPELINE_SOURCE_BUCKET = "reviewpulse-pipeline-source-742504ac"
$SOURCE_KEY = "source.zip"
$REGION = "ca-central-1"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  ReviewPulse — CI/CD Pipeline Trigger" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Navigate to project root
$ProjectRoot = "d:\Product-Review Plus"
Push-Location $ProjectRoot

try {
    Write-Host "[1/4] Preparing clean source..." -ForegroundColor Yellow

    $TmpDir = Join-Path $env:TEMP "reviewpulse-src"
    if (Test-Path $TmpDir) { Remove-Item $TmpDir -Recurse -Force }
    New-Item -ItemType Directory -Path $TmpDir -Force | Out-Null

    # Copy only what CodeBuild needs
    Copy-Item -Path "frontend\src" -Destination "$TmpDir\frontend\src" -Recurse
    Copy-Item -Path "frontend\public" -Destination "$TmpDir\frontend\public" -Recurse
    Copy-Item -Path "frontend\package.json" -Destination "$TmpDir\frontend\package.json"
    Copy-Item -Path "frontend\package-lock.json" -Destination "$TmpDir\frontend\package-lock.json"

    # Backend — only function source code (no zip artifacts)
    foreach ($fn in @("submit_review", "get_insights", "auth_otp", "ai_processor")) {
        $srcDir = "backend\functions\$fn"
        $destDir = "$TmpDir\backend\functions\$fn"
        New-Item -ItemType Directory -Path $destDir -Force | Out-Null
        Get-ChildItem -Path $srcDir -File | Where-Object { $_.Extension -in @(".py", ".txt", ".cfg", ".ini") } |
            Copy-Item -Destination $destDir
    }

    Copy-Item -Path "backend\requirements.txt" -Destination "$TmpDir\backend\requirements.txt" -ErrorAction SilentlyContinue
    Copy-Item -Path "buildspec.yml" -Destination "$TmpDir\buildspec.yml"

    Write-Host "[2/4] Creating zip archive..." -ForegroundColor Yellow

    $ZipPath = Join-Path $env:TEMP "reviewpulse-source.zip"
    if (Test-Path $ZipPath) { Remove-Item $ZipPath -Force }
    Compress-Archive -Path "$TmpDir\*" -DestinationPath $ZipPath -Force

    $SizeMB = [math]::Round((Get-Item $ZipPath).Length / 1MB, 2)
    Write-Host "   Package size: ${SizeMB} MB" -ForegroundColor Gray

    Write-Host "[3/4] Uploading to S3 (triggers pipeline)..." -ForegroundColor Yellow
    aws s3 cp $ZipPath "s3://${PIPELINE_SOURCE_BUCKET}/${SOURCE_KEY}" --region $REGION
    if ($LASTEXITCODE -ne 0) { throw "S3 upload failed" }

    Write-Host "[4/4] Cleaning up..." -ForegroundColor Yellow
    Remove-Item $TmpDir -Recurse -Force
    Remove-Item $ZipPath -Force

    Write-Host ""
    Write-Host "Pipeline triggered successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "   Pipeline:  reviewpulse-pipeline" -ForegroundColor Gray
    Write-Host "   Source:    s3://${PIPELINE_SOURCE_BUCKET}/${SOURCE_KEY}" -ForegroundColor Gray
    Write-Host ""
    Write-Host "   Monitor: https://${REGION}.console.aws.amazon.com/codesuite/codepipeline/pipelines/reviewpulse-pipeline/view?region=${REGION}" -ForegroundColor Blue
    Write-Host ""
    Write-Host "   Check status: aws codepipeline get-pipeline-state --name reviewpulse-pipeline --region ${REGION}" -ForegroundColor DarkGray
    Write-Host ""

} finally {
    Pop-Location
}
