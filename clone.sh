#!/usr/bin/env bash
# Fullstack template clone (Turborepo + Bun, React web, Expo mobile, Hono API on Cloudflare Workers + D1)
# Usage:
#   curl -fsSL https://raw.githubusercontent.com/purplem0n/fullstack-template/main/clone.sh | bash
#   curl -fsSL https://raw.githubusercontent.com/purplem0n/fullstack-template/main/clone.sh | bash -s my-app
# Non-interactive (CI/agents): pass answers as env vars, see setup.sh.

set -euo pipefail

REPO_URL="${TEMPLATE_REPO_URL:-https://github.com/purplem0n/fullstack-template.git}"
BRANCH="${TEMPLATE_BRANCH:-main}"

# Prompts read from the terminal, since stdin is the piped script.
ask() { # ask VAR "Question" "default"
  local __var=$1 __q=$2 __def=${3:-} __ans=""
  if [ -n "${!__var:-}" ]; then return; fi
  if [ -r /dev/tty ]; then
    read -r -p "$__q${__def:+ [$__def]}: " __ans 2>/dev/null </dev/tty || true
  fi
  printf -v "$__var" '%s' "${__ans:-$__def}"
}

echo "Fullstack template"
echo "=================="
echo

for cmd in git bun; do
  if ! command -v "$cmd" >/dev/null 2>&1; then
    echo "Error: $cmd is required."
    [ "$cmd" = bun ] && echo "Install it: curl -fsSL https://bun.sh/install | bash"
    exit 1
  fi
done

TARGET_DIR="${1:-${TARGET_DIR:-}}"
ask TARGET_DIR "Folder name for the new project" "my-app"
if [ -z "$TARGET_DIR" ]; then echo "Error: folder name is required."; exit 1; fi

if [ -d "$TARGET_DIR" ] && [ -n "$(ls -A "$TARGET_DIR" 2>/dev/null)" ]; then
  echo "Error: '$TARGET_DIR' already exists and is not empty."
  exit 1
fi

echo "Cloning template into '$TARGET_DIR'..."
git clone --quiet --depth 1 --branch "$BRANCH" "$REPO_URL" "$TARGET_DIR"
cd "$TARGET_DIR"
rm -rf .git

if [ ! -f setup.sh ]; then echo "Error: setup.sh not found in the template."; exit 1; fi
TARGET_DIR="$TARGET_DIR" bash setup.sh
