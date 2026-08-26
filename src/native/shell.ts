import { Capacitor } from "@capacitor/core";
import { StatusBar, Style } from "@capacitor/status-bar";
import { SplashScreen } from "@capacitor/splash-screen";
import { Keyboard, KeyboardResize } from "@capacitor/keyboard";

export function isNativeApp(): boolean {
  return Capacitor.isNativePlatform();
}

/**
 * Ajusta barra de estado, teclado y splash al arrancar en Android.
 * En el navegador no hace nada (los plugins fallan de forma segura).
 */
export async function bootstrapNativeShell(): Promise<void> {
  document.documentElement.classList.toggle("is-native", isNativeApp());
  if (!isNativeApp()) return;

  try {
    await StatusBar.setStyle({ style: Style.Light });
  } catch {
    // Algunos fabricantes no permiten cambiar el estilo.
  }

  try {
    await Keyboard.setResizeMode({ mode: KeyboardResize.Body });
  } catch {
    // El plugin de teclado no está disponible fuera de nativo.
  }

  try {
    await SplashScreen.hide({ fadeOutDuration: 250 });
  } catch {
    // Ignorar si el splash ya se ocultó solo.
  }
}
