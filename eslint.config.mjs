import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

/**
 * Import boundaries (see CLAUDE.md "Folder structure"). Layers, from the bottom:
 *   shared/        imports nothing from features, integrations or app
 *   features/<x>/  imports shared/* and features/auth only (temporary exceptions below)
 *   integrations/  imports shared/domain only
 *   app/           thin pages, may import anything
 * ESLint replaces (does not merge) `no-restricted-imports` options for a file, so every override
 * below lists the complete set of restrictions for its folder.
 */
const FEATURES = ["auth", "matches", "squads", "stages", "shooters", "scoring"];

/**
 * Temporary exceptions, removed as the refactoring lands (docs/PLAN.md):
 * - every feature may import features/auth (the session guard and UserMenu move to features/shell)
 * - shooters may import the pure scoring rules (they move to shared/domain)
 */
const TEMPORARY_EXCEPTIONS = {
  shooters: ["scoring/rules"],
};

function featureRestrictions(name) {
  const others = FEATURES.filter((feature) => feature !== name && feature !== "auth");
  return [
    {
      group: ["@/integrations/**", "@/app/**"],
      message: "Features must not import integrations or app routes.",
    },
    ...others.map((other) => ({
      group: [
        `@/features/${other}/**`,
        ...(TEMPORARY_EXCEPTIONS[name] ?? [])
          .filter((path) => path.startsWith(`${other}/`))
          .map((path) => `!@/features/${path}`),
      ],
      message: `features/${name} must not import features/${other}. Move shared code to shared/.`,
    })),
  ];
}

const restrict = (files, patterns) => ({
  files,
  rules: { "no-restricted-imports": ["error", { patterns }] },
});

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  restrict(
    ["shared/**/*.{ts,tsx}"],
    [
      {
        group: ["@/features/**", "@/integrations/**", "@/app/**"],
        message: "shared/ is the bottom layer: it must not import features, integrations or app.",
      },
    ],
  ),
  ...FEATURES.map((name) => restrict([`features/${name}/**/*.{ts,tsx}`], featureRestrictions(name))),
  restrict(
    ["integrations/**/*.{ts,tsx}"],
    [
      {
        group: ["@/features/**", "@/app/**", "@/shared/ui/**", "@/shared/i18n/**", "@/shared/theme/**"],
        message: "integrations/ may import shared/domain (and shared/lib) only.",
      },
    ],
  ),
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
