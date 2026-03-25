import { apiConfig } from "../config/api.config";
import type { RequestOptions } from "../types/api.types";
import { request } from "../utils/request.utils";

export default class PaymentService {
  async pay(amount: number, opts?: RequestOptions) {
    request<{ status: string }>(
      {
        method: "POST",
        url: apiConfig.url.payments,
        data: { amount },
      },
      opts,
    );
  }
}
