import { describe, expect, it } from "vitest";
import { MultiTimeframeService } from "./multi-timeframe.service";

describe("MultiTimeframeService", () => {
  it("should create the service", () => {
    const service = new MultiTimeframeService();

    expect(service).toBeDefined();
  });
});

it("should analyze multiple timeframes for a SCALP setup", async () => {
  const service = new MultiTimeframeService();

  const result = await service.analyze(
    "mexc",
    "BTCUSDT",
    "SCALP"
  );

  expect(result.style).toBe("SCALP");
  expect(result.decision).toBeDefined();

expect([
  "LONG",
  "SHORT",
  "WAIT",
]).toContain(result.decision.signal);

expect(result.timeframes.higher.timeframe).toBe("60m");
expect(result.timeframes.trend.timeframe).toBe("30m");
expect(result.timeframes.setup.timeframe).toBe("15m");

expect(result.timeframes.higher.analysis).toBeDefined();
expect(result.timeframes.trend.analysis).toBeDefined();
expect(result.timeframes.setup.analysis).toBeDefined();
});

it("should analyze multiple timeframes for a DAY_TRADE setup", async () => {
  const service = new MultiTimeframeService();

  const result = await service.analyze(
    "mexc",
    "BTCUSDT",
    "DAY_TRADE"
  );

  expect(result.style).toBe("DAY_TRADE");

  expect(result.timeframes.higher.timeframe).toBe("1d");
  expect(result.timeframes.trend.timeframe).toBe("4h");
  expect(result.timeframes.setup.timeframe).toBe("60m");

  expect(result.timeframes.higher.analysis).toBeDefined();
  expect(result.timeframes.trend.analysis).toBeDefined();
  expect(result.timeframes.setup.analysis).toBeDefined();

  expect(result.decision).toBeDefined();

  expect([
    "LONG",
    "SHORT",
    "WAIT",
  ]).toContain(result.decision.signal);
});

it("should use the correct DAY_TRADE timeframe profile", () => {
  const service = new MultiTimeframeService();

  const profile = service.getProfile("DAY_TRADE");

  expect(profile.higherTimeframe).toBe("1d");
  expect(profile.trendTimeframe).toBe("4h");
  expect(profile.setupTimeframe).toBe("60m");
});

it("should use the correct SWING timeframe profile", () => {
  const service = new MultiTimeframeService();

  const profile = service.getProfile("SWING");

  expect(profile.higherTimeframe).toBe("1w");
  expect(profile.trendTimeframe).toBe("1d");
  expect(profile.setupTimeframe).toBe("4h");
});

it("should analyze multiple timeframes for a SWING setup", async () => {
  const service = new MultiTimeframeService();

  const result = await service.analyze(
    "mexc",
    "BTCUSDT",
    "SWING"
  );

  expect(result.style).toBe("SWING");

  expect(result.timeframes.higher.timeframe).toBe("1w");
  expect(result.timeframes.trend.timeframe).toBe("1d");
  expect(result.timeframes.setup.timeframe).toBe("4h");

  expect(result.timeframes.higher.analysis).toBeDefined();
  expect(result.timeframes.trend.analysis).toBeDefined();
  expect(result.timeframes.setup.analysis).toBeDefined();

  expect(result.decision).toBeDefined();

  expect([
    "LONG",
    "SHORT",
    "WAIT",
  ]).toContain(result.decision.signal);
});