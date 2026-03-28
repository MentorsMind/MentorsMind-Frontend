import { apiConfig } from "../config/api.config";
import { STELLAR_CONFIG, getHorizonServer } from "../config/stellar.config";
import type { RequestOptions } from "../types/api.types";
import { request } from "../utils/request.utils";

export interface PaymentRequest {
  sessionId: string;
  mentorId: string;
  amount: number;
  assetCode: string;
  transactionHash: string;
  escrowId?: string;
}

export interface PaymentResponse {
  success: boolean;
  paymentId: string;
  escrowId: string;
  status: 'pending' | 'confirmed' | 'failed';
  transactionHash: string;
}

export interface PaymentStatus {
  paymentId: string;
  status: 'pending' | 'confirmed' | 'failed';
  transactionHash: string;
  escrowId?: string;
  confirmedAt?: string;
}

export default class PaymentService {
  async createPayment(paymentData: PaymentRequest, opts?: RequestOptions): Promise<PaymentResponse> {
    return request<PaymentResponse>(
      {
        method: "POST",
        url: apiConfig.url.payments,
        data: paymentData,
      },
      opts,
    );
  }

  async getPaymentStatus(paymentId: string, opts?: RequestOptions): Promise<PaymentStatus> {
    return request<PaymentStatus>(
      {
        method: "GET",
        url: `${apiConfig.url.payments}/${paymentId}/status`,
      },
      opts,
    );
  }

  async pollPaymentStatus(
    paymentId: string,
    onStatusUpdate?: (status: PaymentStatus) => void,
    maxAttempts: number = STELLAR_CONFIG.maxPollingAttempts
  ): Promise<PaymentStatus> {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        const status = await this.getPaymentStatus(paymentId);
        onStatusUpdate?.(status);

        if (status.status === 'confirmed' || status.status === 'failed') {
          return status;
        }

        // Wait before next poll
        await new Promise(resolve => setTimeout(resolve, STELLAR_CONFIG.pollingInterval));
      } catch (error) {
        console.error('Error polling payment status:', error);
        // Continue polling on error
      }
    }

    throw new Error('Payment confirmation timeout');
  }

  async verifyTransactionOnLedger(transactionHash: string): Promise<boolean> {
    try {
      const server = getHorizonServer();
      const transaction = await server.transactions().transaction(transactionHash).call();
      return transaction.successful;
    } catch (error) {
      console.error('Error verifying transaction:', error);
      return false;
    }
  }
}
