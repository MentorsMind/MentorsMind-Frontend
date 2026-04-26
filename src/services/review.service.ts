import { apiConfig } from "../config/api.config";
import type { RequestOptions } from "../types/api.types";
import { request } from "../utils/request.utils";

export interface ReviewApiRecord {
  id: string;
  mentor_id?: string;
  reviewer_id?: string;
  reviewer_name?: string;
  booking_id?: string;
  session_id?: string;
  rating: number;
  comment: string;
  created_at: string;
  helpful_count?: number;
}

export interface CreateReviewPayload {
  session_id: string;
  rating: number;
  comment: string;
}

export interface UpdateReviewPayload {
  rating: number;
  comment: string;
}

export default class ReviewService {
  async listByBooking(sessionId: string, opts?: RequestOptions) {
    return request<ReviewApiRecord[]>(
      {
        method: "GET",
        url: apiConfig.url.reviews.base,
        params: { session_id: sessionId },
      },
      opts,
    );
  }

  async createReview(payload: CreateReviewPayload, opts?: RequestOptions) {
    return request<ReviewApiRecord>(
      {
        method: "POST",
        url: apiConfig.url.reviews.base,
        data: payload,
      },
      opts,
    );
  }

  async updateReview(reviewId: string, payload: UpdateReviewPayload, opts?: RequestOptions) {
    return request<ReviewApiRecord>(
      {
        method: "PUT",
        url: `${apiConfig.url.reviews.base}/${reviewId}`,
        data: payload,
      },
      opts,
    );
  }

  async voteHelpful(reviewId: string, opts?: RequestOptions) {
    return request<{ helpful_count: number }>(
      {
        method: "POST",
        url: `${apiConfig.url.reviews.helpful}/${reviewId}/helpful`,
      },
      opts,
    );
  }
}
