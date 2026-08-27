import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { backupReadyMessage, copyBackupText } from "./shareBackup";

describe("shareBackup", () => {
  const writeText = vi.fn();

  beforeEach(() => {
    writeText.mockReset();
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("copyBackupText usa el portapapeles", async () => {
    writeText.mockResolvedValue(undefined);
    await copyBackupText('{"ok":true}');
    expect(writeText).toHaveBeenCalledWith('{"ok":true}');
  });

  it("copyBackupText cae a textarea si clipboard.writeText falla", async () => {
    writeText.mockRejectedValue(new Error("denied"));
    const exec = vi.fn().mockReturnValue(true);
    Object.defineProperty(document, "execCommand", {
      configurable: true,
      writable: true,
      value: exec,
    });
    await copyBackupText("payload");
    expect(exec).toHaveBeenCalledWith("copy");
  });

  it("backupReadyMessage confirma archivo listo en todos los modos", () => {
    expect(backupReadyMessage("shared")).toMatch(/Archivo listo/);
    expect(backupReadyMessage("downloaded")).toMatch(/Archivo listo/);
    expect(backupReadyMessage("copied")).toMatch(/Archivo listo/);
    expect(backupReadyMessage("copied")).toMatch(/portapapeles/);
  });
});
