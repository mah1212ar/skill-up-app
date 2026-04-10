import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs/promises";
import path from "path";

const execPromise = promisify(exec);
const PROJECT_ROOT = "C:/Users/aripi/.gemini/antigravity/scratch/skillup-app";

const server = new Server(
  { name: "skillup-debug-server", version: "1.0.0" },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "run_linter",
      description: "Runs ESLint on the project to find syntax and style errors.",
      inputSchema: { type: "object", properties: {} },
    },
    {
      name: "run_tests",
      description: "Executes vitest/jest suites to check for functional bugs.",
      inputSchema: { type: "object", properties: {} },
    },
    {
      name: "read_error_logs",
      description: "Reads the last 50 lines of the backend error log.",
      inputSchema: { type: "object", properties: {} },
    }
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  try {
    switch (request.params.name) {
      case "run_linter":
        const { stdout: linterOut } = await execPromise("npm run lint", { cwd: path.join(PROJECT_ROOT, "frontend") });
        return { content: [{ type: "text", text: linterOut || "No linting errors found!" }] };

      case "run_tests":
        const { stdout: testOut, stderr: testErr } = await execPromise("npm test -- --run", { cwd: path.join(PROJECT_ROOT, "frontend") });
        return { content: [{ type: "text", text: testOut + testErr }] };

      case "read_error_logs":
        const logPath = path.join(PROJECT_ROOT, "backend", "error.log");
        const data = await fs.readFile(logPath, "utf-8");
        const lines = data.trim().split("\n").slice(-50).join("\n");
        return { content: [{ type: "text", text: lines || "Log file is empty." }] };

      default:
        throw new Error("Tool not found");
    }
  } catch (error) {
    return { content: [{ type: "text", text: `Error: ${error.message}` }], isError: true };
  }
});

const transport = new StdioServerTransport();
await server.connect(transport);