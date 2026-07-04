#!/bin/bash
set -e

echo "🚀 Setting up Roam from scratch..."

# 1. Install with npx expo install (Expo's own resolver)
rm -rf node_modules package-lock.json .expo

echo "📦 Installing with Expo's resolver..."
npx expo install --fix 2>/dev/null || npm install --legacy-peer-deps

echo "✅ Starting..."
npx expo start
