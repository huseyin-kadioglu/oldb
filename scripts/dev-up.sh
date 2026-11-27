#!/usr/bin/env bash
# Start shared Postgres assumptions + API + Expo for local OLDB.
# Layout (single workspace / clone):
#   oldb/                 ← this repository root
#     oldb-backend/       ← Spring Boot + PostgreSQL
#     flixly-fe/          ← web
#     oldb-mobile/        ← Expo mobile
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "==> OLDB workspace: $ROOT"

if ! pg_isready -h localhost -p 5432 >/dev/null 2>&1; then
  echo "PostgreSQL is not running on localhost:5432"
  echo "Start it (Docker): docker compose up -d"
  echo "Or local: sudo pg_ctlcluster 16 main start"
  exit 1
fi

echo "==> API: oldb-backend (http://localhost:8080)"
(cd "$ROOT/oldb-backend" && ./mvnw spring-boot:run) &
API_PID=$!

echo "==> Mobile: oldb-mobile (Expo)"
if [[ ! -f "$ROOT/oldb-mobile/.env" ]]; then
  cp "$ROOT/oldb-mobile/.env.example" "$ROOT/oldb-mobile/.env"
fi
# Same machine: localhost is fine for web/Expo web; phones need LAN IP in .env
(cd "$ROOT/oldb-mobile" && npx expo start --lan) &
MOBILE_PID=$!

trap 'kill $API_PID $MOBILE_PID 2>/dev/null || true' EXIT
wait
