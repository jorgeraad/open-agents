import type { SecurityWorkflowProvider } from "../types";
import { pensarProvider } from "./pensar";

/**
 * All registered security-scanning providers, keyed by id.
 *
 * To add a provider:
 *   1. Drop `<name>.yml` with the workflow body (real YAML)
 *   2. Drop `<name>.ts` that imports the YAML and exports a
 *      `SecurityWorkflowProvider`
 *   3. Add it to the registry below and extend
 *      `SecurityWorkflowProviderId` in `../types.ts`
 */
export const SECURITY_WORKFLOW_PROVIDERS = {
  pensar: pensarProvider,
} as const satisfies Record<string, SecurityWorkflowProvider>;

export type SecurityWorkflowProviderId =
  keyof typeof SECURITY_WORKFLOW_PROVIDERS;

/** Provider chosen when scanning is enabled without an explicit pick. */
export const DEFAULT_SECURITY_WORKFLOW_PROVIDER_ID: SecurityWorkflowProviderId =
  "pensar";
