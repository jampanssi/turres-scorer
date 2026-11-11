import { describe, expect, it } from "vitest";
import { translate } from "./translate";

/**
 * The failed sign-in message deliberately covers two reasons at once, so that the app never reveals that a
 * password was right but the user has no permission to use it. Guard that wording in both languages.
 */
describe("failed sign-in message", () => {
  it("names both reasons in English, and does not say which one it was", () => {
    const text = translate("en", "auth.error.invalidCredentials");
    expect(text).toMatch(/wrong email address or password/i);
    expect(text).toMatch(/permission to use the application/i);
    expect(text).toMatch(/, or /); // an either-or, not two separate statements
  });

  it("names both reasons in Finnish too", () => {
    const text = translate("fi", "auth.error.invalidCredentials");
    expect(text).toMatch(/väärä sähköpostiosoite tai salasana/i);
    expect(text).toMatch(/ei ole oikeutta käyttää sovellusta/i);
  });
});
