"use client"; // Error boundaries must be Client Components

import { ErrorStatus } from "@/shared/ui/StatusPage";

export default function Error({ error, retry }: { error: unknown; retry: () => void }) {
  return <ErrorStatus error={error} retry={retry} />;
}
