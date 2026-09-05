import { DataEngine } from "../data-engine/data-engine";
import { MultiTimeframeService } from "../analysis-engine/multi-timeframe/multi-timeframe.service";
import { TradingStyle } from "../../shared/types/market.types";
import {
  TradeSetupResult,
} from "../trade-setup-engine/trade-setup-engine.service";

export interface MarketScanResult {
  symbol: string;
  signal: "LONG" | "SHORT" | "WAIT";
  confidence: number;
  alignmentScore: number;
  reason: string;
  tradeSetup: TradeSetupResult | null;
}

export class MarketScannerService {
  private dataEngine = new DataEngine();
  private multiTimeframeService = new MultiTimeframeService();

async getSymbols(exchange: string): Promise<string[]> {
  return this.dataEngine.getSymbols(
    exchange,
    "FUTURES"
  );
}
getUsdtSymbols(symbols: string[]): string[] {
  return symbols.filter((symbol) =>
    symbol.endsWith("USDT")
  );
}

getScanCandidates(
  symbols: string[],
  limit = 20
): string[] {
  return this.getUsdtSymbols(symbols)
    .sort((a, b) => a.localeCompare(b))
    .slice(0, limit);
}

async analyzeSymbol(
  exchange: string,
  symbol: string,
  style: TradingStyle
): Promise<MarketScanResult> {
  const analysis =
    await this.multiTimeframeService.analyze(
      exchange,
      symbol,
      style
    );
    

  return {
    symbol,
    signal: analysis.decision.signal,
    confidence: analysis.decision.confidence,
    alignmentScore: analysis.decision.alignmentScore,
    reason: analysis.decision.reason,
    tradeSetup: analysis.tradeSetup,
  };
}

isOpportunity(result: MarketScanResult): boolean {
  return (
    (
      result.signal === "LONG" ||
      result.signal === "SHORT"
    ) &&
    result.tradeSetup !== null
  );
}

async scan(
  exchange: string,
  style: TradingStyle,
  maximumResults = 5
): Promise<MarketScanResult[]> {
  const symbols = await this.getSymbols(exchange);
  const candidates = this.getUsdtSymbols(symbols);
  const opportunities: MarketScanResult[] = [];

  let scanned = 0;
  let waitCount = 0;
  let tradeSetupNullCount = 0;
  let errorCount = 0;

  for (const symbol of candidates) {
    try {
      scanned++;

      const result = await this.analyzeSymbol(
        exchange,
        symbol,
        style
      );

      if (result.signal === "WAIT") {
        waitCount++;
      }

      if (
        (
          result.signal === "LONG" ||
          result.signal === "SHORT"
        ) &&
        result.tradeSetup === null
      ) {
        tradeSetupNullCount++;
      }

      if (this.isOpportunity(result)) {
        opportunities.push(result);
      }

      if (opportunities.length >= maximumResults) {
        break;
      }
    } catch (error) {
      errorCount++;

      console.error(
        `Scanner skipped ${symbol}:`,
        error
      );

      continue;
    }
  }

  console.log("===== SCANNER DEBUG =====");
  console.log("Scanned:", scanned);
  console.log("WAIT:", waitCount);
  console.log(
    "LONG/SHORT but tradeSetup null:",
    tradeSetupNullCount
  );
  console.log("Errors:", errorCount);
  console.log(
    "Valid opportunities:",
    opportunities.length
  );
  console.log("=========================");

  return opportunities;
}
}