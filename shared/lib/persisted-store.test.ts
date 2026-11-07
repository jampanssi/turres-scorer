import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createPersistedStore } from "./persisted-store";

/** Minimal browser stand-ins: `window` is an event target, `localStorage` a map (or throws when blocked). */
function stubBrowser({ blocked = false } = {}) {
  const target = new EventTarget();
  const data = new Map<string, string>();
  vi.stubGlobal("window", target);
  vi.stubGlobal("localStorage", {
    getItem: (k: string) => {
      if (blocked) throw new Error("blocked");
      return data.get(k) ?? null;
    },
    setItem: (k: string, v: string) => {
      if (blocked) throw new Error("blocked");
      data.set(k, v);
    },
    removeItem: (k: string) => {
      if (blocked) throw new Error("blocked");
      data.delete(k);
    },
  });
  return { target, data };
}

const options = { key: "test.key", event: "test:event" };

beforeEach(() => stubBrowser());
afterEach(() => vi.unstubAllGlobals());

describe("createPersistedStore", () => {
  it("reads null before anything is written", () => {
    expect(createPersistedStore(options).read()).toBeNull();
  });

  it("writes to localStorage and reads it back", () => {
    const { data } = stubBrowser();
    const store = createPersistedStore(options);
    store.write("dark");
    expect(data.get("test.key")).toBe("dark");
    expect(store.read()).toBe("dark");
  });

  it("remove clears the value", () => {
    const store = createPersistedStore(options);
    store.write("x");
    store.remove();
    expect(store.read()).toBeNull();
  });

  it("notifies subscribers on write and remove, and stops after unsubscribe", () => {
    const store = createPersistedStore(options);
    const onChange = vi.fn();
    const unsubscribe = store.subscribe(onChange);
    store.write("a");
    store.remove();
    expect(onChange).toHaveBeenCalledTimes(2);
    unsubscribe();
    store.write("b");
    expect(onChange).toHaveBeenCalledTimes(2);
  });

  it("notifies when another tab changes storage (the storage event)", () => {
    const { target } = stubBrowser();
    const store = createPersistedStore(options);
    const onChange = vi.fn();
    store.subscribe(onChange);
    target.dispatchEvent(new Event("storage"));
    expect(onChange).toHaveBeenCalledOnce();
  });

  it("runs onWrite after storing and before subscribers are told", () => {
    const order: string[] = [];
    const store = createPersistedStore({ ...options, onWrite: (value) => order.push(`write:${value}`) });
    store.subscribe(() => order.push(`notify:${store.read()}`));
    store.write("fi");
    store.remove();
    expect(order).toEqual(["write:fi", "notify:fi", "write:null", "notify:null"]);
  });

  it("keeps stores with different keys and events apart", () => {
    const a = createPersistedStore({ key: "a", event: "a:event" });
    const b = createPersistedStore({ key: "b", event: "b:event" });
    const onB = vi.fn();
    b.subscribe(onB);
    a.write("1");
    expect(a.read()).toBe("1");
    expect(b.read()).toBeNull();
    expect(onB).not.toHaveBeenCalled();
  });

  it("falls back to memory when storage is blocked, and still notifies", () => {
    stubBrowser({ blocked: true });
    const store = createPersistedStore(options);
    const onChange = vi.fn();
    store.subscribe(onChange);
    expect(store.read()).toBeNull();
    store.write("light");
    expect(store.read()).toBe("light");
    expect(onChange).toHaveBeenCalledOnce();
    store.remove();
    expect(store.read()).toBeNull();
  });
});

describe("a value removed elsewhere", () => {
  it("is gone here too: memory is not a second copy while storage works (sign-out in another tab)", () => {
    const { target, data } = stubBrowser();
    const store = createPersistedStore(options);
    const onChange = vi.fn();
    store.subscribe(onChange);

    store.write("signed-in");
    data.delete("test.key"); // another tab signed out
    target.dispatchEvent(new Event("storage"));

    expect(onChange).toHaveBeenCalled();
    expect(store.read()).toBeNull();
  });

  it("is picked up when another tab writes a different value", () => {
    const { target, data } = stubBrowser();
    const store = createPersistedStore(options);
    store.write("one");
    data.set("test.key", "two");
    target.dispatchEvent(new Event("storage"));
    expect(store.read()).toBe("two");
  });
});
