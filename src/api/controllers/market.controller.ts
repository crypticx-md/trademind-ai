import { Request, Response } from "express";
import { AnalysisEngine } from "../../core/analysis-engine/analysis-engine";
import { DataEngine } from "../../core/data-engine/data-engine";

const dataEngine = new DataEngine();
const analysisEngine = new AnalysisEngine();

export class MarketController {
  static async getCandles(
    req: Request,
    res: Response
  ): Promise<void> {
    try {

    const symbol =
  typeof req.query.symbol === "string"
    ? req.query.symbol.toUpperCase()
    : "BTCUSDT";

      const candles = await dataEngine.getCandles({
        exchange: "mexc",
        symbol,
        timeframe: "60m",
        limit: 250,
      });

      res.status(200).json({
        success: true,
        market: {
          exchange: "mexc",
          symbol: "BTCUSDT",
          timeframe: "60m",
        },
        candles,
      });
    } catch (error) {
      console.error("Market data error:", error);

      res.status(500).json({
        success: false,
        message: "Unable to fetch market data.",
      });
    }
  }

  static async getAnalysis(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const symbol =
  typeof req.query.symbol === "string"
    ? req.query.symbol.toUpperCase()
    : "BTCUSDT";
      
      const candles = await dataEngine.getCandles({
        exchange: "mexc",
        symbol,
        timeframe: "60m",
        limit: 250,
      });

      const analysis = analysisEngine.analyzeCandles(candles);

      res.status(200).json({
        success: true,
        market: {
          exchange: "mexc",
          symbol,
          timeframe: "60m",
        },
        analysis,
        candles,
      });
    } catch (error) {
      console.error("Market analysis error:", error);

      res.status(500).json({
        success: false,
        message: "Unable to analyze market data.",
      });
    }
  }

  static async searchSymbols(
  req: Request,
  res: Response
): Promise<void> {

  try {
  const query =
    typeof req.query.q === "string"
      ? req.query.q.toUpperCase()
      : "";

  const symbols = await dataEngine.getSymbols("mexc");

  const matches = symbols
  .filter((symbol) => symbol.includes(query))
  .sort((a, b) => {
    const aStartsWith = a.startsWith(query);
    const bStartsWith = b.startsWith(query);

    if (aStartsWith && !bStartsWith) return -1;
    if (!aStartsWith && bStartsWith) return 1;

    return a.localeCompare(b);
  });
  
  res.status(200).json({
    success: true,
    query,
    results: matches,
  });
} catch (error) {
  console.error("Symbol search error:", error);

  res.status(500).json({
    success: false,
    message: "Unable to search market symbols.",
  });
}

}
}