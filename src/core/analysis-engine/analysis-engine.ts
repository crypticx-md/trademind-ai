import { Candle } from "../../shared/types/market.types";

import {
  StatisticsResult,
  StatisticsService,
} from "./statistics/statistics.service";

import {
  EMAResult,
  EMAService,
} from "./indicators/ema.service";

import {
  RSIResult,
  RSIService,
} from "./indicators/rsi.service";

import {
  ATRResult,
  ATRService,
} from "./indicators/atr.service";

import {
  VolumeAnalysisResult,
  VolumeService,
} from "./volume/volume.service";

export interface AnalysisResult {
  statistics: StatisticsResult;
  indicators: {
    ema: EMAResult[];
    rsi: RSIResult;
    atr: ATRResult;
     volume: VolumeAnalysisResult;
  };
}

export class AnalysisEngine {
  private readonly statisticsService = new StatisticsService();
  private readonly emaService = new EMAService();
  private readonly rsiService = new RSIService();
  private readonly atrService = new ATRService();
  private readonly volumeService = new VolumeService();

  analyzeCandles(candles: Candle[]): AnalysisResult {
    const closePrices = candles.map((candle) => candle.close);

    const statistics =
      this.statisticsService.analyze(closePrices);

    const ema = this.emaService.analyze(
      closePrices,
      [9, 20, 50, 100, 200]
    );

    const rsi = this.rsiService.analyze(closePrices, 14);

    const atr = this.atrService.analyze(candles, 14);

    const volume = this.volumeService.analyze(candles, 20);

    return {
      statistics,

      indicators: {
        ema,
        rsi,  
        atr, 
        volume,
      },
    };
  }
}