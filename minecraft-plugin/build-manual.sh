#!/usr/bin/env bash
set -euo pipefail

PLUGIN_DIR="$(cd "$(dirname "$0")" && pwd)"
BUILD_DIR="$PLUGIN_DIR/build/manual"
CLASSES_DIR="$BUILD_DIR/classes"
TARGET_DIR="$PLUGIN_DIR/target"
JAR_PATH="$TARGET_DIR/MineFiveBridge-1.2.0.jar"

rm -rf "$BUILD_DIR"
mkdir -p "$CLASSES_DIR" "$TARGET_DIR"

mapfile -t STUB_SOURCES < <(find "$PLUGIN_DIR/compile-stubs" -name '*.java' -print | sort)
mapfile -t PLUGIN_SOURCES < <(find "$PLUGIN_DIR/src/main/java" -name '*.java' -print | sort)

javac --release 21 -encoding UTF-8 -d "$CLASSES_DIR" "${STUB_SOURCES[@]}" "${PLUGIN_SOURCES[@]}"

# Stub hanya dipakai untuk kompilasi offline. Paper menyediakan class asli saat runtime.
rm -rf "$CLASSES_DIR/org"
cp -R "$PLUGIN_DIR/src/main/resources/." "$CLASSES_DIR/"

jar --create --file "$JAR_PATH" -C "$CLASSES_DIR" .

echo "Plugin berhasil dibuild: $JAR_PATH"
