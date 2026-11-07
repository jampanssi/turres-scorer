// Stops dev, build and test early when Node is not the version this project is pinned to.
// The version comes from package.json "engines" (also in .nvmrc). npm treats a project's own
// "engines" as advice only, so this script is what actually enforces it.
import { readFileSync } from "node:fs";

const required = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8")).engines.node; // "26.x"
const requiredMajor = Number(required.split(".")[0]);
const actual = process.versions.node;

if (Number(actual.split(".")[0]) !== requiredMajor) {
  console.error(
    `\nThis project needs Node ${requiredMajor} (see .nvmrc), but you are running Node ${actual}.\n` +
      `Switch with \`nvm use\` or \`fnm use\`, or install Node ${requiredMajor} from nodejs.org.\n`,
  );
  process.exit(1);
}
