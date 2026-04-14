import type { Sandbox } from "@open-harness/sandbox";
import {
  DEFAULT_SECURITY_WORKFLOW_PROVIDER_ID,
  SECURITY_WORKFLOW_PROVIDERS,
  type SecurityWorkflowProviderId,
} from "./providers";

export type { SecurityWorkflowProvider } from "./types";
export {
  DEFAULT_SECURITY_WORKFLOW_PROVIDER_ID,
  SECURITY_WORKFLOW_PROVIDERS,
  type SecurityWorkflowProviderId,
};

function joinSandboxPath(cwd: string, relativePath: string): string {
  const trimmedCwd = cwd.endsWith("/") ? cwd.slice(0, -1) : cwd;
  return `${trimmedCwd}/${relativePath}`;
}

/**
 * Writes the provider's workflow file to the sandbox filesystem when it
 * is not already present on the current branch. Returns true when the
 * file was written, false when the file already existed or the write
 * failed. Non-throwing — injection is auxiliary and must not break the
 * commit flow.
 */
export async function injectSecurityWorkflow(
  sandbox: Sandbox,
  providerId: SecurityWorkflowProviderId = DEFAULT_SECURITY_WORKFLOW_PROVIDER_ID,
): Promise<boolean> {
  const provider = SECURITY_WORKFLOW_PROVIDERS[providerId];
  if (!provider) {
    console.warn(
      `[security-workflow] Unknown provider "${providerId}"; skipping injection.`,
    );
    return false;
  }

  const absolutePath = joinSandboxPath(
    sandbox.workingDirectory,
    provider.workflowPath,
  );

  try {
    await sandbox.readFile(absolutePath, "utf-8");
    return false;
  } catch {
    // File does not exist (or cannot be read) — proceed with injection.
  }

  try {
    await sandbox.writeFile(absolutePath, provider.workflowTemplate, "utf-8");
    return true;
  } catch (error) {
    console.warn(
      `[security-workflow] Failed to write workflow file for provider "${providerId}"; continuing without injection:`,
      error,
    );
    return false;
  }
}

export function getSecurityWorkflowPrCallout(
  providerId: SecurityWorkflowProviderId = DEFAULT_SECURITY_WORKFLOW_PROVIDER_ID,
): string {
  return SECURITY_WORKFLOW_PROVIDERS[providerId]?.prCallout ?? "";
}
