/** Lee el valor real del DOM (más fiable que el state de React en WebView Android). */
export function formString(form: HTMLFormElement, name: string): string {
  const fd = new FormData(form);
  return String(fd.get(name) ?? "").trim();
}

export function formNumber(form: HTMLFormElement, name: string): number {
  const raw = formString(form, name).replace(",", ".");
  return Number(raw);
}

export function formInt(form: HTMLFormElement, name: string): number {
  const n = Number.parseInt(formString(form, name).replace(",", "."), 10);
  return Number.isFinite(n) ? n : NaN;
}
