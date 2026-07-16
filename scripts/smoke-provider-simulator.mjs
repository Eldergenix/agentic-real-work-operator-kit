import { spawn } from "node:child_process";
import process from "node:process";

const port = 8900 + (process.pid % 500);
const base = `http://127.0.0.1:${port}`;
const child = spawn(process.execPath, ["provider-sim/calendar-server.mjs"], {
  cwd: process.cwd(),
  env: { ...process.env, PORT: String(port) },
  stdio: ["ignore", "pipe", "pipe"],
});
let logs = "";
child.stdout.on("data", (chunk) => { logs += chunk.toString(); });
child.stderr.on("data", (chunk) => { logs += chunk.toString(); });

try {
  await waitUntilReady();
  const body = {
    id: "operator_provider_smoke",
    summary: "Operator Kit provider simulator smoke test",
    start: { dateTime: "2026-07-16T09:00:00Z" },
    end: { dateTime: "2026-07-16T09:30:00Z" },
  };
  const created = await request("POST", "/calendar/v3/calendars/primary/events", body, 200);
  assert(created.id === body.id, "create identity mismatch");
  const readBack = await request("GET", `/calendar/v3/calendars/primary/events/${body.id}`, undefined, 200);
  assert(readBack.summary === body.summary, "read-back mismatch");
  await request("DELETE", `/calendar/v3/calendars/primary/events/${body.id}`, undefined, 204);
  await request("GET", `/calendar/v3/calendars/primary/events/${body.id}`, undefined, 404);
  console.log(JSON.stringify({ event: "provider_simulator_smoke_passed", port }));
} finally {
  child.kill("SIGTERM");
  await new Promise((resolve) => child.once("exit", resolve));
}

async function waitUntilReady() {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    try {
      const response = await fetch(`${base}/__reset`, { method: "POST" });
      if (response.ok) return;
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  throw new Error(`provider simulator failed to start: ${logs}`);
}

async function request(method, path, body, expectedStatus) {
  const response = await fetch(`${base}${path}`, {
    method,
    headers: body === undefined ? undefined : { "content-type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (response.status !== expectedStatus) {
    throw new Error(`${method} ${path}: expected ${expectedStatus}, received ${response.status}: ${await response.text()}`);
  }
  if (expectedStatus === 204) return undefined;
  return response.json();
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}
