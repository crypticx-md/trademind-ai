import { Router } from "express";
import { MarketController } from "../controllers/market.controller";

const router = Router();

router.get("/candles", MarketController.getCandles);
router.get("/analysis", MarketController.getAnalysis);
router.get("/search", MarketController.searchSymbols);
router.get(
  "/multi-timeframe-analysis",
  MarketController.getMultiTimeframeAnalysis
);
router.get(
  "/scanner",
  MarketController.scanMarkets
);

export default router;