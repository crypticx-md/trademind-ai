import axios from "axios";
import { ExchangeAdapter } from "../interfaces/exchange.interface";
import {
  Candle,
  CandleRequest,
} from "../../../shared/types/market.types";

type MexcKline = [
  number,
  string,
  string,
  string,
  string,
  string,
  number,
  string
];

export class MexcExchangeAdapter implements ExchangeAdapter {
  readonly name = "mexc";

  async getCandles(request: CandleRequest): Promise<Candle[]> {
    const response = await axios.get<MexcKline[]>(
      "https://api.mexc.com/api/v3/klines",
      {
        params: {
          symbol: request.symbol,
          interval: request.timeframe,
          limit: request.limit,
        },
        timeout: 10000,
      }
    );

    if (!Array.isArray(response.data)) {
      throw new Error("Unexpected response format received from MEXC");
    }

    return response.data.map((candle) => ({
      openTime: candle[0],
      open: Number(candle[1]),
      high: Number(candle[2]),
      low: Number(candle[3]),
      close: Number(candle[4]),
      volume: Number(candle[5]),
      closeTime: candle[6],
      quoteVolume: Number(candle[7]),
    }));
  }
}