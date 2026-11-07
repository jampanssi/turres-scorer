/** Why the repository refused an action. A code, not text, so the UI can translate it. */
export type RepositoryErrorCode = "matchCompleted" | "matchNotFound";

export class RepositoryError extends Error {
  constructor(readonly code: RepositoryErrorCode) {
    super(code);
    this.name = "RepositoryError";
  }
}
