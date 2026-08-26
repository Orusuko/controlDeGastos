#!/usr/bin/env bash
# Genera iconos y splash de Android a partir de los SVG en resources/.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
RES="$ROOT/android/app/src/main/res"

rsvg() {
  rsvg-convert "$@"
}

# Legacy launcher (API 24-25)
rsvg -w 48  -h 48  "$ROOT/resources/icon.svg"       -o "$RES/mipmap-mdpi/ic_launcher.png"
rsvg -w 72  -h 72  "$ROOT/resources/icon.svg"       -o "$RES/mipmap-hdpi/ic_launcher.png"
rsvg -w 96  -h 96  "$ROOT/resources/icon.svg"       -o "$RES/mipmap-xhdpi/ic_launcher.png"
rsvg -w 144 -h 144 "$ROOT/resources/icon.svg"       -o "$RES/mipmap-xxhdpi/ic_launcher.png"
rsvg -w 192 -h 192 "$ROOT/resources/icon.svg"       -o "$RES/mipmap-xxxhdpi/ic_launcher.png"

rsvg -w 48  -h 48  "$ROOT/resources/icon-round.svg" -o "$RES/mipmap-mdpi/ic_launcher_round.png"
rsvg -w 72  -h 72  "$ROOT/resources/icon-round.svg" -o "$RES/mipmap-hdpi/ic_launcher_round.png"
rsvg -w 96  -h 96  "$ROOT/resources/icon-round.svg" -o "$RES/mipmap-xhdpi/ic_launcher_round.png"
rsvg -w 144 -h 144 "$ROOT/resources/icon-round.svg" -o "$RES/mipmap-xxhdpi/ic_launcher_round.png"
rsvg -w 192 -h 192 "$ROOT/resources/icon-round.svg" -o "$RES/mipmap-xxxhdpi/ic_launcher_round.png"

# Adaptive foreground (capa transparente)
rsvg -w 108 -h 108 "$ROOT/resources/icon-foreground.svg" -o "$RES/mipmap-mdpi/ic_launcher_foreground.png"
rsvg -w 162 -h 162 "$ROOT/resources/icon-foreground.svg" -o "$RES/mipmap-hdpi/ic_launcher_foreground.png"
rsvg -w 216 -h 216 "$ROOT/resources/icon-foreground.svg" -o "$RES/mipmap-xhdpi/ic_launcher_foreground.png"
rsvg -w 324 -h 324 "$ROOT/resources/icon-foreground.svg" -o "$RES/mipmap-xxhdpi/ic_launcher_foreground.png"
rsvg -w 432 -h 432 "$ROOT/resources/icon-foreground.svg" -o "$RES/mipmap-xxxhdpi/ic_launcher_foreground.png"

# Splash a pantalla completa (púrpura + símbolo)
rsvg -w 320  -h 480  "$ROOT/resources/splash.svg" -o "$RES/drawable-port-mdpi/splash.png"
rsvg -w 480  -h 800  "$ROOT/resources/splash.svg" -o "$RES/drawable-port-hdpi/splash.png"
rsvg -w 720  -h 1280 "$ROOT/resources/splash.svg" -o "$RES/drawable-port-xhdpi/splash.png"
rsvg -w 1080 -h 1920 "$ROOT/resources/splash.svg" -o "$RES/drawable-port-xxhdpi/splash.png"
rsvg -w 1440 -h 2560 "$ROOT/resources/splash.svg" -o "$RES/drawable-port-xxxhdpi/splash.png"

rsvg -w 480  -h 320  "$ROOT/resources/splash.svg" -o "$RES/drawable-land-mdpi/splash.png"
rsvg -w 800  -h 480  "$ROOT/resources/splash.svg" -o "$RES/drawable-land-hdpi/splash.png"
rsvg -w 1280 -h 720  "$ROOT/resources/splash.svg" -o "$RES/drawable-land-xhdpi/splash.png"
rsvg -w 1920 -h 1080 "$ROOT/resources/splash.svg" -o "$RES/drawable-land-xxhdpi/splash.png"
rsvg -w 2560 -h 1440 "$ROOT/resources/splash.svg" -o "$RES/drawable-land-xxxhdpi/splash.png"

rsvg -w 1080 -h 1920 "$ROOT/resources/splash.svg" -o "$RES/drawable/splash.png"

echo "Iconos y splash de Android generados en $RES"
