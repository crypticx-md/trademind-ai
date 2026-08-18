import { EMAResult } from "../indicators/ema.service";
import { RSIResult } from "../indicators/rsi.service";

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
  analyzeEMA(emaResults: EMAResult[],
             currentPrice: number,
              rsi: RSIResult
  ): TrendAnalysisResult {
    const ema9 = this.getEMA(emaResults, 9);
    const ema20 = this.getEMA(emaResults, 20);
    const ema50 = this.getEMA(emaResults, 50);
    const ema100 = this.getEMA(emaResults, 100);
    const ema200 = this.getEMA(emaResults, 200);

    const priceAboveEMA = {
    ema9: currentPrice > ema9,
    ema20: currentPrice > ema20,
    ema50: currentPrice > ema50,
    ema100: currentPrice > ema100,
    ema200: currentPrice > ema200,
};

const pricePositionScore =
  (priceAboveEMA.ema9 ? 1 : -1) * 10 +
  (priceAboveEMA.ema20 ? 1 : -1) * 15 +
  (priceAboveEMA.ema50 ? 1 : -1) * 20 +
  (priceAboveEMA.ema100 ? 1 : -1) * 25 +
  (priceAboveEMA.ema200 ? 1 : -1) * 30;

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

      const emaStructureScore =
  (bullishScore - bearishScore) * 25;

  const combinedScore =
  emaStructureScore * 0.6 +
  pricePositionScore * 0.4;

  const rsiMomentumScore =
  (rsi.value - 50) * 2;
  
  const finalScore =
  combinedScore * 0.8 +
  rsiMomentumScore * 0.2;

   const absoluteScore = Math.abs(combinedScore);

let direction: TrendDirection = "NEUTRAL";
let strength: TrendStrength = "WEAK";

if (combinedScore >= 20) {
  direction = "BULLISH";
} else if (combinedScore <= -20) {
  direction = "BEARISH";
}

if (absoluteScore >= 70) {
  strength = "STRONG";
} else if (absoluteScore >= 40) {
  strength = "MODERATE";
}

const confidence = Math.min(
  100,
  Math.round(50 + absoluteScore * 0.5)
);

return {
  direction,
  strength,
  score: Math.round(combinedScore),
  confidence,
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