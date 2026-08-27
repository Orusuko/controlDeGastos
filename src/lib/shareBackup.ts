import { Capacitor } from "@capacitor/core";

export type SaveBackupMode = "shared" | "downloaded";

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
  return (
    name === "AbortError" ||
    /cancel|abort|dismiss/i.test(message)
  );
}

/**
 * En Android (Capacitor) escribe el JSON y abre el sheet de compartir
 * para guardarlo en Descargas o enviarlo. En web, descarga un blob.
 */
export async function saveBackupFile(
  json: string,
  filename: string
): Promise<SaveBackupMode> {
  if (Capacitor.isNativePlatform()) {
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
      throw error;
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

  downloadBlob(json, filename);
  return "downloaded";
}
