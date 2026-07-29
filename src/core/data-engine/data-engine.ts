import {
  Candle,
  MarketDataRequest,
} from "../../shared/types/market.types";
import { ExchangeFactory } from "./factories/exchange.factory";

export class DataEngine {
  async getCandles(request: MarketDataRequest): Promise<Candle[]> {
    const exchangeAdapter = ExchangeFactory.create(request.exchange);

    return exchangeAdapter.getCandles({
      symbol: request.symbol,
      timeframe: request.timeframe,
      limit: request.limit,
    });
  }
}