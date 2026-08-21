import { Candle } from "../../../shared/types/market.types";

export type MarketStructureDirection =
  | "BULLISH"
  | "BEARISH"
  | "RANGING"
  | "UNDEFINED";

export interface MarketStructureResult {
  direction: MarketStructureDirection;
  higherHighs: number;
  higherLows: number;
  lowerHighs: number;
  lowerLows: number;
}

export class MarketStructureService {
  analyze(candles: Candle[]): MarketStructureResult {
    if (candles.length < 2) {
      return {
        direction: "UNDEFINED",
        higherHighs: 0,
        higherLows: 0,
        lowerHighs: 0,
        lowerLows: 0,
      };
    }

    let higherHighs = 0;
    let higherLows = 0;
    let lowerHighs = 0;
    let lowerLows = 0;

    for (let i = 1; i < candles.length; i++) {
      const current = candles[i];
      const previous = candles[i - 1];

      if (current.high > previous.high) {
        higherHighs++;
      } else if (current.high < previous.high) {
        lowerHighs++;
      }

      if (current.low > previous.low) {
        higherLows++;
      } else if (current.low < previous.low) {
        lowerLows++;
      }
    }

    let direction: MarketStructureDirection = "RANGING";

    const bullishScore = higherHighs + higherLows;
    const bearishScore = lowerHighs + lowerLows;

    if (bullishScore > bearishScore * 1.2) {
      direction = "BULLISH";
    } else if (bearishScore > bullishScore * 1.2) {
      direction = "BEARISH";
    }

    return {
      direction,
      higherHighs,
      higherLows,
      lowerHighs,
      lowerLows,
    };
  }
}