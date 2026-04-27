import api from "./api.client";
import { EmailPreviewResponse, EmailPreviewRequest } from "../types/admin.types";

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
};

export default AdminService;
