import { describe, expect, it } from "vitest";
import { MarketScannerService } from "./market-scanner.service";

describe("MarketScannerService", () => {
  
    it("should create the service", () => {
    const service = new MarketScannerService();

    expect(service).toBeDefined();
  });

  it("should filter USDT symbols", () => {
    const service = new MarketScannerService();

    const symbols = [
      "BTCUSDT",
      "ETHUSDT",
      "BTCUSDC",
      "SOLBTC",
      "JUPUSDT",
    ];

    const result = service.getUsdtSymbols(symbols);

    expect(result).toEqual([
      "BTCUSDT",
      "ETHUSDT",
      "JUPUSDT",
    ]);
  });

  });


 