#!/bin/bash
set -e

echo "📥 Pulling latest code..."
git pull

echo "🧹 Cleaning..."
rm -rf node_modules package-lock.json .expo
npm cache clean --force 2>/dev/null || true

echo "📦 Installing (this pins expo CLI to SDK 54 locally)..."
npm install --legacy-peer-deps

echo "✅ Starting with LOCAL expo (SDK 54 to match your Expo Go)..."
# Use ./node_modules/.bin/expo instead of npx expo
# npx expo pulls SDK 57 globally; local node_modules has SDK 54
./node_modules/.bin/expo start
