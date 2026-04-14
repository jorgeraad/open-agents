/**
 * Description of a third-party security-scanning provider whose GitHub
 * Actions workflow can be injected into a user's repo as part of the
 * agent's first auto-commit.
 */
export interface SecurityWorkflowProvider {
  /** Stable identifier used in code and persisted preferences. */
  id: string;
  /** Human-readable label for the settings UI. */
  label: string;
  /** Repo-relative path where the workflow file is written. */
  workflowPath: string;
  /** Literal contents of the workflow file (as YAML). */
  workflowTemplate: string;
  /**
   * Markdown block prepended to the auto-generated PR body when this
   * provider's workflow was injected. Should explain what was added
   * and what the user needs to do to activate it.
   */
  prCallout: string;
}
