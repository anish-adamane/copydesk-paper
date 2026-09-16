import type { ConnectionStatus, OutboundChannel } from "@/lib/composio/types";

export type DispatchBlockCode =
  | "NOT_KEEP"
  | "NEEDS_APPROVE"
  | "DRAFT_CHANGED"
  | "NEEDS_CONNECT"
  | "NEEDS_REAUTH"
  | "MISSING_EMAIL"
  | "MISSING_APPLICATION";

export type DispatchBlock = {
  code: DispatchBlockCode;
  message: string;
};

export type DispatchGateInput = {
  channel: OutboundChannel;
  verdict: "keep" | "kill" | null;
  approveRecorded: boolean;
  approveDraftRevision: number | null;
  currentDraftRevision: number;
  connectionStatus: ConnectionStatus;
  email: string | null;
  ashbyApplicationId: string | null;
};

export function assertCanDispatch(input: DispatchGateInput): DispatchBlock | null {
  if (input.verdict !== "keep") {
    return {
      code: "NOT_KEEP",
      message: "Only kept candidates can leave the desk.",
    };
  }

  if (!input.approveRecorded) {
    return {
      code: "NEEDS_APPROVE",
      message: "Record Approve before any email or Ashby write.",
    };
  }

  if (
    input.approveDraftRevision === null ||
    input.approveDraftRevision !== input.currentDraftRevision
  ) {
    return {
      code: "DRAFT_CHANGED",
      message: "Draft changed after Approve. Re-approve this revision.",
    };
  }

  if (input.connectionStatus === "needs_connect") {
    return {
      code: "NEEDS_CONNECT",
      message:
        input.channel === "gmail"
          ? "Gmail is not connected. Send stays blocked."
          : "Ashby is not connected. Stage write stays blocked.",
    };
  }

  if (input.connectionStatus === "needs_reauth") {
    return {
      code: "NEEDS_REAUTH",
      message:
        input.channel === "gmail"
          ? "Gmail needs reauth. Send stays blocked."
          : "Ashby needs reauth. Stage write stays blocked.",
    };
  }

  if (input.channel === "gmail" && !input.email) {
    return {
      code: "MISSING_EMAIL",
      message: "No email on the Ashby application. Cannot send.",
    };
  }

  if (input.channel === "ashby" && !input.ashbyApplicationId) {
    return {
      code: "MISSING_APPLICATION",
      message: "No Ashby application id. Cannot write a stage.",
    };
  }

  return null;
}

export function approveCoversChannel() {
  return true;
}
