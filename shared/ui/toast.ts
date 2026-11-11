/**
 * One short message shown after an action, such as "Antti Mäkelä · 8.42 s · HF 4.2310 saved", or an error
 * such as a failed sign-in.
 * It lives in memory (not in storage), so it survives moving between screens but not a reload.
 * `ToastHost` (mounted once in the signed-in area) shows it; any code can call `showToast`.
 */
export interface Toast {
  /** Changes with every toast, so a new one restarts the timer even if the text is the same. */
  id: number;
  message: string;
  /**
   * "success" (the default): a confirmation in the HeroUI-style green toast. "danger": an error in the
   * red one, announced at once to screen readers and kept longer.
   */
  tone?: "success" | "danger";
  /** A bold first line above the message. */
  title?: string;
  /** The shooter the message is about: their row on Shooters is highlighted while the toast shows. */
  shooterId?: string;
}

let current: Toast | null = null;
let nextId = 1;
const listeners = new Set<() => void>();

const emit = () => listeners.forEach((listener) => listener());

export function showToast(toast: Omit<Toast, "id">): void {
  current = { ...toast, id: nextId++ };
  emit();
}

export function dismissToast(): void {
  if (current === null) return;
  current = null;
  emit();
}

export function getToast(): Toast | null {
  return current;
}

export function subscribeToast(onChange: () => void): () => void {
  listeners.add(onChange);
  return () => listeners.delete(onChange);
}
