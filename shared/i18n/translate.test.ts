import { describe, expect, it, vi } from "vitest";
import { en } from "./messages/en";
import { fi } from "./messages/fi";
import { type Catalogs, translate, translateKey } from "./translate";

const placeholders = (text: string) => [...text.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();

describe("catalogs", () => {
  it("fi has exactly the keys of en", () => {
    expect(Object.keys(fi).sort()).toEqual(Object.keys(en).sort());
  });
  it("no message is empty", () => {
    for (const [key, text] of [...Object.entries(en), ...Object.entries(fi)]) {
      expect(text.trim(), key).not.toBe("");
    }
  });
  it("fi uses the same placeholders as en", () => {
    for (const key of Object.keys(en) as Array<keyof typeof en>) {
      expect(placeholders(fi[key]), key).toEqual(placeholders(en[key]));
    }
  });
});

describe("translate", () => {
  it("returns the selected language", () => {
    expect(translate("en", "auth.title")).toBe("Sign in");
    expect(translate("fi", "auth.title")).toBe("Kirjaudu sisään");
  });
  it("fills placeholders", () => {
    expect(translate("fi", "stepper.max", { max: 8 })).toBe("Enintään 8");
    expect(translate("en", "menu.label", { email: "ro@example.fi" })).toBe("User menu (ro@example.fi)");
  });
  it("leaves unknown placeholders untouched", () => {
    expect(translate("en", "stepper.max")).toBe("Max {max}");
  });
});

describe("missing translations", () => {
  const catalogs: Catalogs = { en: { a: "English A", b: "English B" }, fi: { a: "Suomi A" } };

  it("falls back to English", () => {
    expect(translateKey("fi", "b", undefined, catalogs)).toBe("English B");
  });
  it("falls back to the key and warns when missing everywhere", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    expect(translateKey("fi", "nope", undefined, catalogs)).toBe("nope");
    expect(warn).toHaveBeenCalledOnce();
    warn.mockRestore();
  });
});

describe("plurals", () => {
  const catalogs: Catalogs = {
    en: { "shooters.one": "{count} shooter", "shooters.other": "{count} shooters" },
    fi: { "shooters.one": "{count} ampuja", "shooters.other": "{count} ampujaa" },
  };
  it("picks one/other by count in each language", () => {
    expect(translateKey("en", "shooters", { count: 1 }, catalogs)).toBe("1 shooter");
    expect(translateKey("en", "shooters", { count: 8 }, catalogs)).toBe("8 shooters");
    expect(translateKey("fi", "shooters", { count: 1 }, catalogs)).toBe("1 ampuja");
    expect(translateKey("fi", "shooters", { count: 8 }, catalogs)).toBe("8 ampujaa");
  });
});
