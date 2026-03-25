import { apiConfig } from "../config/api.config";
import type { RequestOptions } from "../types/api.types";
import { request } from "../utils/request.utils";

export default class MentorService {
  async getMentors(opts?: RequestOptions) {
    return request<{ id: string; name: string }[]>(
      {
        method: "GET",
        url: apiConfig.url.mentors,
      },
      opts,
    );
  }

  async getMentor(id: string, opts?: RequestOptions) {
    return request<{ id: string; name: string }[]>(
      {
        method: "GET",
        url: apiConfig.url.mentors,
        data: { id },
      },
      opts,
    );
  }

  async add(args: Record<string, unknown>, opts?: RequestOptions) {
    return request<{ id: string; name: string }[]>(
      {
        method: "POST",
        url: apiConfig.url.mentors,
        data: { args },
      },
      opts,
    );
  }
}
