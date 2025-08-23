#!/bin/bash

if [ -z "$1" ]; then
    echo "Usage: $0 <api-gateway-url>"
    echo "Example: $0 https://abc123.execute-api.us-east-1.amazonaws.com/prod"
    exit 1
fi

API_URL="$1"

# Update vite.config.ts to use the deployed API
sed -i.bak "s|target: 'http://localhost:3001'|target: '$API_URL'|g" vite.config.ts

echo "Updated vite.config.ts to use API URL: $API_URL"
echo "For production builds, make sure to update your fetch calls to use the full API URL."