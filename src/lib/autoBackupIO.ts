import { Capacitor } from "@capacitor/core";
import {
  AUTO_BACKUP_FOLDER,
  AUTO_BACKUP_LABEL_DOCUMENTS,
  AUTO_BACKUP_RELATIVE,
} from "./autoBackup";

const IDB_NAME = "control-financiero-backup";
const IDB_STORE = "handles";

export function canPickWebFolder(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof (window as Window & { showDirectoryPicker?: unknown })
      .showDirectoryPicker === "function"
  );
}

type DirMode = "read" | "readwrite";

type DirectoryHandleWithPermission = FileSystemDirectoryHandle & {
  queryPermission?: (opts: { mode?: DirMode }) => Promise<PermissionState>;
  requestPermission?: (opts: { mode?: DirMode }) => Promise<PermissionState>;
};

async function ensureDirPermission(
  dir: FileSystemDirectoryHandle,
  mode: DirMode
): Promise<boolean> {
  const handle = dir as DirectoryHandleWithPermission;
  const current = handle.queryPermission
    ? await handle.queryPermission({ mode })
    : "granted";
  if (current === "granted") return true;
  if (!handle.requestPermission) return false;
  const next = await handle.requestPermission({ mode });
  return next === "granted";
}

function openIdb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(IDB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(IDB_STORE)) {
        db.createObjectStore(IDB_STORE);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function saveDirHandle(handle: FileSystemDirectoryHandle): Promise<void> {
  const db = await openIdb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(IDB_STORE, "readwrite");
    tx.objectStore(IDB_STORE).put(handle, "dir");
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
}

async function loadDirHandle(): Promise<FileSystemDirectoryHandle | null> {
  if (typeof indexedDB === "undefined") return null;
  try {
    const db = await openIdb();
    const handle = await new Promise<FileSystemDirectoryHandle | null>(
      (resolve, reject) => {
        const tx = db.transaction(IDB_STORE, "readonly");
        const req = tx.objectStore(IDB_STORE).get("dir");
        req.onsuccess = () =>
          resolve((req.result as FileSystemDirectoryHandle | undefined) ?? null);
        req.onerror = () => reject(req.error);
      }
    );
    db.close();
    return handle;
  } catch {
    return null;
  }
}

async function ensureNativeDir(): Promise<void> {
  const { Filesystem, Directory } = await import("@capacitor/filesystem");
  try {
    await Filesystem.requestPermissions();
  } catch {
    /* web / no-op */
  }
  try {
    await Filesystem.mkdir({
      path: AUTO_BACKUP_FOLDER,
      directory: Directory.Documents,
      recursive: true,
    });
  } catch {
    /* already exists */
  }
}

export async function enableDocumentsBackup(): Promise<{ label: string }> {
  if (Capacitor.isNativePlatform()) {
    await ensureNativeDir();
    return { label: AUTO_BACKUP_LABEL_DOCUMENTS };
  }
  return { label: AUTO_BACKUP_LABEL_DOCUMENTS };
}

export async function pickWebBackupFolder(): Promise<{ label: string } | null> {
  const picker = (
    window as Window & {
      showDirectoryPicker?: (opts?: { mode?: string }) => Promise<FileSystemDirectoryHandle>;
    }
  ).showDirectoryPicker;
  if (!picker) return null;
  const handle = await picker({ mode: "readwrite" });
  await saveDirHandle(handle);
  return { label: handle.name ? `${handle.name}/` : "Carpeta elegida/" };
}

export async function writeAutoBackup(json: string): Promise<void> {
  if (Capacitor.isNativePlatform()) {
    const { Filesystem, Directory, Encoding } = await import(
      "@capacitor/filesystem"
    );
    await ensureNativeDir();
    await Filesystem.writeFile({
      path: AUTO_BACKUP_RELATIVE,
      directory: Directory.Documents,
      data: json,
      encoding: Encoding.UTF8,
      recursive: true,
    });
    return;
  }
  const dir = await loadDirHandle();
  if (dir) {
    if (!(await ensureDirPermission(dir, "readwrite"))) {
      throw new Error("NO_FOLDER_PERMISSION");
    }
    const file = await dir.getFileHandle("control-financiero.json", {
      create: true,
    });
    const writable = await file.createWritable();
    await writable.write(json);
    await writable.close();
    return;
  }
  if (typeof localStorage !== "undefined") {
    localStorage.setItem("control-financiero:auto-json", json);
  }
}

export async function readAutoBackup(): Promise<string | null> {
  if (Capacitor.isNativePlatform()) {
    try {
      const { Filesystem, Directory, Encoding } = await import(
        "@capacitor/filesystem"
      );
      const result = await Filesystem.readFile({
        path: AUTO_BACKUP_RELATIVE,
        directory: Directory.Documents,
        encoding: Encoding.UTF8,
      });
      return typeof result.data === "string" ? result.data : null;
    } catch {
      return null;
    }
  }
  const dir = await loadDirHandle();
  if (dir) {
    try {
      if (!(await ensureDirPermission(dir, "readwrite"))) return null;
      const file = await dir.getFileHandle("control-financiero.json");
      const blob = await file.getFile();
      return blob.text();
    } catch {
      return null;
    }
  }
  if (typeof localStorage !== "undefined") {
    return localStorage.getItem("control-financiero:auto-json");
  }
  return null;
}
