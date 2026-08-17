import { Candle } from "../../../shared/types/market.types";

export interface VolumeAnalysisResult {
  currentVolume: number;
  averageVolume: number;
  relativeVolume: number;
  status: "ABOVE_AVERAGE" | "BELOW_AVERAGE" | "AVERAGE";
}

export class VolumeService {
  analyze(candles: Candle[], period = 20): VolumeAnalysisResult {
    if (period <= 0) {
      throw new Error("Volume period must be greater than 0.");
    }

    if (candles.length < period) {
      throw new Error(
        `Volume period ${period} requires at least ${period} candles.`
      );
    }

    const recentCandles = candles.slice(-period);

    const volumes = recentCandles.map((candle) => candle.volume);

    const averageVolume =
      volumes.reduce((sum, volume) => sum + volume, 0) /
      volumes.length;

    const currentCandle = recentCandles[recentCandles.length - 1];

    if (!currentCandle) {
      throw new Error("Unable to find the latest candle.");
    }

    const currentVolume = currentCandle.volume;

    const relativeVolume =
      averageVolume === 0
        ? 0
        : currentVolume / averageVolume;

    let status: VolumeAnalysisResult["status"] = "AVERAGE";

    if (relativeVolume > 1.1) {
      status = "ABOVE_AVERAGE";
    } else if (relativeVolume < 0.9) {
      status = "BELOW_AVERAGE";
    }

    return {
      currentVolume,
      averageVolume,
      relativeVolume,
      status,
    };
  }
}