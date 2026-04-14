import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type { SecurityWorkflowProvider } from "../types";

const __dirname = dirname(fileURLToPath(import.meta.url));

const WORKFLOW_PATH = ".github/workflows/pensar.yml";

const workflowTemplate = readFileSync(join(__dirname, "pensar.yml"), "utf-8");

const prCallout = `### 🔒 Continuous security scanning added

This PR adds \`${WORKFLOW_PATH}\`, which runs [Pensar](https://pensar.dev) security scans on every push to \`main\`, \`master\`, or \`develop\`.

To activate: add a \`PENSAR_API_KEY\` repository secret (Settings → Secrets and variables → Actions). Sign up at https://pensar.dev.

If you don't want security scanning, delete \`${WORKFLOW_PATH}\` before merging.

---

`;

export const pensarProvider: SecurityWorkflowProvider = {
  id: "pensar",
  label: "Pensar",
  workflowPath: WORKFLOW_PATH,
  workflowTemplate,
  prCallout,
};
