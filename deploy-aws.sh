#!/bin/bash

set -e

# Check if required tools are installed
command -v terraform >/dev/null 2>&1 || { echo "Terraform is required but not installed. Aborting." >&2; exit 1; }
command -v aws >/dev/null 2>&1 || { echo "AWS CLI is required but not installed. Aborting." >&2; exit 1; }

# Check if GEMINI_API_KEY is set
if [ -z "$TF_VAR_gemini_api_key" ]; then
    echo "Error: TF_VAR_gemini_api_key environment variable is not set."
    echo "Please run: export TF_VAR_gemini_api_key='your-api-key-here'"
    exit 1
fi

echo "Building React app..."
npm run build

echo "Preparing Lambda deployment..."
cd lambda
npm install --production
zip -r ../terraform/lambda-deployment.zip . -x "*.git*" "node_modules/.cache/*"
cd ..

echo "Deploying infrastructure with Terraform..."
cd terraform
terraform init
terraform plan
terraform apply -auto-approve

echo "Uploading frontend to S3..."
BUCKET_NAME=$(terraform output -raw frontend_url | sed 's/.*\/\/\([^.]*\).*/\1/')
aws s3 sync ../dist/ s3://$BUCKET_NAME/ --delete

echo "Deployment complete!"
echo "Frontend URL: $(terraform output -raw frontend_url)"
echo "API URL: $(terraform output -raw api_url)"
echo ""
echo "Update your React app to use the API URL above."