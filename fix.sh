#!/bin/bash
set -e

echo "🧹 Full clean (node_modules, caches, metro)..."
rm -rf node_modules package-lock.json .expo
# Clear Metro bundler cache
rm -rf /tmp/metro-* /tmp/haste-* 2>/dev/null || true
# Clear npm cache for these packages  
npm cache clean --force 2>/dev/null || true

echo "📦 Installing (SDK 54, no reanimated)..."
npm install --legacy-peer-deps

echo "✅ Starting Expo..."
npx expo start
