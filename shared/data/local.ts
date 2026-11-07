import { INDEXED_DB_NAME } from "@/shared/lib/storage-keys";
import type { Attendance, StageScore } from "@/shared/domain/types";
import type { AttendanceStore } from "./attendance-store";
import type { ScoreStore } from "./score-store";

/** IndexedDB-backed stores for scores and roll call. Browser only: call from effects or event handlers, never during render on the server. */

const DB_NAME = INDEXED_DB_NAME;
// Version 2 added the roll call store. The upgrade only creates what is missing, so saved scores stay.
const DB_VERSION = 2;
const STORE = "scores";
const ATTENDANCE_STORE = "attendance";

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
      const db = open.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: "id" }).createIndex("byMatch", "matchId");
      }
      if (!db.objectStoreNames.contains(ATTENDANCE_STORE)) {
        db.createObjectStore(ATTENDANCE_STORE, { keyPath: "id" }).createIndex("byMatch", "matchId");
      }
    };
    open.onsuccess = () => resolve(open.result);
    open.onerror = () => reject(open.error);
  });
}

// One connection shared by both stores.
let dbPromise: Promise<IDBDatabase> | null = null;
const db = () => (dbPromise ??= openDb());

export function createIndexedDbScoreStore(): ScoreStore {
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

export function createIndexedDbAttendanceStore(): AttendanceStore {
  return {
    async putMany(records) {
      const tx = (await db()).transaction(ATTENDANCE_STORE, "readwrite");
      for (const record of records) tx.objectStore(ATTENDANCE_STORE).put(record);
      await done(tx);
    },
    async listByMatch(matchId) {
      const tx = (await db()).transaction(ATTENDANCE_STORE, "readonly");
      return request<Attendance[]>(tx.objectStore(ATTENDANCE_STORE).index("byMatch").getAll(matchId));
    },
  };
}
