#!/usr/bin/env bash
# Update the master list: edit master.json, then run ./publish.sh
# Asks for the site password, re-encrypts master.json, commits and pushes.
set -euo pipefail
cd "$(dirname "$0")"
[ -f master.json ] || { echo "master.json not found"; exit 1; }
read -rsp "Site password: " BPC_PASSWORD; echo
export BPC_PASSWORD
node tools/encrypt.mjs
git add -A
if git diff --cached --quiet; then echo "Nothing to publish."; exit 0; fi
git commit -q -m "Update master list ($(date +%F))"
git push -q
echo "Pushed. Live in about a minute."
