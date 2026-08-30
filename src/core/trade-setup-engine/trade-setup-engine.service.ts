export type TradeDirection =
  | "LONG"
  | "SHORT";


export interface TradeSetupInput {
  direction: TradeDirection;
  currentPrice: number;
  atr: number;
}

export interface TradeSetupResult {
  entry: number;
  stopLoss: number;
  targets: number[];
  riskRewardRatio: number;
}

export class TradeSetupEngineService {
  
    generate(input: TradeSetupInput): TradeSetupResult {
    
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

const riskRewardRatio = reward / risk;

return {
  entry,
  stopLoss,
  targets,
  riskRewardRatio,
};
  }
}