export interface StatisticsResult {
  mean: number;
  variance: number;
  standardDeviation: number;
  latestValue: number;
  zScore: number;
}

export class StatisticsService {
  calculateMean(values: number[]): number {
    this.validateValues(values);

    const total = values.reduce((sum, value) => sum + value, 0);

    return total / values.length;
  }

  calculateVariance(values: number[]): number {
    this.validateValues(values);

    const mean = this.calculateMean(values);

    const squaredDifferences = values.map((value) =>
      Math.pow(value - mean, 2)
    );

    return (
      squaredDifferences.reduce((sum, value) => sum + value, 0) /
      values.length
    );
  }

  calculateStandardDeviation(values: number[]): number {
    const variance = this.calculateVariance(values);

    return Math.sqrt(variance);
  }

  calculateZScore(value: number, values: number[]): number {
    this.validateValues(values);

    const mean = this.calculateMean(values);
    const standardDeviation = this.calculateStandardDeviation(values);

    if (standardDeviation === 0) {
      return 0;
    }

    return (value - mean) / standardDeviation;
  }

  analyze(values: number[]): StatisticsResult {
    this.validateValues(values);

    const mean = this.calculateMean(values);
    const variance = this.calculateVariance(values);
    const standardDeviation = Math.sqrt(variance);
    const latestValue = values[values.length - 1];

    if (latestValue === undefined) {
      throw new Error("Unable to find the latest value.");
    }

    const zScore =
      standardDeviation === 0
        ? 0
        : (latestValue - mean) / standardDeviation;

    return {
      mean,
      variance,
      standardDeviation,
      latestValue,
      zScore,
    };
  }

  private validateValues(values: number[]): void {
    if (values.length === 0) {
      throw new Error("Statistics cannot be calculated from an empty array.");
    }

    const containsInvalidValue = values.some(
      (value) => !Number.isFinite(value)
    );

    if (containsInvalidValue) {
      throw new Error("Statistics input contains an invalid number.");
    }
  }
}