#!/usr/bin/env bash
# Renames the template for a new project. Run from the project root (clone.sh does this for you).
# Every answer can be preset with an env var to skip its prompt:
#   PROJECT_NAME  kebab-case id used for packages, the Worker, the D1 DB, the Expo slug and URL scheme
#   DISPLAY_NAME  human name shown in the app, browser tab and home screen
#   IOS_BUNDLE_ID reverse-DNS iOS bundle identifier, e.g. com.acme.myapp
#   ANDROID_PACKAGE Android application id (defaults to IOS_BUNDLE_ID with dashes removed)
#   WORKERS_SUBDOMAIN your account's workers.dev subdomain, e.g. purplemon (blank keeps a placeholder)
#   SKIP_INSTALL=1 skip `bun install`;  SKIP_GIT=1 skip `git init` + first commit

set -euo pipefail
cd "$(dirname "$0")"

ask() {
  local __var=$1 __q=$2 __def=${3:-} __ans=""
  if [ -n "${!__var:-}" ]; then return; fi
  if [ -r /dev/tty ]; then
    read -r -p "$__q${__def:+ [$__def]}: " __ans 2>/dev/null </dev/tty || true
  fi
  printf -v "$__var" '%s' "${__ans:-$__def}"
}

slugify() { echo "$1" | tr '[:upper:]' '[:lower:]' | sed -E 's/[^a-z0-9]+/-/g; s/^-+|-+$//g'; }
titleize() { echo "$1" | sed -E 's/[-_]+/ /g' | awk '{for(i=1;i<=NF;i++)$i=toupper(substr($i,1,1)) substr($i,2)}1'; }

DIR_NAME="$(basename "${TARGET_DIR:-$PWD}")"
ask PROJECT_NAME "Project name (kebab-case)" "$(slugify "$DIR_NAME")"
PROJECT_NAME="$(slugify "$PROJECT_NAME")"
ask DISPLAY_NAME "App display name" "$(titleize "$PROJECT_NAME")"
ask IOS_BUNDLE_ID "iOS bundle identifier" "com.example.$(echo "$PROJECT_NAME" | tr -d '-')"
ask ANDROID_PACKAGE "Android package name" "$(echo "$IOS_BUNDLE_ID" | tr -d '-')"
ask WORKERS_SUBDOMAIN "Cloudflare workers.dev subdomain (e.g. purplemon for purplemon.workers.dev, blank to set later)" ""
WORKERS_SUBDOMAIN="$(echo "$WORKERS_SUBDOMAIN" | sed -E 's#^https?://##; s#/.*$##; s#\.workers\.dev$##' | tr '[:upper:]' '[:lower:]')"
if [ -n "$WORKERS_SUBDOMAIN" ] && ! [[ "$WORKERS_SUBDOMAIN" =~ ^[a-z0-9][a-z0-9-]*$ ]]; then echo "Error: invalid workers.dev subdomain '$WORKERS_SUBDOMAIN'."; exit 1; fi
API_URL="https://$PROJECT_NAME-api.${WORKERS_SUBDOMAIN:-YOUR-SUBDOMAIN}.workers.dev"

if ! [[ "$PROJECT_NAME" =~ ^[a-z][a-z0-9-]*$ ]]; then echo "Error: invalid project name '$PROJECT_NAME'."; exit 1; fi
if ! [[ "$IOS_BUNDLE_ID" =~ ^[A-Za-z][A-Za-z0-9-]*(\.[A-Za-z0-9-]+)+$ ]]; then echo "Error: invalid iOS bundle id '$IOS_BUNDLE_ID'."; exit 1; fi
if ! [[ "$ANDROID_PACKAGE" =~ ^[a-zA-Z][a-zA-Z0-9_]*(\.[a-zA-Z][a-zA-Z0-9_]*)+$ ]]; then
  echo "Error: invalid Android package '$ANDROID_PACKAGE' (letters, digits, underscores; each part starts with a letter)."; exit 1
fi

echo
echo "  Project name:    $PROJECT_NAME"
echo "  Display name:    $DISPLAY_NAME"
echo "  iOS bundle id:   $IOS_BUNDLE_ID"
echo "  Android package: $ANDROID_PACKAGE"
echo "  Production API:  $API_URL"
echo

export PROJECT_NAME DISPLAY_NAME IOS_BUNDLE_ID ANDROID_PACKAGE WORKERS_SUBDOMAIN
bun --eval '
const fs = require("node:fs");
const { PROJECT_NAME: p, DISPLAY_NAME: d, IOS_BUNDLE_ID: ios, ANDROID_PACKAGE: android } = process.env;
const edit = (file, fn) => { if (fs.existsSync(file)) fs.writeFileSync(file, fn(fs.readFileSync(file, "utf8"))); };
const json = (file, fn) => edit(file, (s) => { const o = JSON.parse(s); fn(o); return JSON.stringify(o, null, 2) + "\n"; });

json("package.json", (o) => { o.name = p; });
json("apps/mobile/app.json", ({ expo }) => {
  expo.name = d; expo.slug = p; expo.scheme = p;
  expo.ios = { ...expo.ios, bundleIdentifier: ios };
  expo.android = { ...expo.android, package: android };
});
const sub = process.env.WORKERS_SUBDOMAIN;
const swap = (s) => {
  s = s.replaceAll("fullstack-template", p).replaceAll("Fullstack Template", d);
  return sub ? s.replaceAll("YOUR-SUBDOMAIN", sub) : s;
};
for (const f of ["apps/web/wrangler.jsonc", "apps/mobile/.env.production", "AGENTS.md", "README.md",
  "apps/web/app/routes/home.tsx", "apps/mobile/src/app/_layout.tsx"]) edit(f, swap);
edit("README.md", (s) => s.replace(/\n## Using this as a template[\s\S]*?(?=\n## |$)/, "\n"));
'

# Local secrets file for the Worker (gitignored).
[ -f apps/web/.dev.vars ] || cp apps/web/.dev.vars.example apps/web/.dev.vars

rm -f clone.sh setup.sh

if [ -z "${SKIP_INSTALL:-}" ]; then
  echo "Installing dependencies..."
  bun install
fi

if [ -z "${SKIP_GIT:-}" ]; then
  git init --quiet
  git add -A
  git commit --quiet -m "Initial commit from fullstack template" || true
fi

echo
echo "Done. Next:"
echo "  cd ${TARGET_DIR:-.}"
echo "  bun run dev        # API + web + mobile"
echo "  See AGENTS.md > First deploy before deploying."
