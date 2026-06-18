#!/bin/bash
set -e

echo "🧹 Cleaning..."
rm -rf node_modules package-lock.json .expo

echo "📦 Installing (SDK 54)..."
npm install --legacy-peer-deps

echo "✅ Starting — scan QR with Expo Go..."
npx expo start
