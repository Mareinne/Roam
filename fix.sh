#!/bin/bash
set -e

echo "🧹 Cleaning old install..."
rm -rf node_modules
rm -f package-lock.json

echo "📦 Installing with legacy peer deps..."
npm install --legacy-peer-deps

echo "✅ Done. Starting Expo..."
npx expo start --clear
