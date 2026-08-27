import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { APP_VERSION_CODE, APP_VERSION_NAME } from "./appVersion";

describe("appVersion", () => {
  it("coincide con versionName y versionCode del APK Android", () => {
    const gradle = readFileSync(
      resolve(__dirname, "../../android/app/build.gradle"),
      "utf8"
    );
    expect(gradle).toMatch(new RegExp(`versionCode ${APP_VERSION_CODE}\\b`));
    expect(gradle).toMatch(
      new RegExp(`versionName "${APP_VERSION_NAME.replace(/\./g, "\\.")}"`)
    );
    expect(gradle).toContain('applicationId "com.controlfinanciero.app"');
    expect(gradle).toContain('storeFile file("debug.keystore")');
  });
});
