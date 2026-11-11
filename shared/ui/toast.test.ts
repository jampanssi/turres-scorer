import { afterEach, describe, expect, it, vi } from "vitest";
import { dismissToast, getToast, showToast, subscribeToast } from "./toast";

afterEach(() => dismissToast());

describe("toast store", () => {
  it("starts empty, shows a toast and clears it", () => {
    expect(getToast()).toBeNull();
    showToast({ message: "Saved" });
    expect(getToast()?.message).toBe("Saved");
    dismissToast();
    expect(getToast()).toBeNull();
  });

  it("gives every toast a new id, even with the same text, and a new one replaces the old", () => {
    showToast({ message: "Saved" });
    const first = getToast()!.id;
    showToast({ message: "Saved" });
    expect(getToast()!.id).not.toBe(first);
  });

  it("notifies subscribers on show and dismiss, not on dismissing nothing; unsubscribe stops it", () => {
    const listener = vi.fn();
    const unsubscribe = subscribeToast(listener);
    dismissToast();
    expect(listener).not.toHaveBeenCalled();
    showToast({ message: "A" });
    dismissToast();
    expect(listener).toHaveBeenCalledTimes(2);
    unsubscribe();
    showToast({ message: "B" });
    expect(listener).toHaveBeenCalledTimes(2);
  });

  it("keeps the shooter", () => {
    showToast({ message: "A", shooterId: "s1" });
    expect(getToast()).toMatchObject({ shooterId: "s1" });
  });

  it("keeps the tone and the title of an error toast, and defaults to a plain confirmation", () => {
    showToast({ message: "Saved" });
    expect(getToast()?.tone).toBeUndefined();
    showToast({ tone: "danger", title: "Sign-in failed", message: "Wrong password" });
    expect(getToast()).toMatchObject({ tone: "danger", title: "Sign-in failed", message: "Wrong password" });
  });
});
