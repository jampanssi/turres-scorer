import { describe, expect, it } from "vitest";
import type { Locale } from "./locale";
import { translate } from "./translate";

/**
 * Some labels sit in small fixed-size boxes and cannot wrap. Keep their translations short:
 * a longer text will not fit and gets cut off or overflows (this happened with Finnish "N jäljellä").
 */
const LOCALES: Locale[] = ["en", "fi"];

describe("labels in small boxes", () => {
  it("the matrix row tile label ('N left') fits the 38 px tile: at most 8 characters", () => {
    for (const locale of LOCALES) {
      for (const count of [1, 2, 3]) {
        const label = translate(locale, "score.left", { count });
        expect(label.length, `${locale}: "${label}"`).toBeLessThanOrEqual(8);
      }
    }
  });
});
