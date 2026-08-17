import { Candle } from "../../shared/types/market.types";

import {
  StatisticsResult,
  StatisticsService,
} from "./statistics/statistics.service";

import {
  EMAResult,
  EMAService,
} from "./indicators/ema.service";

export interface AnalysisResult {
  statistics: StatisticsResult;
  indicators: {
    ema: EMAResult[];
  };
}

export class AnalysisEngine {
  private readonly statisticsService = new StatisticsService();
  private readonly emaService = new EMAService();

  analyzeCandles(candles: Candle[]): AnalysisResult {
    const closePrices = candles.map((candle) => candle.close);

    const statistics =
      this.statisticsService.analyze(closePrices);

    const ema = this.emaService.analyze(
      closePrices,
      [9, 20, 50, 100, 200]
    );

    return {
      statistics,

      indicators: {
        ema,
      },
    };
  }
}