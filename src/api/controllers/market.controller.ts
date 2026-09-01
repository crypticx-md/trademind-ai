import { Request, Response } from "express";
import { AnalysisEngine } from "../../core/analysis-engine/analysis-engine";
import { DataEngine } from "../../core/data-engine/data-engine";
import { MultiTimeframeService } from "../../core/analysis-engine/multi-timeframe/multi-timeframe.service";
import { MarketScannerService } from "../../core/market-scanner/market-scanner.service";
import { TradingStyle } from "../../shared/types/market.types";

const dataEngine = new DataEngine();
const analysisEngine = new AnalysisEngine();
const multiTimeframeService = new MultiTimeframeService();
const marketScannerService = new MarketScannerService();


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
        marketType: "SPOT",
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
        marketType: "SPOT",
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

  const symbols = await dataEngine.getSymbols(
  "mexc",
  "SPOT"
);

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

static async getMultiTimeframeAnalysis(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const symbol =
      typeof req.query.symbol === "string"
        ? req.query.symbol.toUpperCase()
        : "BTCUSDT";

    const style =
      typeof req.query.style === "string"
        ? req.query.style.toUpperCase()
        : "SCALP";

    const result = await multiTimeframeService.analyze(
      "mexc",
      symbol,
      style as "SCALP" | "DAY_TRADE" | "SWING"
    );

    res.status(200).json({
      success: true,
      market: {
        exchange: "mexc",
        symbol,
        style,
      },
      result,
    });
  } catch (error) {
    console.error("Multi-timeframe analysis error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to analyze multi-timeframe market data.",
    });
  }
}

static async scanMarkets(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const style =
      typeof req.query.style === "string"
        ? req.query.style.toUpperCase()
        : "SCALP";

 const maximumResults =
  typeof req.query.maximumResults === "string"
    ? Number(req.query.maximumResults)
    : 5;

const results = await marketScannerService.scan(
  "mexc",
  style as TradingStyle,
  maximumResults
);

    res.status(200).json({
      success: true,
      exchange: "mexc",
      style,
      maximumResults,
      count: results.length,
      results,
    });
  } catch (error) {
    console.error("Market scanner error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to scan markets.",
    });
  }
}

}