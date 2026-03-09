#!/bin/bash
set -e

KV_NAMESPACE="49d682f5b56a4e7faef3cadc8b5035ea"
CHANGELOG_API_KEY="twn_RMVpLaP2abgCLMzV"

# Fetch and show the last deployed version
echo ""
echo "=== Hardware Tycoon Deploy ==="
echo ""
LAST_VERSION_JSON=$(npx wrangler kv key get --namespace-id "$KV_NAMESPACE" --remote "current" 2>/dev/null || echo "")
if [ -n "$LAST_VERSION_JSON" ]; then
  LAST_VER=$(echo "$LAST_VERSION_JSON" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('version','unknown'))" 2>/dev/null || echo "pre-versioning")
  LAST_CHANGELOG=$(echo "$LAST_VERSION_JSON" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('changelog',''))" 2>/dev/null || echo "")
  echo "  Last deployed version: $LAST_VER"
  if [ -n "$LAST_CHANGELOG" ]; then
    echo "  Last changelog:"
    echo "$LAST_CHANGELOG" | sed 's/^/    /'
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

# Prompt for title
read -p "  Title: " RELEASE_TITLE
if [ -z "$RELEASE_TITLE" ]; then
  echo "Error: Title cannot be empty."
  exit 1
fi

# Prompt for changelog (multi-line, empty line to finish)
echo "  Changelog (one change per line, empty line to finish):"
CHANGES_FILE=$(mktemp)
trap "rm -f $CHANGES_FILE" EXIT
while true; do
  read -p "  - " LINE
  if [ -z "$LINE" ]; then
    break
  fi
  echo "$LINE" >> "$CHANGES_FILE"
done

if [ ! -s "$CHANGES_FILE" ]; then
  echo "Error: Changelog cannot be empty."
  exit 1
fi

BUILD_ID=$(python3 -c 'import time; print(int(time.time()*1000))')
echo "$BUILD_ID" > .build_id

# Use python for all JSON generation (safe from shell escaping issues)
CHANGELOG_DISPLAY=$(python3 -c "
lines = open('$CHANGES_FILE').read().strip().splitlines()
print('\n'.join('- ' + l for l in lines))
")

echo ""
echo "  Version:   $NEW_VERSION"
echo "  Title:     $RELEASE_TITLE"
echo "  Changelog:"
echo "$CHANGELOG_DISPLAY" | sed 's/^/    /'
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
lines = open('$CHANGES_FILE').read().strip().splitlines()
changelog = '\n'.join('- ' + l for l in lines)
print(json.dumps({'version': '$NEW_VERSION', 'changelog': changelog, 'buildId': '$BUILD_ID'}))
")
echo "Updating version in KV..."
npx wrangler kv key put --namespace-id "$KV_NAMESPACE" --remote "current" "$VERSION_JSON"

# Push changelog to itwn.tech
echo "Publishing changelog..."
CHANGELOG_POST=$(python3 -c "
import json
lines = open('$CHANGES_FILE').read().strip().splitlines()
print(json.dumps({'game': 'ht-ce', 'version': '$NEW_VERSION', 'title': '$RELEASE_TITLE', 'changes': lines}))
")
curl -s -X POST https://itwn.tech/api/changelog \
  -H "Content-Type: application/json" \
  -H "x-api-key: $CHANGELOG_API_KEY" \
  -d "$CHANGELOG_POST" > /dev/null 2>&1 && echo "  Changelog published." || echo "  Warning: Failed to publish changelog (non-fatal)."

# Commit and push with version as message
echo "Committing and pushing..."
git add -A
git commit -m "$NEW_VERSION"
git push

echo ""
echo "Done! Deployed v$NEW_VERSION (build $BUILD_ID)"
echo ""
