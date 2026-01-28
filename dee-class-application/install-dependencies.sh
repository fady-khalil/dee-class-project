#!/bin/bash

echo "Installing dependencies for offline mode feature..."

# Install expo-crypto and expo-av
npx expo install expo-crypto expo-av

# Clean and rebuild
echo "Cleaning and rebuilding the project..."
npx expo prebuild --clean

echo "Installing node modules..."
npm install

echo "Dependencies installed successfully!"
echo "Run 'npx expo start -c' to start the development server with a clean cache."
echo "For Android: 'npx expo run:android'"
echo "For iOS: 'npx expo run:ios'" 