export interface Candle {
  openTime: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  closeTime: number;
  quoteVolume: number;
}

export type Timeframe =
  | "15m"
  | "30m"
  | "60m"
  | "4h"
  | "1d"
  | "1w";

export type TradingStyle =
  | "SCALP"
  | "DAY_TRADE"
  | "SWING";


export interface CandleRequest {
  symbol: string;
  timeframe: Timeframe;
  limit: number;
}

export interface MarketDataRequest extends CandleRequest {
  exchange: string;
}