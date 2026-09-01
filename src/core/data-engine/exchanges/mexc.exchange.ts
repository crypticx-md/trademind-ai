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

type MexcExchangeInfoResponse = {
  symbols: {
    symbol: string;
  }[];
};

export class MexcExchangeAdapter implements ExchangeAdapter {
  readonly name = "mexc";

  private mapTimeframe(timeframe: string): string {
  const timeframeMap: Record<string, string> = {
    "15m": "15m",
    "30m": "30m",
    "60m": "60m",
    "4h": "4h",
    "1d": "1d",
    "1w": "1W",
  };

  const mappedTimeframe = timeframeMap[timeframe];

  if (!mappedTimeframe) {
    throw new Error(`Unsupported MEXC timeframe: ${timeframe}`);
  }

  return mappedTimeframe;
}

  async getCandles(request: CandleRequest): Promise<Candle[]> {
    const response = await axios.get<MexcKline[]>(
      "https://api.mexc.com/api/v3/klines",
      {
        params: {
          symbol: request.symbol,
          interval: this.mapTimeframe(request.timeframe),
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

  async getSymbols(): Promise<string[]> {
const response = await axios.get<MexcExchangeInfoResponse>(
  "https://api.mexc.com/api/v3/exchangeInfo",
  {
    timeout: 10000,
  }
);

return response.data.symbols.map((item) => item.symbol);
}

}