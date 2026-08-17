import { EMAResult } from "../indicators/ema.service";

export type TrendDirection =
  | "BULLISH"
  | "BEARISH"
  | "NEUTRAL";

export type TrendStrength =
  | "WEAK"
  | "MODERATE"
  | "STRONG";

export interface TrendAnalysisResult {
  direction: TrendDirection;
  strength: TrendStrength;
  score: number;
  confidence: number;
}

export class TrendService {
  analyzeEMA(emaResults: EMAResult[]): TrendAnalysisResult {
    const ema9 = this.getEMA(emaResults, 9);
    const ema20 = this.getEMA(emaResults, 20);
    const ema50 = this.getEMA(emaResults, 50);
    const ema100 = this.getEMA(emaResults, 100);
    const ema200 = this.getEMA(emaResults, 200);

    const bullishConditions = [
      ema9 > ema20,
      ema20 > ema50,
      ema50 > ema100,
      ema100 > ema200,
    ];

    const bearishConditions = [
      ema9 < ema20,
      ema20 < ema50,
      ema50 < ema100,
      ema100 < ema200,
    ];

    const bullishScore =
      bullishConditions.filter(Boolean).length;

    const bearishScore =
      bearishConditions.filter(Boolean).length;

    if (bullishScore === 4) {
      return {
        direction: "BULLISH",
        strength: "STRONG",
        score: 100,
        confidence: 100,
      };
    }

    if (bearishScore === 4) {
      return {
        direction: "BEARISH",
        strength: "STRONG",
        score: -100,
        confidence: 100,
      };
    }

    if (bullishScore >= 3) {
      return {
        direction: "BULLISH",
        strength: "MODERATE",
        score: 60,
        confidence: 75,
      };
    }

    if (bearishScore >= 3) {
      return {
        direction: "BEARISH",
        strength: "MODERATE",
        score: -60,
        confidence: 75,
      };
    }

    return {
      direction: "NEUTRAL",
      strength: "WEAK",
      score: 0,
      confidence: 50,
    };
  }

  private getEMA(
    emaResults: EMAResult[],
    period: number
  ): number {
    const result = emaResults.find(
      (ema) => ema.period === period
    );

    if (!result) {
      throw new Error(
        `EMA ${period} is required for trend analysis.`
      );
    }

    return result.value;
  }
}