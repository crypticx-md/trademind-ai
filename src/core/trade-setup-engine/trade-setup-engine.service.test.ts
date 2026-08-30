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
};

const result = service.generate(input);

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
};

const result = service.generate(input);

expect(result.entry).toBe(80000);
expect(result.stopLoss).toBe(80900);
expect(result.targets).toEqual([
  79100,
  78200,
  77300,
]);
expect(result.riskRewardRatio).toBe(3);

});

it("should reject an invalid ATR value", () => {

    const service = new TradeSetupEngineService();

const input = {
  direction: "LONG" as const,
  currentPrice: 80000,
  atr: 0,
};

expect(() => service.generate(input)).toThrow(
  "ATR must be greater than zero"
);

});

});