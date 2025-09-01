#!/bin/bash
set -e

WHISPER_DIR="node_modules/nodejs-whisper/cpp/whisper.cpp"
BUILD_DIR="$WHISPER_DIR/build"

echo "🔧 Building whisper.cpp inside $WHISPER_DIR ..."

# Ensure directory exists
if [ ! -d "$WHISPER_DIR" ]; then
  echo "❌ Error: $WHISPER_DIR not found. Did you install nodejs-whisper?"
  exit 1
fi

# Clean old build if exists
rm -rf "$BUILD_DIR"
mkdir -p "$BUILD_DIR"
cd "$BUILD_DIR"

# Run CMake + Make
cmake ..
make -j$(nproc)

# Verify binary
if [ -f "$BUILD_DIR/bin/whisper-cli" ]; then
  echo "✅ whisper-cli built successfully: $BUILD_DIR/bin/whisper-cli"
else
  echo "❌ Build failed. whisper-cli not found."
  exit 1
fi
