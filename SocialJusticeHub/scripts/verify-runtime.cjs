#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");

const projectRoot = path.resolve(__dirname, "..");
const distEntry = path.join(projectRoot, "dist", "index.js");
const port = Number.parseInt(process.env.VERIFY_PORT || "5099", 10);
const host = process.env.VERIFY_HOST || "127.0.0.1";
const baseUrl = `http://${host}:${port}`;
const startupTimeoutMs = Number.parseInt(process.env.VERIFY_STARTUP_TIMEOUT_MS || "45000", 10);

const fallbackJwtSecret =
  "runtime-test-jwt-secret-at-least-32-characters";
const fallbackSessionSecret =
  "runtime-test-session-secret-at-least-32-characters";

if (!fs.existsSync(distEntry)) {
  console.error("dist/index.js was not found.");
  console.error("Run `npm run build` before running runtime verification.");
  process.exit(1);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForHealth(maxWaitMs) {
  const started = Date.now();
  while (Date.now() - started < maxWaitMs) {
    try {
      const response = await fetch(`${baseUrl}/api/health`);
      if (response.ok) return true;
    } catch {
      // Keep polling until timeout.
    }
    await sleep(500);
  }
  return false;
}

function runCommand(command, args, envOverrides = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: projectRoot,
      env: { ...process.env, ...envOverrides },
      stdio: "inherit",
    });

    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`${command} ${args.join(" ")} exited with code ${code}`));
      }
    });
  });
}

async function shutdownServer(child) {
  if (!child || child.killed) return;

  child.kill("SIGTERM");
  await Promise.race([
    new Promise((resolve) => child.once("exit", resolve)),
    sleep(3000),
  ]);

  if (!child.killed) {
    child.kill("SIGKILL");
  }
}

async function main() {
  console.log(`Starting production server for runtime verification at ${baseUrl}`);

  const serverEnv = {
    NODE_ENV: "production",
    PORT: String(port),
    ENABLE_NLP_MODELS: process.env.ENABLE_NLP_MODELS || "false",
    JWT_SECRET: process.env.JWT_SECRET || fallbackJwtSecret,
    SESSION_SECRET: process.env.SESSION_SECRET || fallbackSessionSecret,
  };

  const server = spawn(process.execPath, [distEntry], {
    cwd: projectRoot,
    env: { ...process.env, ...serverEnv },
    stdio: "inherit",
  });

  try {
    const healthy = await waitForHealth(startupTimeoutMs);
    if (!healthy) {
      throw new Error(
        `Server did not become healthy within ${startupTimeoutMs}ms at ${baseUrl}/api/health`
      );
    }

    await runCommand(process.execPath, [path.join("scripts", "test-endpoints.js")], {
      API_BASE_URL: baseUrl,
    });
  } finally {
    await shutdownServer(server);
  }

  console.log("Runtime verification passed.");
}

main().catch((error) => {
  const message = error instanceof Error ? error.stack || error.message : String(error);
  console.error(`Runtime verification failed: ${message}`);
  process.exit(1);
});
