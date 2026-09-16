import type { AshbyApplication, SourceAnomaly } from "@/lib/composio/types";

function employerKey(value: string) {
  return value.trim().toLowerCase();
}

export function claimedEmployerMissingFromLinkedIn(app: AshbyApplication) {
  const claimed = app.application.claimedEmployer?.trim();
  if (!claimed) return false;
  if (app.linkedin.fetchStatus !== "ok") return true;
  return !app.linkedin.listedEmployers.some(
    (employer) => employerKey(employer) === employerKey(claimed),
  );
}

export function detectSourceAnomalies(
  app: AshbyApplication,
  pile: AshbyApplication[] = [],
): SourceAnomaly[] {
  const anomalies: SourceAnomaly[] = [];

  if (app.linkedin.fetchStatus === "404") anomalies.push("linkedin_fetch_404");
  if (app.linkedin.fetchStatus === "unlinked") anomalies.push("linkedin_unlinked");
  if (app.linkedin.fetchStatus === "parse_failed") {
    anomalies.push("linkedin_parse_failed");
  }
  if (claimedEmployerMissingFromLinkedIn(app)) {
    anomalies.push("claimed_employer_missing_from_linkedin");
  }
  if (!app.candidate.email) anomalies.push("missing_email");

  if (app.linkedin.profileUrl) {
    const twins = pile.filter(
      (other) =>
        other.applicationId !== app.applicationId &&
        other.linkedin.profileUrl === app.linkedin.profileUrl,
    );
    if (twins.length > 0) anomalies.push("duplicate_linkedin_identity");
  }

  return anomalies;
}

export function isPhantomOrJunk(app: AshbyApplication) {
  return detectSourceAnomalies(app).some((anomaly) =>
    [
      "linkedin_fetch_404",
      "claimed_employer_missing_from_linkedin",
      "linkedin_parse_failed",
    ].includes(anomaly),
  );
}

export function findDuplicateGroups(pile: AshbyApplication[]) {
  const byUrl = new Map<string, AshbyApplication[]>();
  for (const app of pile) {
    const url = app.linkedin.profileUrl;
    if (!url) continue;
    const group = byUrl.get(url) ?? [];
    group.push(app);
    byUrl.set(url, group);
  }
  return [...byUrl.values()].filter((group) => group.length > 1);
}
