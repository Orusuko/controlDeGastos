import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const css = readFileSync(resolve(__dirname, "./index.css"), "utf8");

describe("shell de scroll táctil", () => {
  it("el documento no es el contenedor de scroll (html/body/#root recortan)", () => {
    expect(css).toMatch(/html,\s*body,\s*#root \{[^}]*overflow:\s*hidden/s);
    expect(css).toMatch(/html,\s*body,\s*#root \{[^}]*height:\s*100dvh/s);
  });

  it("solo .app__content desplaza en vertical con gesto táctil", () => {
    expect(css).toMatch(
      /\.app__content \{[^}]*overflow-y:\s*auto/s
    );
    expect(css).toMatch(
      /\.app__content \{[^}]*min-height:\s*0/s
    );
    expect(css).toMatch(
      /\.app__content \{[^}]*-webkit-overflow-scrolling:\s*touch/s
    );
    expect(css).toMatch(
      /\.app__content \{[^}]*touch-action:\s*pan-y/s
    );
    expect(css).toMatch(/\.app__content > \* \{[^}]*flex-shrink:\s*0/s);
  });

  it("reserva espacio inferior para la nav y el safe-area", () => {
    expect(css).toMatch(
      /padding:[^;]*var\(--nav-h\) \+ env\(safe-area-inset-bottom/
    );
  });
});
