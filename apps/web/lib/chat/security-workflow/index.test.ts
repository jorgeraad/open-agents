import { beforeEach, describe, expect, mock, test } from "bun:test";
import {
  DEFAULT_SECURITY_WORKFLOW_PROVIDER_ID,
  injectSecurityWorkflow,
  SECURITY_WORKFLOW_PROVIDERS,
} from "./index";

type WriteCall = { path: string; content: string };

let readFileResult: { content: string } | { error: Error };
let writeCalls: WriteCall[];
let writeFileShouldThrow: Error | null;

const sandbox = {
  workingDirectory: "/vercel/sandbox",
  readFile: mock(async (_path: string, _encoding: "utf-8"): Promise<string> => {
    if ("error" in readFileResult) {
      throw readFileResult.error;
    }
    return readFileResult.content;
  }),
  writeFile: mock(
    async (
      path: string,
      content: string,
      _encoding: "utf-8",
    ): Promise<void> => {
      if (writeFileShouldThrow) {
        throw writeFileShouldThrow;
      }
      writeCalls.push({ path, content });
    },
  ),
};

beforeEach(() => {
  readFileResult = { error: new Error("Failed to read file: missing") };
  writeCalls = [];
  writeFileShouldThrow = null;
});

describe("injectSecurityWorkflow", () => {
  test("writes the default provider's workflow when the file does not exist", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await injectSecurityWorkflow(sandbox as any);
    const provider =
      SECURITY_WORKFLOW_PROVIDERS[DEFAULT_SECURITY_WORKFLOW_PROVIDER_ID];

    expect(result).toBe(true);
    expect(writeCalls).toHaveLength(1);
    expect(writeCalls[0]?.path).toBe(
      `/vercel/sandbox/${provider.workflowPath}`,
    );
    expect(writeCalls[0]?.content).toBe(provider.workflowTemplate);
  });

  test("skips injection when the workflow file already exists", async () => {
    readFileResult = { content: "name: Something else\n" };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await injectSecurityWorkflow(sandbox as any);

    expect(result).toBe(false);
    expect(writeCalls).toHaveLength(0);
  });

  test("returns false and does not throw when the write fails", async () => {
    writeFileShouldThrow = new Error("disk full");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await injectSecurityWorkflow(sandbox as any);

    expect(result).toBe(false);
  });

  test("handles working directories that end in a trailing slash", async () => {
    const provider =
      SECURITY_WORKFLOW_PROVIDERS[DEFAULT_SECURITY_WORKFLOW_PROVIDER_ID];
    const sandboxWithSlash = {
      ...sandbox,
      workingDirectory: "/vercel/sandbox/",
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await injectSecurityWorkflow(sandboxWithSlash as any);

    expect(result).toBe(true);
    expect(writeCalls[0]?.path).toBe(
      `/vercel/sandbox/${provider.workflowPath}`,
    );
  });

  test("writes the specific provider when one is passed explicitly", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await injectSecurityWorkflow(sandbox as any, "pensar");

    expect(result).toBe(true);
    expect(writeCalls[0]?.content).toBe(
      SECURITY_WORKFLOW_PROVIDERS.pensar.workflowTemplate,
    );
  });
});
