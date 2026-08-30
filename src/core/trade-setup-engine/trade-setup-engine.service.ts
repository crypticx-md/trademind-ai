export type TradeDirection =
  | "LONG"
  | "SHORT";


export interface TradeSetupInput {
  direction: TradeDirection;
  currentPrice: number;
  atr: number;
  nearestSupport: number | null;
nearestResistance: number | null;
}

export interface TradeSetupResult {
  direction: TradeDirection;
    entry: number;
  stopLoss: number;
  targets: number[];
  riskRewardRatio: number;
}

export class TradeSetupEngineService {
  
    generate(input: TradeSetupInput): TradeSetupResult | null {
    
 if (input.atr <= 0) {
  throw new Error("ATR must be greater than zero");
}
    
        const entry = input.currentPrice;
        const atrMultiplier = 1.5;

let stopLoss: number;

if (input.direction === "LONG") {
  stopLoss = entry - input.atr * atrMultiplier;
} else {
  stopLoss = entry + input.atr * atrMultiplier;
}

const risk = Math.abs(entry - stopLoss);
let targets: number[];

if (input.direction === "LONG") {
  targets = [
    entry + risk,
    entry + risk * 2,
    entry + risk * 3,
  ];
} else {
  targets = [
    entry - risk,
    entry - risk * 2,
    entry - risk * 3,
  ];
}

const finalTarget = targets[targets.length - 1];

const reward = Math.abs(finalTarget - entry);

let riskRewardRatio = reward / risk;

if (
  input.direction === "LONG" &&
  input.nearestResistance !== null
) {
  const realisticReward =
    input.nearestResistance - entry;

  const realisticRiskReward =
    realisticReward / risk;
    riskRewardRatio = realisticRiskReward;

  if (realisticRiskReward < 2) {
    return null;
  }
}

if (
  input.direction === "SHORT" &&
  input.nearestSupport !== null
) {
  const realisticReward =
    entry - input.nearestSupport;

  const realisticRiskReward =
    realisticReward / risk;
    riskRewardRatio = realisticRiskReward;

  if (realisticRiskReward < 2) {
    return null;
  }
}

const minimumRiskReward = 2;

if (riskRewardRatio < minimumRiskReward) {
  return null;
}

return {
  direction: input.direction,
    entry,
  stopLoss,
  targets,
  riskRewardRatio,
};
  }
}