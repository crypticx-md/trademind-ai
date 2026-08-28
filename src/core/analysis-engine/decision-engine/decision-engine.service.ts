import { TrendAnalysisResult } from "../trend/trend.service";
import { MarketStructureResult } from "../market-structure/market-structure.service";
import { SupportResistanceResult } from "../support-resistance/support-resistance.service";

export type TradeSignal =
  | "LONG"
  | "SHORT"
  | "NEUTRAL";

export interface DecisionResult {
  signal: TradeSignal;
  score: number;
  confidence: number;

   breakdown: {
    trendAndStructure: number;
    rsi: number;
    volume: number;
    supportResistance: number;
  };
}

export class DecisionEngineService {
  analyze(
    trend: TrendAnalysisResult,
    marketStructure: MarketStructureResult,
    supportResistance: SupportResistanceResult,
    rsi: number,
    volumeStatus: string,
  ): DecisionResult {

  let score = 0;


  let trendAndStructureScore = 0;
  let rsiScore = 0;
  let volumeScore = 0;
  let supportResistanceScore = 0;

if (
  trend.direction === "BULLISH" &&
  marketStructure.direction === "BULLISH"
) {
  score += 60;
  trendAndStructureScore += 60;
}

if (
  trend.direction === "BEARISH" &&
  marketStructure.direction === "BEARISH"
) {
  score -= 60;
  trendAndStructureScore -= 60;
}

if (
  trend.direction === "BULLISH" &&
  marketStructure.direction === "BEARISH"
) {
  score -= 20;
  trendAndStructureScore -= 20;
}

if (
  trend.direction === "BEARISH" &&
  marketStructure.direction === "BULLISH"
) {
  score += 20;
  trendAndStructureScore += 20;
}

if (rsi >= 55 && rsi <= 70) {
  score += 10;
  rsiScore += 10;
}

if (rsi <= 45 && rsi >= 30) {
  score -= 10;
  rsiScore -= 10;
}

if (rsi > 70) {
  score -= 10;
  rsiScore -= 10;
}

if (rsi < 30) {
  score += 10;
  rsiScore += 10;
}


if (volumeStatus === "ABOVE_AVERAGE") {
  if (trend.direction === "BULLISH") {
    score += 10;
    volumeScore += 10;
  } else if (trend.direction === "BEARISH") {
    score -= 10;
    volumeScore -= 10;
  }
}

if (volumeStatus === "BELOW_AVERAGE") {
  if (trend.direction === "BULLISH") {
    score -= 10;
    volumeScore -= 10;
  } else if (trend.direction === "BEARISH") {
    score += 10;
    volumeScore += 10;
  }
}


const nearestResistance =
  supportResistance.nearestResistance;

const nearestSupport =
  supportResistance.nearestSupport;

if (trend.direction === "BULLISH" && nearestResistance) {
  const resistanceDistancePercent =
    nearestResistance.distanceFromCurrentPrice /
    nearestResistance.price;

  if (
    resistanceDistancePercent <= 0.01 &&
    nearestResistance.qualityScore >= 40
  ) {
    score -= 20;
    supportResistanceScore -= 20;
  }
}

if (trend.direction === "BEARISH" && nearestSupport) {
  const supportDistancePercent =
    nearestSupport.distanceFromCurrentPrice /
    nearestSupport.price;

  if (
    supportDistancePercent <= 0.01 &&
    nearestSupport.qualityScore >= 40
  ) {
    score += 20;
    supportResistanceScore += 20;
  }
}

let signal: TradeSignal = "NEUTRAL";

if (score >= 40) {
  signal = "LONG";
} else if (score <= -40) {
  signal = "SHORT";
}

const confidence =
  signal === "NEUTRAL"
    ? 40
    : Math.min(
        100,
        Math.round(
          (Math.abs(score) + trend.confidence) / 2
        )
      );

return {
  signal,
  score,
  confidence,
  breakdown: {
    trendAndStructure: trendAndStructureScore,
    rsi: rsiScore,
    volume: volumeScore,
    supportResistance: supportResistanceScore,
  },
}; 
  }
}