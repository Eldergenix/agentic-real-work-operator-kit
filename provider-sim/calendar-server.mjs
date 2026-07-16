import http from "node:http";

const port = Number(process.env.PORT ?? 8789);
const events = new Map();
let scenario = "normal";
let delayedReads = new Map();

const server = http.createServer(async (request, response) => {
  try {
    const url = new URL(request.url ?? "/", `http://${request.headers.host ?? "localhost"}`);
    if (url.pathname === "/__scenario" && request.method === "POST") {
      const body = JSON.parse(await readBody(request));
      scenario = String(body.scenario ?? "normal");
      json(response, 200, { scenario });
      return;
    }
    if (url.pathname === "/__reset" && request.method === "POST") {
      events.clear();
      delayedReads.clear();
      scenario = "normal";
      json(response, 200, { reset: true });
      return;
    }

    if (scenario === "authentication_required") {
      scenario = "normal";
      json(response, 401, { error: { message: "reauthentication required" } });
      return;
    }

    const match = url.pathname.match(/^\/calendar\/v3\/calendars\/([^/]+)\/events(?:\/([^/]+))?$/u);
    if (!match) {
      json(response, 404, { error: "not_found" });
      return;
    }
    const calendarId = decodeURIComponent(match[1]);
    const eventId = match[2] === undefined ? undefined : decodeURIComponent(match[2]);

    if (request.method === "POST" && eventId === undefined) {
      const body = JSON.parse(await readBody(request));
      const key = `${calendarId}:${body.id}`;
      if (events.has(key) || scenario === "duplicate_conflict") {
        scenario = "normal";
        json(response, 409, { error: { message: "duplicate" } });
        return;
      }
      if (scenario === "timeout_before_commit") {
        scenario = "normal";
        request.socket.destroy();
        return;
      }
      if (scenario === "transient_500") {
        scenario = "normal";
        json(response, 503, { error: { message: "transient" } });
        return;
      }
      const event = {
        ...body,
        etag: `\"${Date.now()}\"`,
        status: "confirmed",
        updated: new Date().toISOString(),
      };
      events.set(key, event);
      if (scenario === "delayed_visibility") delayedReads.set(key, 2);
      if (scenario === "timeout_after_commit") {
        scenario = "normal";
        request.socket.destroy();
        return;
      }
      json(response, 200, event);
      return;
    }

    if (eventId === undefined) {
      json(response, 400, { error: "event_id_required" });
      return;
    }
    const key = `${calendarId}:${eventId}`;

    if (request.method === "GET") {
      const remaining = delayedReads.get(key) ?? 0;
      if (remaining > 0) {
        delayedReads.set(key, remaining - 1);
        json(response, 404, { error: { message: "not visible yet" } });
        return;
      }
      const event = events.get(key);
      if (event === undefined) {
        json(response, 404, { error: { message: "not found" } });
        return;
      }
      if (scenario === "readback_mismatch") {
        scenario = "normal";
        json(response, 200, { ...event, summary: `${event.summary ?? ""} [mismatch]` });
        return;
      }
      json(response, 200, event);
      return;
    }

    if (request.method === "DELETE") {
      if (scenario !== "delete_lingers") events.delete(key);
      else scenario = "normal";
      response.writeHead(204);
      response.end();
      return;
    }

    json(response, 405, { error: "method_not_allowed" });
  } catch (error) {
    json(response, 500, { error: error instanceof Error ? error.message : "unknown" });
  }
});

server.listen(port, "127.0.0.1", () => {
  console.log(JSON.stringify({ event: "provider_sim_started", port }));
});

function json(response, status, body) {
  response.writeHead(status, { "content-type": "application/json" });
  response.end(JSON.stringify(body));
}

async function readBody(request) {
  const chunks = [];
  for await (const chunk of request) chunks.push(chunk);
  return Buffer.concat(chunks).toString("utf8");
}
