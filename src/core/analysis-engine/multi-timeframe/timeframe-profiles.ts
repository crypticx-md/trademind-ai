import {
  Timeframe,
  TradingStyle,
} from "../../../shared/types/market.types";

export interface TimeframeProfile {
  higherTimeframe: Timeframe;
  trendTimeframe: Timeframe;
  setupTimeframe: Timeframe;
}

export const TIMEFRAME_PROFILES: Record<
  TradingStyle,
  TimeframeProfile
> = {
  SCALP: {
    higherTimeframe: "60m",
    trendTimeframe: "30m",
    setupTimeframe: "15m",
  },

  DAY_TRADE: {
    higherTimeframe: "1d",
    trendTimeframe: "4h",
    setupTimeframe: "60m",
  },

  SWING: {
    higherTimeframe: "1w",
    trendTimeframe: "1d",
    setupTimeframe: "4h",
  },
};