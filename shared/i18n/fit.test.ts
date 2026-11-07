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

/**
 * Labels in boxes that share a row with other content (tabs, stat tiles, the score bar buttons).
 * The caps come from the real-Chrome overflow audit at 360 px; raise one only after checking the screen.
 */
const SHORT_LABELS = {
  "matches.stages": 10,
  "matches.squads": 10,
  "matches.shooters": 10,
  "matches.tab.open": 12,
  "matches.tab.results": 12,
  "score.review": 12,
  "matchTabs.squads": 10,
  "matchTabs.shooters": 12,
  "common.dns": 4,
  "common.dnf": 4,
  "common.dq": 4,
} as const;

describe("short labels", () => {
  for (const [key, max] of Object.entries(SHORT_LABELS) as [keyof typeof SHORT_LABELS, number][]) {
    it(`${key} is at most ${max} characters in every language`, () => {
      for (const locale of LOCALES) {
        const label = translate(locale, key);
        expect(label.length, `${locale}: "${label}"`).toBeLessThanOrEqual(max);
      }
    });
  }
});
