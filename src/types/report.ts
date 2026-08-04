export type ReportType = "daterange" | "inside" | "purpose";

export interface ReportRow {
  id: string;
  visitorCode: string;
  fullName: string;
  phone: string;
  company: string | null;
  purpose: string;
  personToMeet: string;
  checkInTime: Date;
  checkOutTime: Date | null;
  status: "CHECKED_IN" | "CHECKED_OUT";
}

export interface PurposeSummaryItem {
  purpose: string;
  count: number;
}

export interface ReportResult {
  type: ReportType;
  generatedAt: string;
  range: {
    start: string | null;
    end: string | null;
  };
  total: number;
  purposeSummary: PurposeSummaryItem[];
  rows: ReportRow[];
}
