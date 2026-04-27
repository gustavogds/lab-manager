#!/bin/bash
cd "$(dirname "$0")"
exec /usr/bin/npm run dev -- --host 127.0.0.1 --port 5175 --clearScreen false --logLevel warn
