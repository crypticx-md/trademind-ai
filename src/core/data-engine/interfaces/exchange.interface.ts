import {
  Candle,
  CandleRequest,
} from "../../../shared/types/market.types";

export interface ExchangeAdapter {
  readonly name: string;

  getCandles(request: CandleRequest): Promise<Candle[]>;

  getSymbols(): Promise<string[]>;
}