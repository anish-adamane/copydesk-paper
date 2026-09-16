import { PILE_QA_LABELS } from "@/lib/fixtures/billing-req";

export const MOCK_PILE_MAP = [
  { id: "ashby_app_01", name: "Lena Okonkwo", label: PILE_QA_LABELS.ashby_app_01 },
  { id: "ashby_app_02", name: "Henrik Voss", label: PILE_QA_LABELS.ashby_app_02 },
  { id: "ashby_app_03", name: "Jonah Hale", label: PILE_QA_LABELS.ashby_app_03 },
  { id: "ashby_app_04", name: "Camille Dubois", label: PILE_QA_LABELS.ashby_app_04 },
  { id: "ashby_app_05", name: "Priya Natarajan", label: PILE_QA_LABELS.ashby_app_05 },
  { id: "ashby_app_06", name: "Nina Bergstrom", label: PILE_QA_LABELS.ashby_app_06 },
  { id: "ashby_app_07", name: "Tyler Brooks", label: PILE_QA_LABELS.ashby_app_07 },
  { id: "ashby_app_08", name: "Emily Zhao", label: PILE_QA_LABELS.ashby_app_08, note: "thin" },
  { id: "ashby_app_09", name: "Arjun Mehta (Agency)", label: PILE_QA_LABELS.ashby_app_09 },
  { id: "ashby_app_10", name: "Sofia Lang", label: PILE_QA_LABELS.ashby_app_10 },
  { id: "ashby_app_11", name: "Chris Patel", label: PILE_QA_LABELS.ashby_app_11 },
  { id: "ashby_app_12", name: "David Kim", label: PILE_QA_LABELS.ashby_app_12 },
  { id: "ashby_app_13", name: "Hannah Goldstein", label: PILE_QA_LABELS.ashby_app_13 },
  { id: "ashby_app_14", name: "John Smith", label: PILE_QA_LABELS.ashby_app_14, note: "phantom · LinkedIn 404" },
  { id: "ashby_app_15", name: "Avery Quinn", label: PILE_QA_LABELS.ashby_app_15, note: "phantom · claimed employer missing from LinkedIn-linked listedEmployers" },
  { id: "ashby_app_16", name: "Maya Krishnan", label: PILE_QA_LABELS.ashby_app_16 },
  { id: "ashby_app_17", name: "M. Krishnan", label: PILE_QA_LABELS.ashby_app_17, note: "duplicate · same LinkedIn-linked profileUrl as Maya" },
  { id: "ashby_app_18", name: "Alex Rivera", label: PILE_QA_LABELS.ashby_app_18, note: "thin" },
] as const;

export const EMPTY_PILE = {
  reqId: "req_thin",
  slug: "thin-brief",
  title: "Untitled req",
  label: "empty",
  note: "Thin brief + zero Ashby applications",
} as const;
