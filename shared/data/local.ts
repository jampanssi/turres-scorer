import { INDEXED_DB_NAME } from "@/shared/lib/storage-keys";
import type { StageScore } from "@/shared/domain/types";
import type { ScoreStore } from "./score-store";

/** IndexedDB-backed ScoreStore. Browser only: call from effects or event handlers, never during render on the server. */

const DB_NAME = INDEXED_DB_NAME;
const DB_VERSION = 1;
const STORE = "scores";

function request<T>(req: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function done(tx: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const open = indexedDB.open(DB_NAME, DB_VERSION);
    open.onupgradeneeded = () => {
      const store = open.result.createObjectStore(STORE, { keyPath: "id" });
      store.createIndex("byMatch", "matchId");
    };
    open.onsuccess = () => resolve(open.result);
    open.onerror = () => reject(open.error);
  });
}

export function createIndexedDbScoreStore(): ScoreStore {
  let dbPromise: Promise<IDBDatabase> | null = null;
  const db = () => (dbPromise ??= openDb());

  return {
    async get(id) {
      const tx = (await db()).transaction(STORE, "readonly");
      const found = await request<StageScore | undefined>(tx.objectStore(STORE).get(id));
      return found ?? null;
    },
    async put(score) {
      const tx = (await db()).transaction(STORE, "readwrite");
      tx.objectStore(STORE).put(score);
      await done(tx);
    },
    async listByMatch(matchId) {
      const tx = (await db()).transaction(STORE, "readonly");
      return request<StageScore[]>(tx.objectStore(STORE).index("byMatch").getAll(matchId));
    },
  };
}
