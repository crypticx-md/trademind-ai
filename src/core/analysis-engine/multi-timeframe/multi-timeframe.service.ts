import { AnalysisEngine } from "../analysis-engine";

import { DataEngine } from "../../data-engine/data-engine";

import {
  CandleRequest,
  TradingStyle,
} from "../../../shared/types/market.types";


import {
  TIMEFRAME_PROFILES,
  TimeframeProfile,
} from "./timeframe-profiles";

import { MultiTimeframeDecisionService } from "./multi-timeframe-decision.service";

import {
  TradeSetupEngineService,
} from "../../trade-setup-engine/trade-setup-engine.service";




export class MultiTimeframeService {
 private dataEngine = new DataEngine();
 private analysisEngine = new AnalysisEngine();
 private multiTimeframeDecisionService = new MultiTimeframeDecisionService();
 private tradeSetupEngineService =
  new TradeSetupEngineService();

    getProfile(style: TradingStyle): TimeframeProfile {
    return TIMEFRAME_PROFILES[style];
  }
buildRequests(
  symbol: string,
  style: TradingStyle,
  limit = 250
): CandleRequest[] {
  const profile = this.getProfile(style);

  return [
    {
      symbol,
      timeframe: profile.higherTimeframe,
      limit,
      marketType: "FUTURES",
    },
    {
      symbol,
      timeframe: profile.trendTimeframe,
      limit,
      marketType: "FUTURES",
    },
    {
      symbol,
      timeframe: profile.setupTimeframe,
      limit,
      marketType: "FUTURES",
    },
  ];
}

async fetchCandles(
  exchange: string,
  symbol: string,
  style: TradingStyle
) {
  const requests = this.buildRequests(symbol, style);

 const [
  higherTimeframeCandles,
  trendTimeframeCandles,
  setupTimeframeCandles,
] = await Promise.all(
  requests.map((request) =>
    this.dataEngine.getCandles({
      exchange,
      ...request,
    })
  )
);

return {
  higherTimeframeCandles,
  trendTimeframeCandles,
  setupTimeframeCandles,
};
}

async analyze(
  exchange: string,
  symbol: string,
  style: TradingStyle
) {
    const profile = this.getProfile(style);
    
  const {
    higherTimeframeCandles,
    trendTimeframeCandles,
    setupTimeframeCandles,
  } = await this.fetchCandles(exchange, symbol, style);

  const higherTimeframeAnalysis =
    this.analysisEngine.analyzeCandles(higherTimeframeCandles);

  const trendTimeframeAnalysis =
    this.analysisEngine.analyzeCandles(trendTimeframeCandles);

  const setupTimeframeAnalysis =
    this.analysisEngine.analyzeCandles(setupTimeframeCandles);

 const multiTimeframeDecision =
  this.multiTimeframeDecisionService.combineSignals(
    higherTimeframeAnalysis.decision.signal,
    trendTimeframeAnalysis.decision.signal,
    setupTimeframeAnalysis.decision.signal,
    higherTimeframeAnalysis.decision.confidence,
    trendTimeframeAnalysis.decision.confidence,
    setupTimeframeAnalysis.decision.confidence
  );

let finalDecision = multiTimeframeDecision;

if (
  multiTimeframeDecision.signal === "LONG" &&
  (
    setupTimeframeAnalysis.entryQuality.isExtendedForLong ||
    setupTimeframeAnalysis.entryQuality.isLateLongAfterImpulse
  )
) {
  finalDecision = {
    ...multiTimeframeDecision,
    signal: "WAIT",
    reason:
      setupTimeframeAnalysis.entryQuality.isExtendedForLong
        ? "Bullish alignment detected, but the setup timeframe is already too extended above EMA20."
        : "Bullish alignment detected, but a large bullish impulse has already occurred. Wait for a pullback or better re-entry.",
  };
}

if (
  multiTimeframeDecision.signal === "SHORT" &&
  (
    setupTimeframeAnalysis.entryQuality.isExtendedForShort ||
    setupTimeframeAnalysis.entryQuality.isLateShortAfterImpulse
  )
) {
  finalDecision = {
    ...multiTimeframeDecision,
    signal: "WAIT",
    reason:
      setupTimeframeAnalysis.entryQuality.isExtendedForShort
        ? "Bearish alignment detected, but the setup timeframe is already too extended below EMA20."
        : "Bearish alignment detected, but a large bearish impulse has already occurred. Wait for a bounce or better re-entry.",
  };
}

let tradeSetup = null;

if (
  finalDecision.signal === "LONG" ||
  finalDecision.signal === "SHORT"
) {
  const setupAnalysis =
    setupTimeframeAnalysis;

  const setupCandles =
    setupTimeframeCandles;

  const currentPrice =
    setupCandles[setupCandles.length - 1].close;

  tradeSetup =
    this.tradeSetupEngineService.generate({
      direction: finalDecision.signal,
      currentPrice,
      atr: setupAnalysis.indicators.atr.value,
      nearestSupport:
        setupAnalysis.supportResistance
          .nearestSupport?.price ?? null,
      nearestResistance:
        setupAnalysis.supportResistance
          .nearestResistance?.price ?? null,
    });
}



  return {
  style,
  decision: finalDecision,
  tradeSetup,

  timeframes: {
    higher: {
      timeframe: profile.higherTimeframe,
      analysis: higherTimeframeAnalysis,
    },
    trend: {
      timeframe: profile.trendTimeframe,
      analysis: trendTimeframeAnalysis,
    },
    setup: {
      timeframe: profile.setupTimeframe,
      analysis: setupTimeframeAnalysis,
    },
  },
};

}

}