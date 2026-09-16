"use client";

import { useMemo, useState } from "react";
import { connectAction } from "@/app/actions/desk";
import {
  catalogById,
  COMPOSIO_CATALOG,
  searchCatalog,
} from "@/lib/composio/catalog";
import type { ConnectionStatus } from "@/lib/composio/types";

export function ConnectStrip({
  connections,
  composioMode,
}: {
  connections: Record<string, ConnectionStatus>;
  composioMode: "mock" | "live";
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const gmail = connections.gmail ?? "needs_connect";
  const ashby = connections.ashby ?? "needs_reauth";
  const connectedIds = Object.entries(connections)
    .filter(([, status]) => status === "connected")
    .map(([id]) => id);
  const missing = [
    gmail !== "connected" ? "gmail" : null,
    ashby !== "connected" ? "ashby" : null,
  ].filter((id): id is string => Boolean(id));
  const needCopy =
    gmail !== "connected"
      ? gmail === "needs_reauth"
        ? " — Gmail session needs reauth for approve send"
        : " — Gmail session missing for approve send"
      : ashby !== "connected"
        ? " — Ashby session needs reauth"
        : " — sessions ready for this req";
  const hits = useMemo(() => searchCatalog(query), [query]);

  return (
    <>
      <aside
        data-testid="connect-strip"
        className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 bg-[var(--ink)] px-5 py-2 font-mono text-[11px] leading-[1.4] text-[var(--paper)]"
      >
        <div>
          <strong className="font-semibold">Connect what this run needs</strong>
          <span className="text-[#f0d4d0]" data-testid="strip-need">
            {needCopy}
          </span>
          <span className="ml-2 opacity-70">
            · {composioMode === "mock" ? "mock adapter" : "composio live"}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {connectedIds.map((id) => (
            <span
              key={id}
              data-testid={`pipe-${id}`}
              className="border border-[var(--paper)] bg-[var(--paper)] px-1.5 py-0.5 text-[var(--ink)]"
            >
              {catalogById(id)?.name ?? id}
            </span>
          ))}
          {missing.map((id) => (
            <span
              key={id}
              data-testid={`pipe-${id}`}
              className="border border-[var(--stamp)] px-1.5 py-0.5 text-[#f0d4d0]"
            >
              {catalogById(id)?.name ?? id} ·{" "}
              {(connections[id] ?? "needs_connect").replaceAll("_", " ")}
            </span>
          ))}
        </div>
        <button
          type="button"
          data-testid="open-catalog"
          className="border-[1.5px] border-[var(--paper)] bg-transparent px-2.5 py-1.5 font-mono text-[11.5px] font-medium text-[var(--paper)] hover:bg-[var(--paper)] hover:text-[var(--ink)]"
          onClick={() => setOpen(true)}
        >
          Search Composio catalog…
        </button>
      </aside>

      {open ? (
        <div
          className="fixed inset-0 z-30 flex items-start justify-center bg-[rgba(26,21,16,0.45)] px-4 pt-[4vh]"
          data-testid="catalog-scrim"
          role="dialog"
          aria-label="Composio catalog"
          onClick={(event) => {
            if (event.target === event.currentTarget) setOpen(false);
          }}
        >
          <div className="w-full max-w-[520px] border border-[var(--ink)] bg-[var(--sheet)] shadow-[0_12px_40px_rgba(0,0,0,0.25)]">
            <header className="flex items-baseline justify-between gap-4 border-b border-[var(--rule)] bg-[var(--paper2)] px-4 py-3">
              <h2 className="font-display text-base font-semibold">Connect a toolkit</h2>
              <button
                type="button"
                className="font-mono text-[11px] text-[var(--ink-mute)]"
                onClick={() => setOpen(false)}
              >
                close
              </button>
            </header>
            <div className="border-b border-[var(--rule)] px-4 py-3">
              <input
                data-testid="catalog-search"
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search Ashby, Greenhouse, Gmail, LinkedIn, Notion…"
                autoComplete="off"
                autoFocus
                className="w-full border-[1.5px] border-[var(--ink)] bg-[var(--paper)] px-2.5 py-2 font-mono text-[13.5px] text-[var(--ink)] outline-none"
              />
              <p className="mt-1.5 font-mono text-[10px] text-[var(--ink-mute)]">
                Full Composio catalog · pick per job · OAuth happens here, then back to
                the desk · {COMPOSIO_CATALOG.length} toolkits in this slice
              </p>
            </div>
            <div className="max-h-[52vh] overflow-auto" data-testid="catalog-list">
              {hits.length === 0 ? (
                <p className="px-4 py-6 font-mono text-[11px] text-[var(--ink-mute)]">
                  No toolkit matches “{query}”.
                </p>
              ) : (
                hits.map((toolkit) => {
                  const status = connections[toolkit.id] ?? "needs_connect";
                  const on = status === "connected";
                  return (
                    <form
                      key={toolkit.id}
                      action={connectAction}
                      data-testid={`catalog-${toolkit.id}`}
                      className={`grid grid-cols-[1fr_auto] items-center gap-2 border-b border-[var(--rule)] px-4 py-2.5 hover:bg-[#efe4cc] ${on ? "connected" : ""}`}
                    >
                      <input type="hidden" name="toolkit" value={toolkit.id} />
                      <div>
                        <div className="text-[15px] font-semibold">{toolkit.name}</div>
                        <div className="mt-0.5 font-mono text-[10px] text-[var(--ink-mute)]">
                          {toolkit.kind}
                          {status === "needs_reauth" ? " · needs reauth" : ""}
                        </div>
                      </div>
                      <button
                        type="submit"
                        disabled={on}
                        className={`border px-2 py-1 font-mono text-[10px] font-medium ${on ? "border-[var(--kept)] text-[var(--kept)]" : "border-[var(--ink)] text-[var(--ink)]"}`}
                      >
                        {on ? "Connected" : status === "needs_reauth" ? "Reauth" : "Connect"}
                      </button>
                    </form>
                  );
                })
              )}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
