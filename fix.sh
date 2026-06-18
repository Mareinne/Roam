#!/bin/bash
set -e
echo "📥 Pulling latest code..."
git pull

echo "🧹 Nuking everything..."
rm -rf node_modules .expo
# Clear all caches
npm cache clean --force 2>/dev/null || true
rm -rf /tmp/metro-* /tmp/haste-* ~/Library/Caches/com.facebook.ReactNativeBuild 2>/dev/null || true

echo "📦 Installing from lockfile (exact versions, no surprises)..."
npm ci --legacy-peer-deps

echo "✅ Starting Expo..."
npx expo start
