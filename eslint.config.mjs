import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

/**
 * Import boundaries (see CLAUDE.md "Folder structure"). Layers, from the bottom:
 *   shared/        imports nothing from features, integrations or app
 *   features/<x>/  imports shared/* and features/shell only; shell also imports features/auth
 *   integrations/  imports shared/domain only
 *   app/           thin pages, may import anything
 * ESLint replaces (does not merge) `no-restricted-imports` options for a file, so every override
 * below lists the complete set of restrictions for its folder.
 */
const FEATURES = ["auth", "shell", "matches", "squads", "stages", "shooters", "scoring", "rollcall"];

/** The only features another feature may import: every screen uses the shell; the shell uses auth; auth uses none. */
const ALLOWED_FEATURE_IMPORTS = { shell: ["auth"], auth: [] };
const DEFAULT_ALLOWED_FEATURE_IMPORTS = ["shell"];

function featureRestrictions(name) {
  const allowed = ALLOWED_FEATURE_IMPORTS[name] ?? DEFAULT_ALLOWED_FEATURE_IMPORTS;
  const others = FEATURES.filter((feature) => feature !== name && !allowed.includes(feature));
  return [
    {
      group: ["@/integrations/**", "@/app/**"],
      message: "Features must not import integrations or app routes.",
    },
    ...others.map((other) => ({
      group: [`@/features/${other}/**`],
      message: `features/${name} must not import features/${other}. Move shared code to shared/ (or use features/shell).`,
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
