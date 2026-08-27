import { Capacitor } from "@capacitor/core";

export type SaveBackupMode = "shared" | "downloaded" | "copied";

function downloadBlob(json: string, filename: string): void {
  const blob = new Blob([json], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function isAbort(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const name = "name" in error ? String(error.name) : "";
  const message = "message" in error ? String(error.message) : "";
  return name === "AbortError" || /cancel|abort|dismiss/i.test(message);
}

export async function copyBackupText(json: string): Promise<void> {
  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(json);
      return;
    } catch {
      /* WebView a veces bloquea clipboard; cae al textarea. */
    }
  }
  if (typeof document === "undefined") {
    throw new Error("clipboard unavailable");
  }
  const ta = document.createElement("textarea");
  ta.value = json;
  ta.setAttribute("readonly", "");
  ta.setAttribute("aria-hidden", "true");
  ta.style.position = "fixed";
  ta.style.top = "0";
  ta.style.left = "0";
  ta.style.opacity = "0";
  document.body.appendChild(ta);
  ta.focus();
  ta.select();
  ta.setSelectionRange(0, json.length);
  const ok = document.execCommand("copy");
  ta.remove();
  if (!ok) throw new Error("clipboard unavailable");
}

/**
 * En Android (Capacitor) escribe el JSON y abre el sheet de compartir
 * para guardarlo en Descargas o enviarlo. Si Share falla, copia al
 * portapapeles. En web, descarga un blob.
 */
export async function saveBackupFile(
  json: string,
  filename: string
): Promise<SaveBackupMode> {
  if (Capacitor.isNativePlatform()) {
    try {
      const { Filesystem, Directory, Encoding } = await import(
        "@capacitor/filesystem"
      );
      const { Share } = await import("@capacitor/share");
      await Filesystem.writeFile({
        path: filename,
        data: json,
        directory: Directory.Cache,
        encoding: Encoding.UTF8,
      });
      const { uri } = await Filesystem.getUri({
        path: filename,
        directory: Directory.Cache,
      });
      try {
        await Share.share({
          title: "Respaldo Control Financiero",
          text: "Copia de seguridad de tarjetas, gastos y mensualidades",
          dialogTitle: "Guardar o enviar respaldo",
          url: uri,
          files: [uri],
        });
        return "shared";
      } catch (error) {
        if (isAbort(error)) return "shared";
        await copyBackupText(json);
        return "copied";
      }
    } catch (error) {
      if (isAbort(error)) return "shared";
      try {
        await copyBackupText(json);
        return "copied";
      } catch {
        throw error;
      }
    }
  }

  if (
    typeof navigator !== "undefined" &&
    typeof navigator.share === "function" &&
    typeof File !== "undefined"
  ) {
    try {
      const file = new File([json], filename, { type: "application/json" });
      if (!navigator.canShare || navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: "Respaldo Control Financiero",
        });
        return "shared";
      }
    } catch (error) {
      if (isAbort(error)) return "shared";
    }
  }

  try {
    downloadBlob(json, filename);
    return "downloaded";
  } catch {
    await copyBackupText(json);
    return "copied";
  }
}

export function backupReadyMessage(mode: SaveBackupMode): string {
  if (mode === "shared") {
    return "Archivo listo. Elige dónde guardar o enviar el JSON.";
  }
  if (mode === "copied") {
    return "Archivo listo. El JSON se copió al portapapeles.";
  }
  return "Archivo listo. El JSON se descargó; guárdalo fuera del teléfono.";
}
