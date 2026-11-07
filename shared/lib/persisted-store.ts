/**
 * A string value kept in localStorage that React can subscribe to (`useSyncExternalStore`).
 * Used for the theme, language and session. Browser only: call `read` / `write` / `subscribe`
 * from effects, event handlers or `useSyncExternalStore`, never while rendering on the server.
 *
 * - If storage is blocked (private mode), the value is kept in memory for this page load.
 * - `write` and `remove` notify subscribers in this tab; the `storage` event covers other tabs.
 */
export interface PersistedStore {
  read(): string | null;
  write(value: string): void;
  remove(): void;
  /** Call `onChange` when the value changes (here or in another tab). Returns the unsubscribe function. */
  subscribe(onChange: () => void): () => void;
}

interface PersistedStoreOptions {
  /** localStorage key. */
  key: string;
  /** Name of the `window` event that announces a change made in this tab. */
  event: string;
  /** Runs after the value is stored and before subscribers are told (e.g. to update <html>). */
  onWrite?: (value: string | null) => void;
}

export function createPersistedStore({ key, event, onWrite }: PersistedStoreOptions): PersistedStore {
  let memory: string | null = null;

  const notify = (value: string | null) => {
    onWrite?.(value);
    window.dispatchEvent(new Event(event));
  };

  return {
    read() {
      try {
        return localStorage.getItem(key) ?? memory;
      } catch {
        return memory;
      }
    },
    write(value) {
      memory = value;
      try {
        localStorage.setItem(key, value);
      } catch {
        // Storage can be blocked; the value still holds for this page load.
      }
      notify(value);
    },
    remove() {
      memory = null;
      try {
        localStorage.removeItem(key);
      } catch {
        // ignore
      }
      notify(null);
    },
    subscribe(onChange) {
      window.addEventListener(event, onChange);
      window.addEventListener("storage", onChange);
      return () => {
        window.removeEventListener(event, onChange);
        window.removeEventListener("storage", onChange);
      };
    },
  };
}
