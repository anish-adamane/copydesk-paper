import type { ConnectionStatus, DeskPipes } from "@/lib/composio/types";

const BASE = "https://backend.composio.dev/api/v3";

function headers() {
  const key = process.env.COMPOSIO_API_KEY;
  if (!key) throw new Error("COMPOSIO_API_KEY missing");
  return {
    Authorization: `Bearer ${key}`,
    "Content-Type": "application/json",
    "x-api-key": key,
  };
}

function userId() {
  return process.env.COMPOSIO_USER_ID ?? "copydesk-local";
}

async function composioFetch(path: string, init?: RequestInit) {
  const response = await fetch(`${BASE}${path}`, {
    ...init,
    headers: { ...headers(), ...(init?.headers ?? {}) },
  });
  const text = await response.text();
  let json: unknown = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = { raw: text };
  }
  if (!response.ok) {
    return { ok: false as const, status: response.status, json };
  }
  return { ok: true as const, status: response.status, json };
}

function toolkitConnected(json: unknown, toolkit: string): ConnectionStatus {
  const payload = json as {
    items?: Array<{ toolkit?: { slug?: string }; appName?: string; status?: string }>;
    connected_accounts?: Array<{
      toolkit?: { slug?: string };
      appName?: string;
      status?: string;
    }>;
  };
  const rows = payload.items ?? payload.connected_accounts ?? [];
  const match = rows.find((row) => {
    const slug = row.toolkit?.slug ?? row.appName ?? "";
    return slug.toLowerCase() === toolkit;
  });
  if (!match) return "needs_connect";
  const status = (match.status ?? "").toLowerCase();
  if (status.includes("expire") || status.includes("reauth")) return "needs_reauth";
  if (status === "active" || status === "connected" || status === "initiated") {
    return "connected";
  }
  return "needs_connect";
}

export function createLivePipes(): DeskPipes {
  return {
    mode: "live",
    async getConnectionStatus(toolkit) {
      const result = await composioFetch(
        `/connected_accounts?user_ids=${encodeURIComponent(userId())}`,
      );
      if (!result.ok) return "needs_connect";
      return toolkitConnected(result.json, toolkit);
    },
    async connect(toolkit) {
      const result = await composioFetch("/connected_accounts", {
        method: "POST",
        body: JSON.stringify({
          toolkit,
          user_id: userId(),
        }),
      });
      const json = result.json as { redirect_url?: string; redirectUrl?: string };
      const authUrl = json.redirect_url ?? json.redirectUrl ?? null;
      if (!result.ok) {
        return { status: "needs_connect", authUrl };
      }
      return { status: authUrl ? "needs_connect" : "connected", authUrl };
    },
    async sendGmail(input) {
      const result = await composioFetch("/tools/execute/GMAIL_SEND_EMAIL", {
        method: "POST",
        body: JSON.stringify({
          user_id: userId(),
          arguments: {
            to: input.to,
            subject: input.subject,
            body: input.body,
          },
        }),
      });
      if (!result.ok) {
        return {
          ok: false,
          failure: `Gmail execute failed (${result.status})`,
        };
      }
      return { ok: true, messageId: "composio_gmail" };
    },
    async writeAshbyStage(input) {
      const result = await composioFetch("/tools/execute/ASHBY_UPDATE_APPLICATION", {
        method: "POST",
        body: JSON.stringify({
          user_id: userId(),
          arguments: {
            applicationId: input.applicationId,
            stage: input.stage,
          },
        }),
      });
      if (!result.ok) {
        return {
          ok: false,
          failure: `Ashby execute failed (${result.status})`,
        };
      }
      return { ok: true, stage: input.stage };
    },
  };
}
