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

export interface CandleRequest {
  symbol: string;
  timeframe: string;
  limit: number;
}

export interface MarketDataRequest extends CandleRequest {
  exchange: string;
}