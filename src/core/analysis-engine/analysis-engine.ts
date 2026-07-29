import { Candle } from "../../shared/types/market.types";
import {
  StatisticsResult,
  StatisticsService,
} from "./statistics/statistics.service";

export interface AnalysisResult {
  statistics: StatisticsResult;
}

export class AnalysisEngine {
  private readonly statisticsService = new StatisticsService();

  analyzeCandles(candles: Candle[]): AnalysisResult {
    const closePrices = candles.map((candle) => candle.close);

    const statistics =
      this.statisticsService.analyze(closePrices);

    return {
      statistics,
    };
  }
}