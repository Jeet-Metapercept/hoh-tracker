export interface HohTrackerRow {
  id: number;
  created_at: string;
  updated_at: string;
  status: boolean;
  step: string;
  process: number;
}

export interface ListApiResponse {
  success: boolean;
  message: string;
  data: HohTrackerRow[];
}
