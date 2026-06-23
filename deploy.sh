#!/bin/bash
# Otter Pizza Deploy Script
# Run on the production server to pull, build, and restart.
# Usage: ssh root@45.77.172.222 "bash /opt/otterpizza/deploy.sh"

set -e
cd /opt/otterpizza

echo "=== Pulling latest ==="
git pull

echo "=== Prisma generate (Linux binary) ==="
npx prisma generate

echo "=== Push schema to DB ==="
npx prisma db push --skip-generate

echo "=== Building ==="
NODE_OPTIONS='--max-old-space-size=640' npm run build

echo "=== Restarting ==="
pm2 restart otterpizza

echo "=== Deploy complete ==="
pm2 status
