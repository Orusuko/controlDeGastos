import { useEffect, useRef } from "react";
import { App } from "@capacitor/app";
import { isNativeApp } from "./shell";

type BackHandler = () => boolean;

const handlers: BackHandler[] = [];

/**
 * Registra un manejador del botón Atrás de Android.
 * Si devuelve true, consume el evento y no se sigue la cadena.
 * Los más recientes (modales) tienen prioridad.
 */
export function useAndroidBack(handler: BackHandler): void {
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    const wrapped: BackHandler = () => handlerRef.current();
    handlers.push(wrapped);
    return () => {
      const i = handlers.lastIndexOf(wrapped);
      if (i >= 0) handlers.splice(i, 1);
    };
  }, []);
}

/**
 * Cadena: primero modales, luego navegación de pestañas, luego salir.
 */
export function startAndroidBackListener(
  onNavigateBack: () => boolean
): () => void {
  if (!isNativeApp()) return () => {};

  const sub = App.addListener("backButton", () => {
    for (let i = handlers.length - 1; i >= 0; i--) {
      if (handlers[i]()) return;
    }
    if (onNavigateBack()) return;
    void App.exitApp();
  });

  return () => {
    void sub.then((h) => h.remove());
  };
}
