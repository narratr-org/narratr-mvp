#!/bin/bash
# Usage: Set GITHUB_TOKEN env variable and run this script.
# This script archives item T-33 and updates labels & description for T-36.

set -euo pipefail

# GraphQL mutation to archive item from project
curl -s -H "Authorization: bearer $GITHUB_TOKEN" \
  -X POST https://api.github.com/graphql \
  -d '{"query":"mutation { archiveProjectV2Item(itemId:\"<ITEM_ID_T33>\") { item { id } } }"}'

# Append ops label for T-36
curl -s -H "Authorization: bearer $GITHUB_TOKEN" \
  -X POST https://api.github.com/graphql \
  -d '{"query":"mutation { updateProjectV2ItemFieldValue(input:{projectId:\"<PROJ_ID>\", itemId:\"<ITEM_ID_T36>\", fieldId:\"<LABEL_FIELD_ID>\", value:{ text:\"chore, ops, priority:P1\" }}) { item { id } } }"}'

# Update description for T-36
curl -s -H "Authorization: bearer $GITHUB_TOKEN" \
  -X POST https://api.github.com/graphql \
  -d '{"query":"mutation { updateProjectV2ItemFieldValue(input:{projectId:\"<PROJ_ID>\", itemId:\"<ITEM_ID_T36>\", fieldId:\"<DESCRIPTION_FIELD_ID>\", value:{ text:\"(+) 포함 내용\n• Sentry SDK...\n• Vercel Analytics...\" }}) { item { id } } }"}'
