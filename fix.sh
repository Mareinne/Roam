#!/bin/bash
set -e

echo "🧹 Cleaning..."
rm -rf node_modules package-lock.json .expo

echo "📦 Installing..."
npm install --legacy-peer-deps

echo "✅ Starting Expo (no account needed)..."
npx expo start
