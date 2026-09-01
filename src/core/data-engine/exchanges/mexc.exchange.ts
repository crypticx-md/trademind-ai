import axios from "axios";
import { ExchangeAdapter } from "../interfaces/exchange.interface";
import {
  Candle,
  CandleRequest,
  MarketType,
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

type MexcFuturesContractResponse = {
  success: boolean;
  code: number;
  data: {
    symbol: string;
    baseCoin: string;
    quoteCoin: string;
    settleCoin: string;
    apiAllowed: boolean;
  }[];
};

type MexcFuturesKlineResponse = {
  success: boolean;
  code: number;
  data: {
    time: number[];
    open: number[];
    close: number[];
    high: number[];
    low: number[];
    vol: number[];
    amount: number[];
  };
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

private getFuturesInterval(timeframe: string): string {
  const intervals: Record<string, string> = {
    "15m": "Min15",
    "30m": "Min30",
    "60m": "Min60",
    "4h": "Hour4",
    "1d": "Day1",
    "1w": "Week1",
  };

  const interval = intervals[timeframe];

  if (!interval) {
    throw new Error(
      `Unsupported MEXC futures timeframe: ${timeframe}`
    );
  }

  return interval;
}

async getCandles(
  request: CandleRequest
): Promise<Candle[]> {
  
  if (request.marketType === "SPOT") {
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
      throw new Error(
        "Unexpected response format received from MEXC Spot"
      );
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

  const futuresSymbol =
    request.symbol.includes("_")
      ? request.symbol
      : request.symbol.replace("USDT", "_USDT");

  const interval =
    this.getFuturesInterval(request.timeframe);

  const response =
    await axios.get<MexcFuturesKlineResponse>(
      `https://api.mexc.com/api/v1/contract/kline/${futuresSymbol}`,
      {
        params: {
          interval,
        },
        timeout: 10000,
      }
    );

  if (!response.data.success) {
    throw new Error(
      `Failed to retrieve MEXC Futures candles for ${request.symbol}`
    );
  }

  const data = response.data.data;

  return data.time
    .slice(-request.limit)
    .map((time, index, times) => {
      const sourceIndex =
        data.time.length - times.length + index;

      return {
        openTime: time * 1000,
        open: Number(data.open[sourceIndex]),
        high: Number(data.high[sourceIndex]),
        low: Number(data.low[sourceIndex]),
        close: Number(data.close[sourceIndex]),
        volume: Number(data.vol[sourceIndex]),
        closeTime: time * 1000,
        quoteVolume: Number(
          data.amount[sourceIndex]
        ),
      };
    });
}


 async getSymbols(
  marketType: MarketType
): Promise<string[]> {
  if (marketType === "SPOT") {
    const response = await axios.get<MexcExchangeInfoResponse>(
      "https://api.mexc.com/api/v3/exchangeInfo",
      {
        timeout: 10000,
      }
    );

    return response.data.symbols.map(
      (item) => item.symbol
    );
  }

  const response =
    await axios.get<MexcFuturesContractResponse>(
      "https://api.mexc.com/api/v1/contract/detail",
      {
        timeout: 10000,
      }
    );

  if (!response.data.success) {
    throw new Error(
      "Failed to retrieve MEXC futures contracts"
    );
  }

  return response.data.data
    .filter(
      (contract) =>
        contract.quoteCoin === "USDT"
    )
    .map((contract) =>
      contract.symbol.replace("_", "")
    );
}

}