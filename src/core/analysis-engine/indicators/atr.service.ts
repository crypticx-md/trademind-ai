import { Candle } from "../../../shared/types/market.types";

export type VolatilityRegime =
  | "LOW_VOLATILITY"
  | "NORMAL_VOLATILITY"
  | "HIGH_VOLATILITY";

export interface ATRResult {
  period: number;
  value: number;
  averageATR: number;
  relativeATR: number;
  regime: VolatilityRegime;
}

export class ATRService {
  calculate(candles: Candle[], period = 14): number {
    if (period <= 0) {
      throw new Error("ATR period must be greater than 0.");
    }

    if (candles.length < period + 1) {
      throw new Error(
        `ATR period ${period} requires at least ${period + 1} candles.`
      );
    }

    const trueRanges: number[] = [];

    for (let i = 1; i < candles.length; i++) {
      const current = candles[i];
      const previous = candles[i - 1];

      const highLow = current.high - current.low;
      const highPreviousClose = Math.abs(
        current.high - previous.close
      );
      const lowPreviousClose = Math.abs(
        current.low - previous.close
      );

      const trueRange = Math.max(
        highLow,
        highPreviousClose,
        lowPreviousClose
      );

      trueRanges.push(trueRange);
    }

    const initialATR =
      trueRanges
        .slice(0, period)
        .reduce((sum, value) => sum + value, 0) / period;

    let atr = initialATR;

    for (let i = period; i < trueRanges.length; i++) {
      atr =
        (atr * (period - 1) + trueRanges[i]) /
        period;
    }

    return atr;
  }

 analyze(candles: Candle[], period = 14): ATRResult {
  const value = this.calculate(candles, period);

  const recentCandles = candles.slice(-(period * 3));

  const atrValues: number[] = [];

  for (let i = period + 1; i <= recentCandles.length; i++) {
    const subset = recentCandles.slice(0, i);

    atrValues.push(
      this.calculate(subset, period)
    );
  }

  const averageATR =
    atrValues.reduce((sum, atr) => sum + atr, 0) /
    atrValues.length;

  const relativeATR =
    averageATR === 0
      ? 1
      : value / averageATR;

  let regime: VolatilityRegime = "NORMAL_VOLATILITY";

  if (relativeATR >= 1.3) {
    regime = "HIGH_VOLATILITY";
  } else if (relativeATR <= 0.7) {
    regime = "LOW_VOLATILITY";
  }

  return {
    period,
    value,
    averageATR,
    relativeATR,
    regime,
  };
}
}