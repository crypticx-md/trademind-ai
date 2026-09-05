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

import {
  TrendAnalysisResult,
  TrendService,
} from "./trend/trend.service";

import {
  MarketStructureResult,
  MarketStructureService,
} from "./market-structure/market-structure.service";

import {
  SupportResistanceResult,
  SupportResistanceService,
} from "./support-resistance/support-resistance.service";

import {
  DecisionEngineService,
  DecisionResult,
} from "./decision-engine/decision-engine.service";

import {
  TradeSetupEngineService,
  TradeSetupResult,
} from "../trade-setup-engine/trade-setup-engine.service";

import {
  EntryQualityResult,
  EntryQualityService,
} from "./entry-quality/entry-quality.service";


export interface AnalysisResult {
  statistics: StatisticsResult;
  indicators: {
    ema: EMAResult[];
    rsi: RSIResult;
    atr: ATRResult;
     volume: VolumeAnalysisResult;
  };

  trend: TrendAnalysisResult;
   marketStructure: MarketStructureResult;
   supportResistance: SupportResistanceResult;
   decision: DecisionResult;
   tradeSetup: TradeSetupResult | null;
   entryQuality: EntryQualityResult;
}

export class AnalysisEngine {
  private readonly statisticsService = new StatisticsService();
  private readonly emaService = new EMAService();
  private readonly rsiService = new RSIService();
  private readonly atrService = new ATRService();
  private readonly volumeService = new VolumeService();
  private readonly trendService = new TrendService();
  private readonly marketStructureService = new MarketStructureService();
  private readonly supportResistanceService = new SupportResistanceService();
 private readonly decisionEngineService = new DecisionEngineService();
 private tradeSetupEngineService = new TradeSetupEngineService();
 private readonly entryQualityService =
  new EntryQualityService();

  analyzeCandles(candles: Candle[]): AnalysisResult {
    const closePrices = candles.map((candle) => candle.close);

    const statistics =
      this.statisticsService.analyze(closePrices);

    const ema = this.emaService.analyze(
      closePrices,
      [9, 20, 50, 100, 200]
    );

   const rsi = this.rsiService.analyze(closePrices, 14);
 
    const currentPrice =
  closePrices[closePrices.length - 1];

if (currentPrice === undefined) {
  throw new Error(
    "Unable to determine current price for trend analysis."
  );
}

   const volume = this.volumeService.analyze(candles, 20);
    const atr = this.atrService.analyze(candles, 14);

   const trend =
  this.trendService.analyzeEMA(ema, 
                               currentPrice,
                               rsi,
                               volume,
                               atr,
                               

  );

  const marketStructure =
  this.marketStructureService.analyze(candles);

  const supportResistance =
  this.supportResistanceService.analyze(candles);

  const decision =
  this.decisionEngineService.analyze(
    trend,
    marketStructure,
    supportResistance,
     rsi.value,
    volume.status
  );

let tradeSetup = null;

if (decision.signal === "LONG" || decision.signal === "SHORT") {

tradeSetup = this.tradeSetupEngineService.generate({
  direction: decision.signal,
  currentPrice: candles[candles.length - 1].close,
  atr: atr.value,
   nearestSupport: supportResistance.nearestSupport?.price ?? null,
  nearestResistance: supportResistance.nearestResistance?.price ?? null,
});

}

const ema20 = ema.find(
  (item) => item.period === 20
);

if (!ema20) {
  throw new Error("EMA20 was not calculated.");
}

const entryQuality =
  this.entryQualityService.analyze(
    currentPrice,
    ema20.value,
    atr.value,
    candles,
  );

   


    return {
      statistics,

      indicators: {
        ema,
        rsi,  
        atr, 
        volume,
    
      },

        trend,
         marketStructure,
         supportResistance,
         decision,
         tradeSetup,
         entryQuality,
         

    };
  }
}