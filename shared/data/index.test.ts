import { afterEach, describe, expect, it, vi } from "vitest";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe("getRepository", () => {
  it("creates the mock repository by default, once", async () => {
    const { getRepository } = await import("./index");
    const first = await getRepository();
    expect(await getRepository()).toBe(first);
    expect((await first.listMatches()).length).toBeGreaterThan(0);
  });

  it("refuses a data source that does not exist yet, and tries again on the next call", async () => {
    vi.stubEnv("NEXT_PUBLIC_DATA_SOURCE", "api");
    const { getRepository } = await import("./index");
    await expect(getRepository()).rejects.toThrow(/Unsupported NEXT_PUBLIC_DATA_SOURCE "api"/);

    // A failed attempt is not kept: once the source is fixed the next call works.
    vi.stubEnv("NEXT_PUBLIC_DATA_SOURCE", "mock");
    expect((await getRepository()).now()).toMatch(/^\d{4}-/);
  });
});
