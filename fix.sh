#!/bin/bash
set -e
echo "📥 Pulling latest..."
git pull

echo "🧹 Removing node_modules completely..."
rm -rf node_modules package-lock.json .expo
npm cache clean --force 2>/dev/null || true

echo "📦 Fresh install from scratch..."
npm install --legacy-peer-deps

echo "✅ Starting Expo (SDK 54 local CLI)..."
./node_modules/.bin/expo start
