import { apiConfig } from "../config/api.config";
import type { RequestOptions } from "../types/api.types";
import type { PaymentQuote } from "../types/payment.types";
import { request } from "../utils/request.utils";
import api from "./api.client";

export default class PaymentService {
  async getQuote(amount: number, assetCode: string, opts?: RequestOptions) {
    return request<PaymentQuote>(
      { method: "GET", url: `${apiConfig.url.payments}/quote`, params: { amount, assetCode } },
      opts,
    );
  }

  async pay(
    payload: { amount: number; quoteId: string; assetCode: string },
    idempotencyKey: string,
    opts?: RequestOptions,
  ) {
    const res = await api({
      method: "POST",
      url: apiConfig.url.payments,
      data: payload,
      headers: { "Idempotency-Key": idempotencyKey },
      signal: opts?.signal,
    });

    return {
      data: res.data as { status: string; transactionHash?: string },
      replayed: res.headers["x-idempotency-replayed"] === "true",
    };
  }
}
