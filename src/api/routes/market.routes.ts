import { Router } from "express";
import { MarketController } from "../controllers/market.controller";

const router = Router();

router.get("/candles", MarketController.getCandles);
router.get("/analysis", MarketController.getAnalysis);

export default router;