export type ErrorType = "none" | "mispronunciation" | "omission" | "insertion" | "unclear";

export interface WordResult {
  word: string;
  start_ms: number;
  end_ms: number;
  expected_phonemes: string[];
  actual_phonemes: string[];
  accuracy_score: number;
  error_type: ErrorType;
  feedback: string;
}

export interface ScoringResult {
  session_id: string;
  overall_score: number;
  sub_scores: {
    accuracy: number;
    fluency: number;
  };
  transcript: string;
  words: WordResult[];
  created_at: string;
  retention_expiry_at: string;
}

export interface ConsentResponse {
  session_id: string;
  consent_accepted: boolean;
  consent_timestamp: string;
  retention_expiry_at: string;
}
