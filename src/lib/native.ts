import { Capacitor } from "@capacitor/core";
import { App } from "@capacitor/app";
import { Keyboard, KeyboardResize } from "@capacitor/keyboard";
import { SplashScreen } from "@capacitor/splash-screen";
import { StatusBar, Style } from "@capacitor/status-bar";
import type { View } from "../components/BottomNav";

const modalClosers: Array<() => void> = [];

let currentView: View = "dashboard";
let setView: ((view: View) => void) | null = null;
let nativeReady = false;

export function isNativeApp(): boolean {
  return Capacitor.isNativePlatform();
}

export function syncNativeView(view: View, setter: (view: View) => void): void {
  currentView = view;
  setView = setter;
}

/** Registra el cierre de un modal para que el botón atrás de Android lo cierre. */
export function pushModalCloser(close: () => void): () => void {
  modalClosers.push(close);
  return () => {
    const i = modalClosers.lastIndexOf(close);
    if (i >= 0) modalClosers.splice(i, 1);
  };
}

export async function initNativeShell(): Promise<void> {
  if (!isNativeApp() || nativeReady) return;
  nativeReady = true;

  try {
    await StatusBar.setStyle({ style: Style.Dark });
    await StatusBar.setBackgroundColor({ color: "#4f46e5" });
    await StatusBar.setOverlaysWebView({ overlay: false });
  } catch {
    // Algunos emuladores no implementan StatusBar.
  }

  try {
    await Keyboard.setResizeMode({ mode: KeyboardResize.Body });
  } catch {
    // El plugin Keyboard es opcional en web.
  }

  try {
    await SplashScreen.hide();
  } catch {
    // Sin splash nativo (p. ej. en tests).
  }

  await App.addListener("backButton", () => {
    const closer = modalClosers[modalClosers.length - 1];
    if (closer) {
      closer();
      return;
    }
    if (currentView !== "dashboard" && setView) {
      setView("dashboard");
      return;
    }
    void App.exitApp();
  });
}
