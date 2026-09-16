import { PILE_QA_LABELS } from "@/lib/fixtures/billing-req";
import type { QaLabel } from "@/lib/composio/types";

const labels = PILE_QA_LABELS as Record<string, QaLabel>;

export const MOCK_PILE_MAP = [
  { id: "ashby_app_01", name: "Lena Okonkwo", label: labels.ashby_app_01 },
  { id: "ashby_app_02", name: "Henrik Voss", label: labels.ashby_app_02 },
  { id: "ashby_app_03", name: "Jonah Hale", label: labels.ashby_app_03 },
  { id: "ashby_app_04", name: "Camille Dubois", label: labels.ashby_app_04 },
  { id: "ashby_app_05", name: "Priya Natarajan", label: labels.ashby_app_05 },
  { id: "ashby_app_06", name: "Nina Bergstrom", label: labels.ashby_app_06 },
  { id: "ashby_app_07", name: "Tyler Brooks", label: labels.ashby_app_07 },
  { id: "ashby_app_08", name: "Emily Zhao", label: labels.ashby_app_08, note: "thin" },
  { id: "ashby_app_09", name: "Arjun Mehta (Agency)", label: labels.ashby_app_09 },
  { id: "ashby_app_10", name: "Sofia Lang", label: labels.ashby_app_10 },
  { id: "ashby_app_11", name: "Chris Patel", label: labels.ashby_app_11 },
  { id: "ashby_app_12", name: "David Kim", label: labels.ashby_app_12 },
  { id: "ashby_app_13", name: "Hannah Goldstein", label: labels.ashby_app_13 },
  { id: "ashby_app_14", name: "John Smith", label: labels.ashby_app_14, note: "phantom · LinkedIn 404" },
  { id: "ashby_app_15", name: "Avery Quinn", label: labels.ashby_app_15, note: "phantom · claimed employer missing from LinkedIn-linked listedEmployers" },
  { id: "ashby_app_16", name: "Maya Krishnan", label: labels.ashby_app_16 },
  { id: "ashby_app_17", name: "M. Krishnan", label: labels.ashby_app_17, note: "duplicate · same LinkedIn-linked profileUrl as Maya" },
  { id: "ashby_app_18", name: "Alex Rivera", label: labels.ashby_app_18, note: "thin" },
] as const;

export const EMPTY_PILE = {
  reqId: "req_thin",
  slug: "thin-brief",
  title: "Untitled req",
  label: "empty",
  note: "Thin brief + zero Ashby applications",
} as const;
