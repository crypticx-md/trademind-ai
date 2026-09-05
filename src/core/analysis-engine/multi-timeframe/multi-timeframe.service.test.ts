import {
  describe,
  expect,
  it,
  vi,
} from "vitest";
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

describe("MultiTimeframeService entry protection", () => {
  it("should return WAIT when all timeframes are LONG but setup entry is late after a bullish impulse", async () => {
    const service = new MultiTimeframeService();

    vi.spyOn(service, "fetchCandles").mockResolvedValue({
      higherTimeframeCandles: [],
      trendTimeframeCandles: [],
      setupTimeframeCandles: [],
    });

    const createAnalysis = (
      isLateLongAfterImpulse: boolean
    ) => ({
      decision: {
        signal: "LONG",
        confidence: 80,
      },

      entryQuality: {
        extensionInAtr: 1,
        signedExtensionInAtr: 1,
        isExtended: false,
        isExtendedForLong: false,
        isExtendedForShort: false,
        recentBullishImpulseInAtr:
          isLateLongAfterImpulse ? 5 : 1,
        recentBearishImpulseInAtr: 0,
        isLateLongAfterImpulse,
        isLateShortAfterImpulse: false,
      },
    });

    const analyzeSpy = vi.spyOn(
      (service as any).analysisEngine,
      "analyzeCandles"
    );

    analyzeSpy
      .mockReturnValueOnce(createAnalysis(false))
      .mockReturnValueOnce(createAnalysis(false))
      .mockReturnValueOnce(createAnalysis(true));

    const result = await service.analyze(
      "mexc",
      "TESTUSDT",
      "SCALP"
    );

    expect(result.decision.signal).toBe("WAIT");

    expect(result.tradeSetup).toBeNull();

    expect(result.decision.reason).toBe(
      "Bullish alignment detected, but a large bullish impulse has already occurred. Wait for a pullback or better re-entry."
    );
  });
});

it("should return WAIT when all timeframes are SHORT but setup entry is late after a bearish impulse", async () => {
  const service = new MultiTimeframeService();

  vi.spyOn(service, "fetchCandles").mockResolvedValue({
    higherTimeframeCandles: [],
    trendTimeframeCandles: [],
    setupTimeframeCandles: [],
  });

  const createAnalysis = (
    isLateShortAfterImpulse: boolean
  ) => ({
    decision: {
      signal: "SHORT",
      confidence: 80,
    },

    entryQuality: {
      extensionInAtr: 1,
      signedExtensionInAtr: -1,
      isExtended: false,
      isExtendedForLong: false,
      isExtendedForShort: false,
      recentBullishImpulseInAtr: 0,
      recentBearishImpulseInAtr:
        isLateShortAfterImpulse ? 5 : 1,
      isLateLongAfterImpulse: false,
      isLateShortAfterImpulse,
    },
  });

  const analyzeSpy = vi.spyOn(
    (service as any).analysisEngine,
    "analyzeCandles"
  );

  analyzeSpy
    .mockReturnValueOnce(createAnalysis(false))
    .mockReturnValueOnce(createAnalysis(false))
    .mockReturnValueOnce(createAnalysis(true));

  const result = await service.analyze(
    "mexc",
    "TESTUSDT",
    "SCALP"
  );

  expect(result.decision.signal).toBe("WAIT");
  expect(result.tradeSetup).toBeNull();

  expect(result.decision.reason).toBe(
    "Bearish alignment detected, but a large bearish impulse has already occurred. Wait for a bounce or better re-entry."
  );
});

it("should keep LONG when all timeframes are LONG and setup entry quality is acceptable", async () => {
  const service = new MultiTimeframeService();

 vi.spyOn(service, "fetchCandles").mockResolvedValue({
  higherTimeframeCandles: [],
  trendTimeframeCandles: [],
  setupTimeframeCandles: [
    {
      openTime:1,
      open: 99,
      high: 101,
      low: 98,
      close: 100,
      volume: 1000,
      closeTime: 2,
quoteVolume: 100000,
    },
  ],
});

  const createAnalysis = () => ({
    decision: {
      signal: "LONG",
      confidence: 80,
    },

    entryQuality: {
      extensionInAtr: 1,
      signedExtensionInAtr: 1,
      isExtended: false,
      isExtendedForLong: false,
      isExtendedForShort: false,
      recentBullishImpulseInAtr: 2,
      recentBearishImpulseInAtr: 0,
      isLateLongAfterImpulse: false,
      isLateShortAfterImpulse: false,
    },

    indicators: {
      atr: {
        value: 10,
      },
    },

    supportResistance: {
      nearestSupport: 90,
      nearestResistance: 130,
    },
  });

  const analyzeSpy = vi.spyOn(
    (service as any).analysisEngine,
    "analyzeCandles"
  );

  analyzeSpy
    .mockReturnValueOnce(createAnalysis())
    .mockReturnValueOnce(createAnalysis())
    .mockReturnValueOnce(createAnalysis());

  vi.spyOn(
    (service as any).tradeSetupEngineService,
    "generate"
  ).mockReturnValue({
    direction: "LONG",
    entry: 100,
    stopLoss: 85,
    targets: [115, 130, 145],
    riskRewardRatio: 2,
  });

  const result = await service.analyze(
    "mexc",
    "TESTUSDT",
    "SCALP"
  );

  expect(result.decision.signal).toBe("LONG");
  expect(result.tradeSetup).not.toBeNull();
});

it("should keep SHORT when all timeframes are SHORT and setup entry quality is acceptable", async () => {
  const service = new MultiTimeframeService();

  vi.spyOn(service, "fetchCandles").mockResolvedValue({
    higherTimeframeCandles: [],
    trendTimeframeCandles: [],
    setupTimeframeCandles: [
      {
        openTime: 1,
        open: 101,
        high: 102,
        low: 99,
        close: 100,
        volume: 1000,
        closeTime: 2,
        quoteVolume: 100000,
      },
    ],
  });

  const createAnalysis = () => ({
    decision: {
      signal: "SHORT",
      confidence: 80,
    },

    entryQuality: {
      extensionInAtr: 1,
      signedExtensionInAtr: -1,
      isExtended: false,
      isExtendedForLong: false,
      isExtendedForShort: false,
      recentBullishImpulseInAtr: 0,
      recentBearishImpulseInAtr: 2,
      isLateLongAfterImpulse: false,
      isLateShortAfterImpulse: false,
    },

    indicators: {
      atr: {
        value: 10,
      },
    },

    supportResistance: {
      nearestSupport: 70,
      nearestResistance: 110,
    },
  });

  const analyzeSpy = vi.spyOn(
    (service as any).analysisEngine,
    "analyzeCandles"
  );

  analyzeSpy
    .mockReturnValueOnce(createAnalysis())
    .mockReturnValueOnce(createAnalysis())
    .mockReturnValueOnce(createAnalysis());

  vi.spyOn(
    (service as any).tradeSetupEngineService,
    "generate"
  ).mockReturnValue({
    direction: "SHORT",
    entry: 100,
    stopLoss: 115,
    targets: [85, 70, 55],
    riskRewardRatio: 2,
  });

  const result = await service.analyze(
    "mexc",
    "TESTUSDT",
    "SCALP"
  );

  expect(result.decision.signal).toBe("SHORT");
  expect(result.tradeSetup).not.toBeNull();
});

it("should return WAIT when all timeframes are LONG but setup is overextended above EMA20", async () => {
  const service = new MultiTimeframeService();

  vi.spyOn(service, "fetchCandles").mockResolvedValue({
    higherTimeframeCandles: [],
    trendTimeframeCandles: [],
    setupTimeframeCandles: [],
  });

  const createAnalysis = (
    isExtendedForLong: boolean
  ) => ({
    decision: {
      signal: "LONG",
      confidence: 80,
    },

    entryQuality: {
      extensionInAtr:
        isExtendedForLong ? 3 : 1,
      signedExtensionInAtr:
        isExtendedForLong ? 3 : 1,
      isExtended: isExtendedForLong,
      isExtendedForLong,
      isExtendedForShort: false,
      recentBullishImpulseInAtr: 2,
      recentBearishImpulseInAtr: 0,
      isLateLongAfterImpulse: false,
      isLateShortAfterImpulse: false,
    },
  });

  const analyzeSpy = vi.spyOn(
    (service as any).analysisEngine,
    "analyzeCandles"
  );

  analyzeSpy
    .mockReturnValueOnce(createAnalysis(false))
    .mockReturnValueOnce(createAnalysis(false))
    .mockReturnValueOnce(createAnalysis(true));

  const result = await service.analyze(
    "mexc",
    "TESTUSDT",
    "SCALP"
  );

  expect(result.decision.signal).toBe("WAIT");
  expect(result.tradeSetup).toBeNull();

  expect(result.decision.reason).toBe(
    "Bullish alignment detected, but the setup timeframe is already too extended above EMA20."
  );
});

it("should return WAIT when all timeframes are SHORT but setup is overextended below EMA20", async () => {
  const service = new MultiTimeframeService();

  vi.spyOn(service, "fetchCandles").mockResolvedValue({
    higherTimeframeCandles: [],
    trendTimeframeCandles: [],
    setupTimeframeCandles: [],
  });

  const createAnalysis = (
    isExtendedForShort: boolean
  ) => ({
    decision: {
      signal: "SHORT",
      confidence: 80,
    },

    entryQuality: {
      extensionInAtr:
        isExtendedForShort ? 3 : 1,
      signedExtensionInAtr:
        isExtendedForShort ? -3 : -1,
      isExtended: isExtendedForShort,
      isExtendedForLong: false,
      isExtendedForShort,
      recentBullishImpulseInAtr: 0,
      recentBearishImpulseInAtr: 2,
      isLateLongAfterImpulse: false,
      isLateShortAfterImpulse: false,
    },
  });

  const analyzeSpy = vi.spyOn(
    (service as any).analysisEngine,
    "analyzeCandles"
  );

  analyzeSpy
    .mockReturnValueOnce(createAnalysis(false))
    .mockReturnValueOnce(createAnalysis(false))
    .mockReturnValueOnce(createAnalysis(true));

  const result = await service.analyze(
    "mexc",
    "TESTUSDT",
    "SCALP"
  );

  expect(result.decision.signal).toBe("WAIT");
  expect(result.tradeSetup).toBeNull();

  expect(result.decision.reason).toBe(
    "Bearish alignment detected, but the setup timeframe is already too extended below EMA20."
  );
});