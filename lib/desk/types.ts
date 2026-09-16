import type { AshbyApplication, ConnectionStatus, ToolRunStatus } from "@/lib/composio/types";

export type Verdict = "keep" | "kill";

export type RunStamp = {
  id: string;
  tool: string;
  status: ToolRunStatus;
  failure: string | null;
  createdAt: number;
};

export type DeskReq = {
  id: string;
  slug: string;
  title: string;
  company: string;
  location: string;
  hmName: string;
  hmRole: string;
  mustHaves: string[];
  niceToHaves: string[];
  outOfScope: string[];
  briefStatus: "complete" | "thin";
};

export type DeskCandidate = {
  id: string;
  reqId: string;
  ashbyApplicationId: string;
  name: string;
  email: string | null;
  why: string;
  whyNot: string;
  source: AshbyApplication;
  verdict: Verdict | null;
  decisionUpdatedAt: number | null;
  draft: {
    subject: string;
    body: string;
    revision: number;
  };
  approve: {
    recorded: boolean;
    draftRevision: number | null;
    createdAt: number | null;
  };
  runLogs: RunStamp[];
  latestByTool: Record<string, RunStamp | undefined>;
};

export type DeskSnapshot = {
  user: { id: string; email: string; name: string };
  req: DeskReq;
  reqs: Array<Pick<DeskReq, "id" | "title" | "briefStatus" | "slug">>;
  candidates: DeskCandidate[];
  connections: Record<string, ConnectionStatus>;
  composioMode: "mock" | "live";
};
