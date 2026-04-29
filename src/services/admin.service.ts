import api from "./api.client";
import { EmailPreviewResponse, EmailPreviewRequest, RevenueSummary, RevenueDailyPoint, RevenueTransactionsResponse, RevenuePeriod } from "../types/admin.types";

export const AdminService = {
  /**
   * Preview an email template with sample data
   * POST /api/v1/admin/email/preview/:template
   */
  async previewEmailTemplate(
    template: string,
    data?: EmailPreviewRequest
  ): Promise<EmailPreviewResponse> {
    const response = await api.post<EmailPreviewResponse>(
      `/admin/email/preview/${template}`,
      data
    );
    return response.data;
  },

  /**
   * GET /admin/reports/revenue?period=30d
   * Summary: total revenue, transaction count, platform fees
   */
  async getRevenueSummary(period: RevenuePeriod): Promise<RevenueSummary> {
    const response = await api.get<RevenueSummary>(
      `/admin/reports/revenue?period=${period}`
    );
    return response.data;
  },

  /**
   * GET /admin/reports/revenue/daily?from=ISO&to=ISO
   * Daily time series for charts
   */
  async getRevenueDailySeries(from: string, to: string): Promise<RevenueDailyPoint[]> {
    const response = await api.get<RevenueDailyPoint[]>(
      `/admin/reports/revenue/daily?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`
    );
    return response.data;
  },

  /**
   * GET /admin/reports/transactions?from=ISO&to=ISO&status=completed
   * Paginated transaction list
   */
  async getRevenueTransactions(
    from: string,
    to: string,
    offset = 0,
    limit = 25
  ): Promise<RevenueTransactionsResponse> {
    const params = new URLSearchParams({
      from,
      to,
      status: "completed",
      offset: String(offset),
      limit: String(limit),
    });
    const response = await api.get<RevenueTransactionsResponse>(
      `/admin/reports/transactions?${params.toString()}`
    );
    return response.data;
  },

  /**
   * GET /admin/reports/export?type=revenue&format=csv&from=ISO&to=ISO
   * Triggers a file download via window.location — avoids fetch() for streaming CSV.
   */
  exportRevenueCSV(from: string, to: string): void {
    const params = new URLSearchParams({
      type: "revenue",
      format: "csv",
      from,
      to,
    });
    window.location.href = `/api/admin/reports/export?${params.toString()}`;
  },
};

export default AdminService;
