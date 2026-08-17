export interface RSIResult {
  period: number;
  value: number;
}

export class RSIService {
  calculate(values: number[], period = 14): number {
    if (values.length < period + 1) {
      throw new Error(
        `RSI period ${period} requires at least ${period + 1} values.`
      );
    }

    if (period <= 0) {
      throw new Error("RSI period must be greater than 0.");
    }

    let gains = 0;
    let losses = 0;

    for (let i = 1; i <= period; i++) {
      const change = values[i] - values[i - 1];

      if (change > 0) {
        gains += change;
      } else {
        losses += Math.abs(change);
      }
    }

    let averageGain = gains / period;
    let averageLoss = losses / period;

    for (let i = period + 1; i < values.length; i++) {
      const change = values[i] - values[i - 1];

      const gain = change > 0 ? change : 0;
      const loss = change < 0 ? Math.abs(change) : 0;

      averageGain =
        (averageGain * (period - 1) + gain) / period;

      averageLoss =
        (averageLoss * (period - 1) + loss) / period;
    }

    if (averageLoss === 0) {
      return 100;
    }

    const relativeStrength = averageGain / averageLoss;

    const rsi =
      100 - 100 / (1 + relativeStrength);

    return rsi;
  }

  analyze(values: number[], period = 14): RSIResult {
    return {
      period,
      value: this.calculate(values, period),
    };
  }
}