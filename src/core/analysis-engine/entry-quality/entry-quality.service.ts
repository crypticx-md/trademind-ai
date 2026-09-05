import { Candle } from "../../../shared/types/market.types";

export interface EntryQualityResult {
  extensionInAtr: number;
  signedExtensionInAtr: number;
  isExtended: boolean;
  isExtendedForLong: boolean;
  isExtendedForShort: boolean;

  recentBullishImpulseInAtr: number;
  recentBearishImpulseInAtr: number;
  
  isLateLongAfterImpulse: boolean;
isLateShortAfterImpulse: boolean;
}

export class EntryQualityService {
  analyze(
    currentPrice: number,
    ema20: number,
    atr: number,
    candles: Candle[]
  ): EntryQualityResult {
    if (atr <= 0) {
      throw new Error("ATR must be greater than 0.");
    }

    const extensionInAtr =
      Math.abs(currentPrice - ema20) / atr;

    const signedExtensionInAtr =
      (currentPrice - ema20) / atr;

    const isExtended =
      Math.abs(signedExtensionInAtr) >= 2.5;

    const isExtendedForLong =
      signedExtensionInAtr >= 2.5;

    const isExtendedForShort =
      signedExtensionInAtr <= -2.5;

    const recentCandles = candles.slice(-12);

    const recentLowestLow = Math.min(
      ...recentCandles.map((candle) => candle.low)
    );

    const recentHighestHigh = Math.max(
      ...recentCandles.map((candle) => candle.high)
    );

    const recentBullishImpulseInAtr =
      (currentPrice - recentLowestLow) / atr;

    const recentBearishImpulseInAtr =
      (recentHighestHigh - currentPrice) / atr;

      const isLateLongAfterImpulse =
  recentBullishImpulseInAtr >= 4 &&
  signedExtensionInAtr >= 0.5;

const isLateShortAfterImpulse =
  recentBearishImpulseInAtr >= 4 &&
  signedExtensionInAtr <= -0.5;

    return {
      extensionInAtr,
      signedExtensionInAtr,
      isExtended,
      isExtendedForLong,
      isExtendedForShort,
      recentBullishImpulseInAtr,
      recentBearishImpulseInAtr,
      isLateLongAfterImpulse,
  isLateShortAfterImpulse,
    };
  }
}