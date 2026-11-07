import { describe, expect, it } from "vitest";
import { DNF_REASONS, DQ_REASONS } from "@/shared/domain/types";
import { en } from "./messages/en";

describe("reason codes", () => {
  it("every DQ and DNF reason has a message", () => {
    for (const code of DQ_REASONS) expect(en, `reason.dq.${code}`).toHaveProperty(`reason.dq.${code}`);
    for (const code of DNF_REASONS) expect(en, `reason.dnf.${code}`).toHaveProperty(`reason.dnf.${code}`);
  });
});
