import { describe, expect, it } from "vitest";
import { NEXT_PREFERENCE, THEME_INIT_SCRIPT, isPreference, resolveTheme } from "./theme";

describe("resolveTheme", () => {
  it("follows the system when set to system", () => {
    expect(resolveTheme("system", true)).toBe("dark");
    expect(resolveTheme("system", false)).toBe("light");
  });
  it("forced themes ignore the system", () => {
    expect(resolveTheme("light", true)).toBe("light");
    expect(resolveTheme("dark", false)).toBe("dark");
  });
});

describe("preference", () => {
  it("cycles system → light → dark → system", () => {
    expect(NEXT_PREFERENCE.system).toBe("light");
    expect(NEXT_PREFERENCE.light).toBe("dark");
    expect(NEXT_PREFERENCE.dark).toBe("system");
  });
  it("validates stored values", () => {
    expect(isPreference("dark")).toBe(true);
    expect(isPreference("blue")).toBe(false);
    expect(isPreference(null)).toBe(false);
  });
});

describe("init script", () => {
  it("is valid JavaScript that sets data-theme", () => {
    const html = { dataset: {} as Record<string, string> };
    const run = new Function("localStorage", "window", "document", THEME_INIT_SCRIPT);
    const win = { matchMedia: () => ({ matches: true }) };
    run({ getItem: () => "system" }, win, { documentElement: html });
    expect(html.dataset.theme).toBe("dark");
    run({ getItem: () => "light" }, win, { documentElement: html });
    expect(html.dataset.theme).toBe("light");
    run({ getItem: () => { throw new Error("blocked"); } }, win, { documentElement: html });
    expect(html.dataset.theme).toBe("light");
  });
});
