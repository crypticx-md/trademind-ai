import { EMAResult } from "../indicators/ema.service";
import { RSIResult } from "../indicators/rsi.service";
import { VolumeAnalysisResult } from "../volume/volume.service";
import { ATRResult } from "../indicators/atr.service";

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
              rsi: RSIResult,
               volume: VolumeAnalysisResult,
               atr: ATRResult
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

  let volumeConfirmationScore = 0;

if (volume.relativeVolume >= 1.5) {
  volumeConfirmationScore = 20;
} else if (volume.relativeVolume >= 1.1) {
  volumeConfirmationScore = 10;
} else if (volume.relativeVolume < 0.7) {
  volumeConfirmationScore = -15;
} else if (volume.relativeVolume < 0.9) {
  volumeConfirmationScore = -5;
}

const directionMultiplier =
  finalScore > 0 ? 1 :
  finalScore < 0 ? -1 :
  0;

  const volumeAdjustedScore =
  finalScore +
  volumeConfirmationScore * directionMultiplier;

   const absoluteScore = Math.abs(volumeAdjustedScore);

let direction: TrendDirection = "NEUTRAL";
let strength: TrendStrength = "WEAK";

if (volumeAdjustedScore >= 20) {
  direction = "BULLISH";
} else if (volumeAdjustedScore <= -20) {
  direction = "BEARISH";
}

if (absoluteScore >= 70) {
  strength = "STRONG";
} else if (absoluteScore >= 40) {
  strength = "MODERATE";
}

let volatilityAdjustment = 0;

if (atr.regime === "HIGH_VOLATILITY") {
  volatilityAdjustment = -10;
} else if (atr.regime === "LOW_VOLATILITY") {
  volatilityAdjustment = -5;
}

const confidence = Math.min(
  100,
  Math.max(
    0,
    Math.round(
      50 +
      absoluteScore * 0.5 +
      volatilityAdjustment
    )
  )
);

return {
  direction,
  strength,
  score: Math.round(volumeAdjustedScore),
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