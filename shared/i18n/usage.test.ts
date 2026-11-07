import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { en } from "./messages/en";

/**
 * Keeps the messages and the code that uses them in step:
 * - no message sits unused (a leftover after a screen changed),
 * - no code builds a message key as a template string (use `tEnum`, which is type-checked),
 * - every key the code looks up exists.
 * The types already stop a typo in `t("...")`; this catches what the types cannot: dead messages.
 */

const ROOT = fileURLToPath(new URL("../../", import.meta.url));

function walk(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

/** Source files that use messages: not tests, not the message files, not test fixtures. */
const files = ["app", "features", "shared"]
  .flatMap((dir) => walk(path.join(ROOT, dir)))
  .filter((file) => /\.(ts|tsx)$/.test(file))
  .filter((file) => !/\.test\.(ts|tsx)$/.test(file) && !file.includes(`${path.sep}messages${path.sep}`));

/** The code with comments removed, so a key mentioned in a comment does not count as used. */
const source = files
  .map((file) =>
    fs
      .readFileSync(file, "utf8")
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .replace(/(^|\s)\/\/.*$/gm, "$1"),
  )
  .join("\n");

const keys = Object.keys(en);
const baseOf = (key: string) => key.replace(/\.(one|other)$/, "");
const bases = new Set(keys.map(baseOf));

const enumPrefixes = [...source.matchAll(/\btEnum\(\s*"([^"]+)"/g)].map((m) => m[1]);

describe("message usage", () => {
  it("finds the source files and the tEnum calls (guards the test itself)", () => {
    expect(files.length).toBeGreaterThan(30);
    expect(enumPrefixes.length).toBeGreaterThan(5);
  });

  it("every message is used somewhere in the code", () => {
    const unused = keys.filter((key) => {
      const base = baseOf(key);
      const literal = source.includes(`"${base}"`) || source.includes(`"${key}"`);
      const byCode = enumPrefixes.some((prefix) => key.startsWith(`${prefix}.`));
      return !literal && !byCode;
    });
    expect(unused, `unused messages (delete them, or use them): ${unused.join(", ")}`).toEqual([]);
  });

  it("no message key is built as a template string (use tEnum)", () => {
    const templated = [...source.matchAll(/\bt(?:Enum)?\(\s*`/g)];
    expect(templated.length, "found t(`...`) or tEnum(`...`): use tEnum(prefix, code) instead").toBe(0);
  });

  it("every literal key passed to t() exists", () => {
    const used = [...source.matchAll(/\bt\(\s*"([^"]+)"/g)].map((m) => m[1]);
    const missing = used.filter((key) => !bases.has(key) && !keys.includes(key));
    expect(missing, `t() called with keys that have no message: ${missing.join(", ")}`).toEqual([]);
  });

  it("every tEnum prefix has messages", () => {
    const empty = enumPrefixes.filter((prefix) => !keys.some((key) => key.startsWith(`${prefix}.`)));
    expect(empty, `tEnum prefixes without messages: ${empty.join(", ")}`).toEqual([]);
  });
});
