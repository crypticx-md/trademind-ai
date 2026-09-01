import { describe, it, expect } from "vitest";
import { DecisionEngineService } from "./decision-engine.service";

describe("DecisionEngineService", () => {
  it("should create the service", () => {
    const service = new DecisionEngineService();
    

    expect(service).toBeDefined();
  });

    it("should score bullish trend and bullish market structure positively", () => {
    const service = new DecisionEngineService();
    

    const trend = {
  direction: "BULLISH" as const,
  strength: "STRONG" as const,
  score: 80,
  confidence: 80,
};

const marketStructure = {
  direction: "BULLISH" as const,
  higherHighs: 5,
  higherLows: 5,
  lowerHighs: 0,
  lowerLows: 0,
};

const supportResistance = {
  nearestSupport: null,
  nearestResistance: null,
  bestSupport: null,
  bestResistance: null,
  levels: [],
};

const rsi = 50;
const volumeStatus = "AVERAGE";

const result = service.analyze(
  trend,
  marketStructure,
  supportResistance,
  rsi,
  volumeStatus
);

expect(result.signal).toBe("LONG");
expect(result.score).toBe(60);
expect(result.breakdown.trendAndStructure).toBe(60);
expect(result.breakdown.rsi).toBe(0);
expect(result.breakdown.volume).toBe(0);
expect(result.breakdown.supportResistance).toBe(0);

  });

  it("should add bullish RSI confirmation to the decision score", () => {

    const service = new DecisionEngineService();

const trend = {
  direction: "BULLISH" as const,
  strength: "STRONG" as const,
  score: 80,
  confidence: 80,
};

const marketStructure = {
  direction: "BULLISH" as const,
  higherHighs: 5,
  higherLows: 5,
  lowerHighs: 0,
  lowerLows: 0,
};

const supportResistance = {
  nearestSupport: null,
  nearestResistance: null,
  bestSupport: null,
  bestResistance: null,
  levels: [],
};

const rsi = 60;
const volumeStatus = "AVERAGE";

const result = service.analyze(
  trend,
  marketStructure,
  supportResistance,
  rsi,
  volumeStatus
);

expect(result.signal).toBe("LONG");
expect(result.score).toBe(70);
expect(result.breakdown.trendAndStructure).toBe(60);
expect(result.breakdown.rsi).toBe(10);
expect(result.breakdown.volume).toBe(0);
expect(result.breakdown.supportResistance).toBe(0);

});

it("should reduce bullish score when volume is below average", () => {

    const service = new DecisionEngineService();

const trend = {
  direction: "BULLISH" as const,
  strength: "STRONG" as const,
  score: 80,
  confidence: 80,
};

const marketStructure = {
  direction: "BULLISH" as const,
  higherHighs: 5,
  higherLows: 5,
  lowerHighs: 0,
  lowerLows: 0,
};

const supportResistance = {
  nearestSupport: null,
  nearestResistance: null,
  bestSupport: null,
  bestResistance: null,
  levels: [],
};

const rsi = 50;
const volumeStatus = "BELOW_AVERAGE";

const result = service.analyze(
  trend,
  marketStructure,
  supportResistance,
  rsi,
  volumeStatus
);
expect(result.signal).toBe("LONG");
expect(result.score).toBe(50);
expect(result.breakdown.trendAndStructure).toBe(60);
expect(result.breakdown.rsi).toBe(0);
expect(result.breakdown.volume).toBe(-10);
expect(result.breakdown.supportResistance).toBe(0);

});

it("should reduce bullish score near strong resistance", () => {

const service = new DecisionEngineService();

const trend = {
  direction: "BULLISH" as const,
  strength: "STRONG" as const,
  score: 80,
  confidence: 80,
};

const marketStructure = {
  direction: "BULLISH" as const,
  higherHighs: 5,
  higherLows: 5,
  lowerHighs: 0,
  lowerLows: 0,
};

const supportResistance = {
  nearestSupport: null,
  nearestResistance: {
    type: "RESISTANCE" as const,
    price: 100,
    touches: 3,
    distanceFromCurrentPrice: 0.5,
    strength: "STRONG" as const,
    candlesSinceLastTouch: 2,
    qualityScore: 80,
  },
  bestSupport: null,
  bestResistance: null,
  levels: [],
};

const rsi = 50;
const volumeStatus = "AVERAGE";
const result = service.analyze(
  trend,
  marketStructure,
  supportResistance,
  rsi,
  volumeStatus
);
expect(result.signal).toBe("LONG");
expect(result.score).toBe(40);
expect(result.breakdown.trendAndStructure).toBe(60);
expect(result.breakdown.rsi).toBe(0);
expect(result.breakdown.volume).toBe(0);
expect(result.breakdown.supportResistance).toBe(-20);

});

});

it("should give partial bullish credit when trend is BULLISH and structure is RANGING", () => {
  const service = new DecisionEngineService();

  const result = service.analyze(
    {
      direction: "BULLISH",
      strength: "MODERATE",
      score: 50,
      confidence: 75,
      
    },
    {
      direction: "RANGING",
      higherHighs: 0,
      higherLows: 0,
      lowerHighs: 0,
      lowerLows: 0,
    },
    {
      nearestSupport: null,
      nearestResistance: null,
      bestSupport: null,
      bestResistance: null,
      levels: [],
    },
    50,
    "AVERAGE"
  );

  expect(result.breakdown.trendAndStructure).toBe(30);
});

it("should give stronger bullish credit when trend is STRONG and structure is RANGING", () => {
  const service = new DecisionEngineService();

  const result = service.analyze(
    {
      direction: "BULLISH",
      strength: "STRONG",
      score: 70,
      confidence: 85,
    },
    {
      direction: "RANGING",
      higherHighs: 0,
      higherLows: 0,
      lowerHighs: 0,
      lowerLows: 0,
    },
    {
      nearestSupport: null,
      nearestResistance: null,
      bestSupport: null,
      bestResistance: null,
      levels: [],
    },
    50,
    "AVERAGE"
  );

  expect(result.breakdown.trendAndStructure).toBe(40);
});

it("should give weaker bullish credit when trend is WEAK and structure is RANGING", () => {
  const service = new DecisionEngineService();

  const result = service.analyze(
    {
      direction: "BULLISH",
      strength: "WEAK",
      score: 30,
      confidence: 55,
    },
    {
      direction: "RANGING",
      higherHighs: 0,
      higherLows: 0,
      lowerHighs: 0,
      lowerLows: 0,
    },
    {
      nearestSupport: null,
      nearestResistance: null,
      bestSupport: null,
      bestResistance: null,
      levels: [],
    },
    50,
    "AVERAGE"
  );

  expect(result.breakdown.trendAndStructure).toBe(20);
});

it("should give partial bearish credit when trend is BEARISH and structure is RANGING", () => {
  const service = new DecisionEngineService();

  const result = service.analyze(
    {
      direction: "BEARISH",
      strength: "MODERATE",
      score: 50,
      confidence: 75,
    },
    {
      direction: "RANGING",
      higherHighs: 0,
      higherLows: 0,
      lowerHighs: 0,
      lowerLows: 0,
    },
    {
      nearestSupport: null,
      nearestResistance: null,
      bestSupport: null,
      bestResistance: null,
      levels: [],
    },
    50,
    "AVERAGE"
  );

  expect(result.breakdown.trendAndStructure).toBe(-30);
});

it("should give stronger bearish credit when trend is STRONG and structure is RANGING", () => {
  const service = new DecisionEngineService();

  const result = service.analyze(
    {
      direction: "BEARISH",
      strength: "STRONG",
      score: 70,
      confidence: 85,
    },
    {
      direction: "RANGING",
      higherHighs: 0,
      higherLows: 0,
      lowerHighs: 0,
      lowerLows: 0,
    },
    {
      nearestSupport: null,
      nearestResistance: null,
      bestSupport: null,
      bestResistance: null,
      levels: [],
    },
    50,
    "AVERAGE"
  );

  expect(result.breakdown.trendAndStructure).toBe(-40);
});

it("should give weaker bearish credit when trend is WEAK and structure is RANGING", () => {
  const service = new DecisionEngineService();

  const result = service.analyze(
    {
      direction: "BEARISH",
      strength: "WEAK",
      score: 30,
      confidence: 55,
    },
    {
      direction: "RANGING",
      higherHighs: 0,
      higherLows: 0,
      lowerHighs: 0,
      lowerLows: 0,
    },
    {
      nearestSupport: null,
      nearestResistance: null,
      bestSupport: null,
      bestResistance: null,
      levels: [],
    },
    50,
    "AVERAGE"
  );

  expect(result.breakdown.trendAndStructure).toBe(-20);
});