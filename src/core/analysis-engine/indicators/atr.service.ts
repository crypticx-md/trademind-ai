import { Candle } from "../../../shared/types/market.types";

export interface ATRResult {
  period: number;
  value: number;
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
    return {
      period,
      value: this.calculate(candles, period),
    };
  }
}