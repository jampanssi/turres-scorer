import type { Repository } from "./repository";

export type { Repository } from "./repository";

let instance: Promise<Repository> | null = null;

/**
 * Create the repository for the configured data source (`NEXT_PUBLIC_DATA_SOURCE`, default `mock`).
 * The condition reads `process.env` directly so the build can remove the branches it does not use:
 * with another data source configured, the sample data is not part of the client bundle.
 * An `api` source (SSI behind our Route Handlers) is added here later; nothing else changes.
 */
async function createRepository(): Promise<Repository> {
  if ((process.env.NEXT_PUBLIC_DATA_SOURCE ?? "mock") === "mock") {
    const { createMockRepository } = await import("./mock");
    return createMockRepository();
  }
  throw new Error(`Unsupported NEXT_PUBLIC_DATA_SOURCE "${process.env.NEXT_PUBLIC_DATA_SOURCE}"`);
}

/**
 * The app-wide repository, created once on first use. It is async because the data source is loaded
 * on demand. Call it from effects, event handlers or `useRepoQuery`, never while rendering.
 */
export function getRepository(): Promise<Repository> {
  instance ??= createRepository().catch((error) => {
    instance = null; // do not keep a failed attempt: the next call tries again
    throw error;
  });
  return instance;
}
