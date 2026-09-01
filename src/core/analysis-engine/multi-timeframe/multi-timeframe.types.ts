export type TimeframeInputSignal =
  | "LONG"
  | "SHORT"
  | "NEUTRAL";

export type MultiTimeframeSignal =
  | "LONG"
  | "SHORT"
  | "WAIT";


  export interface MultiTimeframeDecision {
  signal: MultiTimeframeSignal;
  confidence: number;
  alignmentScore: number;
  reason: string;
}