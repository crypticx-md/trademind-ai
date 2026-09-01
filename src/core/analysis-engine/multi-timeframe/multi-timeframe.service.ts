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


export class MultiTimeframeService {
 private dataEngine = new DataEngine();
 private analysisEngine = new AnalysisEngine();
 private multiTimeframeDecisionService = new MultiTimeframeDecisionService();

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
    },
    {
      symbol,
      timeframe: profile.trendTimeframe,
      limit,
    },
    {
      symbol,
      timeframe: profile.setupTimeframe,
      limit,
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

  return {
  style,
  decision: multiTimeframeDecision,

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