#!/bin/sh
set -eu

bar_root=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
if ! command -v node >/dev/null 2>&1; then
  printf '%s\n' 'Node.js 20 or later is needed to start the menu.' >&2
  exit 1
fi

cd "$bar_root"
exec node scripts/serve.mjs "$@"
