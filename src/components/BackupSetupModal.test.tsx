import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { BackupSetupModal } from "./BackupSetupModal";

afterEach(() => cleanup());

describe("BackupSetupModal", () => {
  it("pide una carpeta al inicio y ofrece Documentos", () => {
    const skipped: string[] = [];
    render(
      <BackupSetupModal
        busy={false}
        error={null}
        canPickFolder={false}
        onUseDocuments={() => skipped.push("docs")}
        onPickFolder={() => skipped.push("pick")}
        onSkip={() => skipped.push("skip")}
      />
    );
    expect(screen.getByText(/Documentos\/ControlFinanciero/)).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Usar Documentos" }));
    expect(skipped).toEqual(["docs"]);
  });
});
