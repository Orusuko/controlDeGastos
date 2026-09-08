import { useEffect, useRef, useState } from "react";
import {
  hasLocalFinanceData,
  shouldOfferRestore,
  shouldPromptBackupSetup,
  shouldWriteAutoBackup,
} from "../lib/autoBackup";
import {
  canPickWebFolder,
  enableDocumentsBackup,
  pickWebBackupFolder,
  readAutoBackup,
  writeAutoBackup,
} from "../lib/autoBackupIO";
import {
  parseBackupJson,
  pickPersistedSlice,
  serializeBackup,
} from "../store/backup";
import type { PersistedSlice } from "../store/persist";
import { useFinanceStore } from "../store/useFinanceStore";

function backupJsonFromStore(): string {
  return serializeBackup(pickPersistedSlice(useFinanceStore.getState()));
}

export function useAutoBackup(hydrated: boolean): {
  showSetup: boolean;
  busy: boolean;
  error: string | null;
  pendingRestore: PersistedSlice | null;
  canPickFolder: boolean;
  useDocuments: () => Promise<void>;
  pickFolder: () => Promise<void>;
  skipSetup: () => void;
  confirmRestore: () => void;
  dismissRestore: () => void;
} {
  const enabled = useFinanceStore((s) => s.settings.autoBackupEnabled);
  const setupDone = useFinanceStore((s) => s.settings.autoBackupSetupDone);
  const updateSettings = useFinanceStore((s) => s.updateSettings);
  const importBackup = useFinanceStore((s) => s.importBackup);
  const [showSetup, setShowSetup] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingRestore, setPendingRestore] = useState<PersistedSlice | null>(
    null
  );
  const writing = useRef(false);

  useEffect(() => {
    if (!hydrated) return;
    if (shouldPromptBackupSetup({ autoBackupSetupDone: setupDone })) {
      setShowSetup(true);
    }
  }, [hydrated, setupDone]);

  useEffect(() => {
    if (!hydrated || !enabled) return;
    let timer: number | undefined;
    const unsub = useFinanceStore.subscribe(() => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        if (writing.current) return;
        const state = useFinanceStore.getState();
        if (!state.settings.autoBackupEnabled) return;
        if (!shouldWriteAutoBackup(state)) return;
        writing.current = true;
        writeAutoBackup(backupJsonFromStore()).finally(() => {
          writing.current = false;
        });
      }, 500);
    });
    return () => {
      unsub();
      if (timer) window.clearTimeout(timer);
    };
  }, [hydrated, enabled]);

  async function finishEnable(label: string) {
    const raw = await readAutoBackup();
    const parsed = raw ? parseBackupJson(raw) : null;
    const state = useFinanceStore.getState();
    const empty = !hasLocalFinanceData(state);
    updateSettings({
      autoBackupSetupDone: true,
      autoBackupEnabled: true,
      autoBackupLabel: label,
    });
    setShowSetup(false);
    if (
      parsed?.ok &&
      shouldOfferRestore({ hasLocalData: !empty, hasBackupFile: true })
    ) {
      setPendingRestore(parsed.data);
      return;
    }
    if (!shouldWriteAutoBackup(state)) return;
    await writeAutoBackup(backupJsonFromStore());
  }

  async function useDocuments() {
    setBusy(true);
    setError(null);
    try {
      const { label } = await enableDocumentsBackup();
      await finishEnable(label);
    } catch {
      setError("No se pudo usar Documentos. Revisa el permiso de archivos.");
    } finally {
      setBusy(false);
    }
  }

  async function pickFolder() {
    setBusy(true);
    setError(null);
    try {
      const picked = await pickWebBackupFolder();
      if (!picked) {
        setError("Este navegador no deja elegir carpeta. Usa Documentos.");
        return;
      }
      await finishEnable(picked.label);
    } catch {
      setError("No se eligió la carpeta.");
    } finally {
      setBusy(false);
    }
  }

  function skipSetup() {
    updateSettings({ autoBackupSetupDone: true, autoBackupEnabled: false });
    setShowSetup(false);
  }

  function confirmRestore() {
    if (!pendingRestore) return;
    importBackup({
      ...pendingRestore,
      settings: {
        ...pendingRestore.settings,
        autoBackupSetupDone: true,
        autoBackupEnabled: true,
        autoBackupLabel:
          useFinanceStore.getState().settings.autoBackupLabel ||
          pendingRestore.settings.autoBackupLabel,
      },
    });
    setPendingRestore(null);
  }

  return {
    showSetup,
    busy,
    error,
    pendingRestore,
    canPickFolder: canPickWebFolder(),
    useDocuments,
    pickFolder,
    skipSetup,
    confirmRestore,
    dismissRestore: () => setPendingRestore(null),
  };
}
