#!/bin/bash
set -e

# Generate a build ID and save it for later
BUILD_ID=$(python3 -c 'import time; print(int(time.time()*1000))')
echo "$BUILD_ID" > .build_id

# Build the project with the build ID injected
echo "Building (ID: $BUILD_ID)..."
VITE_BUILD_ID="$BUILD_ID" npx vite build

# Deploy to Cloudflare Workers
echo "Deploying..."
npx wrangler deploy

# Update the version in KV
echo "Updating version in KV..."
npx wrangler kv key put --namespace-id 49d682f5b56a4e7faef3cadc8b5035ea --remote "current" "$BUILD_ID"

echo "Done! Deployed with build ID: $BUILD_ID"
