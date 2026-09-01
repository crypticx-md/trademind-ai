import { DataEngine } from "../data-engine/data-engine";
import { MultiTimeframeService } from "../analysis-engine/multi-timeframe/multi-timeframe.service";
import { TradingStyle } from "../../shared/types/market.types";

export interface MarketScanResult {
  symbol: string;
  signal: "LONG" | "SHORT" | "WAIT";
  confidence: number;
  alignmentScore: number;
  reason: string;
}

export class MarketScannerService {
  private dataEngine = new DataEngine();
  private multiTimeframeService = new MultiTimeframeService();

  async getSymbols(exchange: string): Promise<string[]> {
  return this.dataEngine.getSymbols(exchange);
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
  };
}

isOpportunity(result: MarketScanResult): boolean {
  return (
    result.signal === "LONG" ||
    result.signal === "SHORT"
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

for (const symbol of candidates) {
  try {
    const result = await this.analyzeSymbol(
      exchange,
      symbol,
      style
    );

    if (this.isOpportunity(result)) {
      opportunities.push(result);
    }

    if (opportunities.length >= maximumResults) {
      break;
    }
  } catch (error) {
    console.error(
      `Scanner skipped ${symbol}:`,
      error
    );

    continue;
  }
}

  return opportunities;
}
}