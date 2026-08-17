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
      const candles = await dataEngine.getCandles({
        exchange: "mexc",
        symbol: "BTCUSDT",
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
      const candles = await dataEngine.getCandles({
        exchange: "mexc",
        symbol: "BTCUSDT",
        timeframe: "60m",
        limit: 250,
      });

      const analysis = analysisEngine.analyzeCandles(candles);

      res.status(200).json({
        success: true,
        market: {
          exchange: "mexc",
          symbol: "BTCUSDT",
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
}