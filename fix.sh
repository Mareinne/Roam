#!/bin/bash
set -e
git pull
rm -rf node_modules package-lock.json .expo
npm cache clean --force 2>/dev/null || true
npm install --legacy-peer-deps
./node_modules/.bin/expo start --clear
