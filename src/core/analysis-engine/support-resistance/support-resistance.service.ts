import { Candle } from "../../../shared/types/market.types";

export type LevelType =
  | "SUPPORT"
  | "RESISTANCE";

  export type LevelStrength =
  | "WEAK"
  | "MODERATE"
  | "STRONG";

export interface PriceLevel {
  type: LevelType;
  price: number;
  touches: number;
  distanceFromCurrentPrice: number;
  strength: LevelStrength;
  candlesSinceLastTouch: number;
  qualityScore: number;
}

export interface SupportResistanceResult {
  nearestSupport: PriceLevel | null;
  nearestResistance: PriceLevel | null;
  bestSupport: PriceLevel | null;
bestResistance: PriceLevel | null;
  levels: PriceLevel[];
}

export class SupportResistanceService {
  analyze(candles: Candle[]): SupportResistanceResult {
    const levels: PriceLevel[] = [];

    if (candles.length < 5) {
      return {
        nearestSupport: null,
        nearestResistance: null,
        bestSupport: null,
        bestResistance: null,
        levels: [],
      };
    }

    const currentPrice = candles[candles.length - 1].close;
    const clusteringThreshold = currentPrice * 0.003;

    const clusteredLevels: PriceLevel[] = [];

    for (let i = 2; i < candles.length - 2; i++) {
      const candle = candles[i];

      const isSwingHigh =
        candle.high > candles[i - 1].high &&
        candle.high > candles[i - 2].high &&
        candle.high > candles[i + 1].high &&
        candle.high > candles[i + 2].high;

      const isSwingLow =
        candle.low < candles[i - 1].low &&
        candle.low < candles[i - 2].low &&
        candle.low < candles[i + 1].low &&
        candle.low < candles[i + 2].low;

      if (isSwingHigh) {
        const existingResistance = clusteredLevels.find(
  (level) =>
    level.type === "RESISTANCE" &&
    Math.abs(level.price - candle.high) <= clusteringThreshold
);


if (existingResistance) {
  const totalTouches = existingResistance.touches + 1;
  existingResistance.candlesSinceLastTouch =
  candles.length - 1 - i;

  existingResistance.price =
    (existingResistance.price * existingResistance.touches +
      candle.high) /
    totalTouches;

  existingResistance.touches = totalTouches;

  existingResistance.strength =
  totalTouches >= 5
    ? "STRONG"
    : totalTouches >= 3
    ? "MODERATE"
    : "WEAK";

  existingResistance.distanceFromCurrentPrice =
    Math.abs(existingResistance.price - currentPrice);
} else {
  clusteredLevels.push({
    type: "RESISTANCE",
    price: candle.high,
    touches: 1,
    distanceFromCurrentPrice: Math.abs(
      candle.high - currentPrice
    ),
    strength: "WEAK",
    candlesSinceLastTouch: candles.length - 1 - i,
    qualityScore: 0,
  });
}
      }

      if (isSwingLow) {
       const existingSupport = clusteredLevels.find(
  (level) =>
    level.type === "SUPPORT" &&
    Math.abs(level.price - candle.low) <= clusteringThreshold
);

if (existingSupport) {
  const totalTouches = existingSupport.touches + 1;
  existingSupport.candlesSinceLastTouch =
  candles.length - 1 - i;

  existingSupport.price =
    (existingSupport.price * existingSupport.touches +
      candle.low) /
    totalTouches;

  existingSupport.touches = totalTouches;

  existingSupport.strength =
  totalTouches >= 5
    ? "STRONG"
    : totalTouches >= 3
    ? "MODERATE"
    : "WEAK";

  existingSupport.distanceFromCurrentPrice =
    Math.abs(existingSupport.price - currentPrice);
} else {
  clusteredLevels.push({
    type: "SUPPORT",
    price: candle.low,
    touches: 1,
    distanceFromCurrentPrice: Math.abs(
      candle.low - currentPrice
    ),
    strength: "WEAK",
    candlesSinceLastTouch: candles.length - 1 - i,
    qualityScore: 0,
  });
}      }
    }

    for (const level of clusteredLevels) {
  const touchScore = Math.min(level.touches * 10, 50);

  const recencyScore = Math.max(
    0,
    30 - level.candlesSinceLastTouch
  );

  const distancePercent =
    level.distanceFromCurrentPrice / currentPrice;

  const distanceScore = Math.max(
    0,
    20 - distancePercent * 1000
  );

  level.qualityScore = Math.round(
    touchScore +
    recencyScore +
    distanceScore
  );
}

 const supports = clusteredLevels
  .filter(
    (level) =>
      level.type === "SUPPORT" &&
      level.price < currentPrice
  )
  .sort(
    (a, b) =>
      a.distanceFromCurrentPrice -
      b.distanceFromCurrentPrice
  );

const resistances = clusteredLevels
  .filter(
    (level) =>
      level.type === "RESISTANCE" &&
      level.price > currentPrice
  )
  .sort(
    (a, b) =>
      a.distanceFromCurrentPrice -
      b.distanceFromCurrentPrice
  );

const nearestSupport =
  supports.length > 0 ? supports[0] : null;

const nearestResistance =
  resistances.length > 0 ? resistances[0] : null;

  const bestSupport =
  supports.length > 0
    ? [...supports].sort(
        (a, b) => b.qualityScore - a.qualityScore
      )[0]
    : null;

const bestResistance =
  resistances.length > 0
    ? [...resistances].sort(
        (a, b) => b.qualityScore - a.qualityScore
      )[0]
    : null;

return {
  nearestSupport,
  nearestResistance,
   bestSupport,
  bestResistance,
  levels: clusteredLevels,
};
  }
}