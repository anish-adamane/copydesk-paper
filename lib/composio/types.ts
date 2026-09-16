export type ConnectionStatus = "connected" | "needs_connect" | "needs_reauth";

export type LinkedInFetchStatus = "ok" | "404" | "unlinked" | "parse_failed";

export type AshbyApplicationAnswer = {
  question: string;
  answer: string;
};

export type AshbyLinkedInFields = {
  profileUrl: string | null;
  headline: string | null;
  location: string | null;
  currentTitle: string | null;
  currentEmployer: string | null;
  listedEmployers: string[];
  yearsExperience: number | null;
  skills: string[];
  fetchStatus: LinkedInFetchStatus;
};

export type QaLabel =
  | "keep-quality"
  | "kill-quality"
  | "thin"
  | "phantom"
  | "duplicate";

export type AshbyApplication = {
  applicationId: string;
  appliedAt: string;
  jobId: string;
  qaLabel: QaLabel;
  candidate: {
    name: string;
    email: string | null;
    emails: string[];
  };
  application: {
    claimedTitle: string | null;
    claimedEmployer: string | null;
    coverNote: string | null;
    resumeSummary: string | null;
    answers: AshbyApplicationAnswer[];
  };
  linkedin: AshbyLinkedInFields;
};

export type SourceAnomaly =
  | "linkedin_fetch_404"
  | "linkedin_unlinked"
  | "linkedin_parse_failed"
  | "claimed_employer_missing_from_linkedin"
  | "missing_email"
  | "duplicate_linkedin_identity";

export type OutboundChannel = "gmail" | "ashby";

export type ToolRunStatus = "ok" | "failed" | "blocked";

export interface DeskPipes {
  mode: "mock" | "live";
  getConnectionStatus(toolkit: string): Promise<ConnectionStatus>;
  connect(toolkit: string): Promise<{
    status: ConnectionStatus;
    authUrl: string | null;
  }>;
  sendGmail(input: {
    to: string;
    subject: string;
    body: string;
  }): Promise<{ ok: true; messageId: string } | { ok: false; failure: string }>;
  writeAshbyStage(input: {
    applicationId: string;
    stage: string;
  }): Promise<{ ok: true; stage: string } | { ok: false; failure: string }>;
}
