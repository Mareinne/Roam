#!/bin/bash
set -e

echo "🧹 Cleaning old install..."
rm -rf node_modules package-lock.json .expo

echo "📦 Installing..."
npm install --legacy-peer-deps

echo "✅ Done. Starting Expo..."
npx expo start --no-dev --tunnel
