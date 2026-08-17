export interface EMAResult {
  period: number;
  value: number;
}

export class EMAService {
  calculate(values: number[], period: number): number {
    if (values.length === 0) {
      throw new Error("EMA cannot be calculated from an empty array.");
    }

    if (period <= 0) {
      throw new Error("EMA period must be greater than 0.");
    }

    if (values.length < period) {
      throw new Error(
        `EMA period ${period} requires at least ${period} values.`
      );
    }

    const multiplier = 2 / (period + 1);

    const initialValues = values.slice(0, period);

    const sma =
      initialValues.reduce((sum, value) => sum + value, 0) / period;

    let ema = sma;

    for (let i = period; i < values.length; i++) {
      ema = (values[i] - ema) * multiplier + ema;
    }

    return ema;
  }

  analyze(values: number[], periods: number[]): EMAResult[] {
    return periods.map((period) => ({
      period,
      value: this.calculate(values, period),
    }));
  }
}