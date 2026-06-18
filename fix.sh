#!/bin/bash
set -e
echo "📥 Pulling latest..."
git pull

echo "🧹 Cleaning node_modules and caches..."
rm -rf node_modules .expo
npm cache clean --force 2>/dev/null || true
rm -rf /tmp/metro-* /tmp/haste-* 2>/dev/null || true

echo "📦 Installing exact versions from lockfile..."
npm ci --legacy-peer-deps

echo "✅ Starting Expo — scan QR with Expo Go..."
npx expo start
