import { ExchangeAdapter } from "../interfaces/exchange.interface";
import { MexcExchangeAdapter } from "../exchanges/mexc.exchange";

export class ExchangeFactory {
  static create(exchange: string): ExchangeAdapter {
    switch (exchange.toLowerCase()) {
      case "mexc":
        return new MexcExchangeAdapter();

      default:
        throw new Error(`Exchange '${exchange}' is not supported.`);
    }
  }
}