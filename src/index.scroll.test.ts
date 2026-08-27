import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const css = readFileSync(resolve(__dirname, "./index.css"), "utf8");
const app = readFileSync(resolve(__dirname, "./App.tsx"), "utf8");
const layout = readFileSync(
  resolve(__dirname, "../android/app/src/main/res/layout/activity_main.xml"),
  "utf8"
);
const manifest = readFileSync(
  resolve(__dirname, "../android/app/src/main/AndroidManifest.xml"),
  "utf8"
);

describe("shell de scroll táctil (WebView Android)", () => {
  it("el documento es el scroller: html overflow-y scroll, sin recortar html/body/#root", () => {
    expect(css).toMatch(/html \{[^}]*overflow-y:\s*scroll/s);
    expect(css).toMatch(/html \{[^}]*-webkit-overflow-scrolling:\s*touch/s);
    expect(css).toMatch(/html \{[^}]*touch-action:\s*pan-y/s);
    expect(css).not.toMatch(/html,\s*body,\s*#root \{[^}]*overflow:\s*hidden/s);
    expect(css).not.toMatch(/html,\s*body,\s*#root \{[^}]*height:\s*100dvh/s);
  });

  it("ningún ancestro recorta el documento (.app y main crecen con el contenido)", () => {
    expect(css).toMatch(/\.app \{[^}]*overflow:\s*visible/s);
    expect(css).toMatch(/\.app \{[^}]*height:\s*auto/s);
    expect(css).toMatch(/\.app__content \{[^}]*overflow:\s*visible/s);
    expect(css).toMatch(/\.app__content \{[^}]*touch-action:\s*pan-y/s);
    expect(css).not.toMatch(/^\s*overflow-x:\s*hidden/m);
  });

  it("reserva espacio inferior para la nav fija y el safe-area", () => {
    expect(css).toMatch(
      /padding:[^;]*var\(--nav-h\) \+ env\(safe-area-inset-bottom/
    );
    expect(css).toMatch(/\.nav \{[^}]*position:\s*fixed/s);
  });

  it("el header es sticky y el cambio de sección usa window.scrollTo", () => {
    expect(css).toMatch(/\.app__header \{[^}]*position:\s*sticky/s);
    expect(app).toMatch(/window\.scrollTo\(0,\s*0\)/);
  });

  it("el layout nativo no usa CoordinatorLayout (roba el gesto táctil)", () => {
    expect(layout).toMatch(/FrameLayout/);
    expect(layout).not.toMatch(/CoordinatorLayout/);
    expect(manifest).toMatch(/android:windowSoftInputMode="adjustPan"/);
  });
});
