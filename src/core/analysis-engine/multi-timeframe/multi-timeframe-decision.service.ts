import {
  MultiTimeframeDecision,
  MultiTimeframeSignal,
  TimeframeInputSignal,
} from "./multi-timeframe.types";

export class MultiTimeframeDecisionService {

    combineSignals(
 higherSignal: TimeframeInputSignal,
trendSignal: TimeframeInputSignal,
setupSignal: TimeframeInputSignal,
 higherConfidence: number,
  trendConfidence: number,
  setupConfidence: number
): MultiTimeframeDecision {

  const clampConfidence = (value: number) =>
  Math.max(0, Math.min(100, value));
  
const weightedConfidence = Math.round(
  clampConfidence(higherConfidence) * 0.4 +
  clampConfidence(trendConfidence) * 0.35 +
  clampConfidence(setupConfidence) * 0.25
);

  if (
    higherSignal === "LONG" &&
    trendSignal === "LONG" &&
    setupSignal === "LONG"
  ) {
    return {
      signal: "LONG",
      confidence:  weightedConfidence,
      alignmentScore: 100,
      reason: "All timeframes are aligned bullish.",
    };
  }

  if (
    higherSignal === "SHORT" &&
    trendSignal === "SHORT" &&
    setupSignal === "SHORT"
  ) {
    return {
      signal: "SHORT",
      confidence: weightedConfidence,
      alignmentScore: 100,
      reason: "All timeframes are aligned bearish.",
    };
  }

  const signals = [
  higherSignal,
  trendSignal,
  setupSignal,
];

const longCount = signals.filter(
  (signal) => signal === "LONG"
).length;

const shortCount = signals.filter(
  (signal) => signal === "SHORT"
).length;

const strongestAlignment = Math.max(
  longCount,
  shortCount
);

const alignmentScore = Math.round(
  (strongestAlignment / 3) * 100
);

let reason = "Timeframes are not fully aligned.";

if (longCount === 2) {
  reason = "Two timeframes are bullish, but full confirmation is missing.";
} else if (shortCount === 2) {
  reason = "Two timeframes are bearish, but full confirmation is missing.";
} else if (
  longCount === 0 &&
  shortCount === 0
) {
  reason = "All timeframes are neutral.";
}

  return {
  signal: "WAIT",
  confidence: weightedConfidence,
  alignmentScore,
  reason,
};

}

}