import {
  Candle,
  CandleRequest,
  MarketType,
} from "../../../shared/types/market.types";

export interface ExchangeAdapter {
  readonly name: string;

  getCandles(request: CandleRequest): Promise<Candle[]>;

  getSymbols(
  marketType: MarketType
): Promise<string[]>;

}