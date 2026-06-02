#!/bin/bash
cd "$(dirname "$0")"

export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

exec npm run dev -- --host 127.0.0.1 --port 5175 --clearScreen false --logLevel warn
