import { describe, expect, it } from "vitest";
import { MultiTimeframeDecisionService } from "./multi-timeframe-decision.service";

describe("MultiTimeframeDecisionService", () => {
  it("should return LONG when all timeframes are LONG", () => {
    const service = new MultiTimeframeDecisionService();

    const result = service.combineSignals(
      "LONG",
      "LONG",
      "LONG",
      80,
      70,
      60,
    );

    expect(result.signal).toBe("LONG");
    expect(result.confidence).toBe(72);
     expect(result.alignmentScore).toBe(100);
  expect(result.reason).toBe(
  "All timeframes are aligned bullish."
);

  });
});

it("should calculate weighted confidence correctly", () => {
  const service = new MultiTimeframeDecisionService();

  const result = service.combineSignals(
    "LONG",
    "LONG",
    "LONG",
    90,
    80,
    70
  );

  expect(result.signal).toBe("LONG");
  expect(result.confidence).toBe(82);
});

it("should return SHORT when all timeframes are SHORT", () => {
  const service = new MultiTimeframeDecisionService();

  const result = service.combineSignals(
    "SHORT",
    "SHORT",
    "SHORT",
    80,
    70,
    60,
  );

  expect(result.signal).toBe("SHORT");
  expect(result.confidence).toBe(72);
  expect(result.alignmentScore).toBe(100);
  expect(result.reason).toBe(
  "All timeframes are aligned bearish."
);
});

it("should return WAIT when timeframes are not fully aligned", () => {
  const service = new MultiTimeframeDecisionService();

  const result = service.combineSignals(
    "LONG",
    "LONG",
    "SHORT",
    80,
    70,
    60,
  );

  expect(result.signal).toBe("WAIT");
  expect(result.confidence).toBe(72);
  expect(result.alignmentScore).toBe(67);
  expect(result.reason).toBe(
  "Two timeframes are bullish, but full confirmation is missing."
);
});

it("should return WAIT when one timeframe is NEUTRAL", () => {
  const service = new MultiTimeframeDecisionService();

  const result = service.combineSignals(
    "LONG",
    "LONG",
    "NEUTRAL",
    80,
    70,
    40,
  );

  expect(result.signal).toBe("WAIT");
  expect(result.confidence).toBe(67);
  expect(result.alignmentScore).toBe(67);
});

it("should clamp confidence values between 0 and 100", () => {
  const service = new MultiTimeframeDecisionService();

  const result = service.combineSignals(
    "LONG",
    "LONG",
    "LONG",
    150,
    120,
    -20
  );

  expect(result.signal).toBe("LONG");
  expect(result.confidence).toBe(75);
 

});

it("should return 0 confidence when all confidence values are below 0", () => {
  const service = new MultiTimeframeDecisionService();

  const result = service.combineSignals(
    "LONG",
    "LONG",
    "LONG",
    -10,
    -20,
    -30
  );

  expect(result.signal).toBe("LONG");
  expect(result.confidence).toBe(0);
});

it("should return 33 alignment when all timeframe signals differ", () => {
  const service = new MultiTimeframeDecisionService();

  const result = service.combineSignals(
    "LONG",
    "SHORT",
    "NEUTRAL",
    80,
    70,
    60
  );

  expect(result.signal).toBe("WAIT");
  expect(result.alignmentScore).toBe(33);
});

it("should return 0 alignment when all timeframes are NEUTRAL", () => {
  const service = new MultiTimeframeDecisionService();

  const result = service.combineSignals(
    "NEUTRAL",
    "NEUTRAL",
    "NEUTRAL",
    40,
    40,
    40
  );

  expect(result.signal).toBe("WAIT");
  expect(result.alignmentScore).toBe(0);
  expect(result.reason).toBe(
  "All timeframes are neutral."
);
});

it("should explain partial bearish alignment", () => {
  const service = new MultiTimeframeDecisionService();

  const result = service.combineSignals(
    "SHORT",
    "SHORT",
    "LONG",
    80,
    70,
    60
  );

  expect(result.signal).toBe("WAIT");
  expect(result.alignmentScore).toBe(67);

  expect(result.reason).toBe(
    "Two timeframes are bearish, but full confirmation is missing."
  );
});

