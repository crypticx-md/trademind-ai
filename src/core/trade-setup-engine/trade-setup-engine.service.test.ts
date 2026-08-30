import { describe, it, expect } from "vitest";
import { TradeSetupEngineService } from "./trade-setup-engine.service";

describe("TradeSetupEngineService", () => {
  it("should create the service", () => {
    const service = new TradeSetupEngineService();

    expect(service).toBeDefined();
  });

  it("should generate a LONG trade setup using ATR risk", () => {

const service = new TradeSetupEngineService();

const input = {
  direction: "LONG" as const,
  currentPrice: 80000,
  atr: 600,
   nearestSupport: null,
  nearestResistance: null,
};

const result = service.generate(input);

expect(result).not.toBeNull();

if (!result) {
  throw new Error("Expected a valid LONG trade setup");
}
expect(result.entry).toBe(80000);
expect(result.stopLoss).toBe(79100);
expect(result.targets).toEqual([
  80900,
  81800,
  82700,
]);
expect(result.riskRewardRatio).toBe(3);

});

it("should generate a SHORT trade setup using ATR risk", () => {

    const service = new TradeSetupEngineService();

const input = {
  direction: "SHORT" as const,
  currentPrice: 80000,
  atr: 600,
  nearestSupport: null,
  nearestResistance: null,
};

const result = service.generate(input);

expect(result).not.toBeNull();

if (!result) {
  throw new Error("Expected a valid SHORT trade setup");
}
expect(result.entry).toBe(80000);
expect(result.stopLoss).toBe(80900);
expect(result.targets).toEqual([
  79100,
  78200,
  77300,
]);
expect(result.riskRewardRatio).toBe(3);

});

it("should return null for a SHORT setup when support is too close", () => {

    const service = new TradeSetupEngineService();

const input = {
  direction: "SHORT" as const,
  currentPrice: 80000,
  atr: 600,
  nearestSupport: 79500,
  nearestResistance: null,
};

const result = service.generate(input);

expect(result).toBeNull();

});

it("should return null when risk reward is below the minimum", () => {

    const service = new TradeSetupEngineService();

const input = {
  direction: "LONG" as const,
  currentPrice: 80000,
  atr: 600,
  nearestSupport: null,
  nearestResistance: 80700,
};

const result = service.generate(input);

expect(result).toBeNull();

});

it("should reject an invalid ATR value", () => {

    const service = new TradeSetupEngineService();

const input = {
  direction: "LONG" as const,
  currentPrice: 80000,
  atr: 0,
  nearestSupport: null,
  nearestResistance: null,
};

expect(() => service.generate(input)).toThrow(
  "ATR must be greater than zero"
);

});

it("should use nearest resistance to calculate realistic LONG risk reward", () => {
  const service = new TradeSetupEngineService();

  const input = {
    direction: "LONG" as const,
    currentPrice: 80000,
    atr: 600,
    nearestSupport: null,
    nearestResistance: 82000,
  };

  const result = service.generate(input);

  expect(result).not.toBeNull();

  if (!result) {
    throw new Error("Expected a valid LONG trade setup");
  }

  expect(result.riskRewardRatio).toBeCloseTo(2.22, 2);
});

it("should use nearest support to calculate realistic SHORT risk reward", () => {
  const service = new TradeSetupEngineService();

  const input = {
    direction: "SHORT" as const,
    currentPrice: 80000,
    atr: 600,
    nearestSupport: 78000,
    nearestResistance: null,
  };

  const result = service.generate(input);

  expect(result).not.toBeNull();

  if (!result) {
    throw new Error("Expected a valid SHORT trade setup");
  }

  expect(result.riskRewardRatio).toBeCloseTo(2.22, 2);
});

});