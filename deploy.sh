#!/bin/bash
set -e

KV_NAMESPACE="49d682f5b56a4e7faef3cadc8b5035ea"

# Fetch and show the last deployed version
echo ""
echo "=== Hardware Tycoon Deploy ==="
echo ""
LAST_VERSION_JSON=$(npx wrangler kv key get --namespace-id "$KV_NAMESPACE" --remote "current" 2>/dev/null || echo "")
if [ -n "$LAST_VERSION_JSON" ]; then
  # Try to parse as JSON (new format), fall back to raw build ID (old format)
  LAST_VER=$(echo "$LAST_VERSION_JSON" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('version','unknown'))" 2>/dev/null || echo "pre-versioning")
  LAST_CHANGELOG=$(echo "$LAST_VERSION_JSON" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('changelog',''))" 2>/dev/null || echo "")
  echo "  Last deployed version: $LAST_VER"
  if [ -n "$LAST_CHANGELOG" ]; then
    echo "  Last changelog: $LAST_CHANGELOG"
  fi
else
  echo "  No previous version found."
fi

echo ""

# Prompt for new version
read -p "  New version: " NEW_VERSION
if [ -z "$NEW_VERSION" ]; then
  echo "Error: Version cannot be empty."
  exit 1
fi

# Prompt for changelog
echo "  Changelog (press Enter when done):"
read -p "  > " CHANGELOG
if [ -z "$CHANGELOG" ]; then
  echo "Error: Changelog cannot be empty."
  exit 1
fi

BUILD_ID=$(python3 -c 'import time; print(int(time.time()*1000))')
echo "$BUILD_ID" > .build_id

echo ""
echo "  Version:   $NEW_VERSION"
echo "  Changelog: $CHANGELOG"
echo "  Build ID:  $BUILD_ID"
echo ""

# Build
echo "Building..."
VITE_BUILD_ID="$BUILD_ID" VITE_APP_VERSION="$NEW_VERSION" npx vite build

# Deploy
echo "Deploying..."
npx wrangler deploy

# Store version info as JSON in KV
VERSION_JSON=$(python3 -c "
import json
print(json.dumps({
    'version': '''$NEW_VERSION''',
    'changelog': '''$CHANGELOG''',
    'buildId': '''$BUILD_ID'''
}))
")
echo "Updating version in KV..."
npx wrangler kv key put --namespace-id "$KV_NAMESPACE" --remote "current" "$VERSION_JSON"

# Commit and push with version as message
echo "Committing and pushing..."
git add -A
git commit -m "$NEW_VERSION"
git push

echo ""
echo "Done! Deployed v$NEW_VERSION (build $BUILD_ID)"
echo ""
