import { request } from "./request";
import type { Company, PaginatedResponse } from "./types";

export const companiesClient = {
  list: (params?: { page?: number; limit?: number; search?: string }) =>
    request<PaginatedResponse<Company>>(
      `/api/recruiter/companies?${new URLSearchParams({
        page: String(params?.page || 1),
        limit: String(params?.limit || 10),
        ...(params?.search ? { search: params.search } : {}),
      })}`,
      { method: "GET" }
    ),
  getById: (id: string) =>
    request<{ data: Company }>(`/api/recruiter/companies/${id}`, { method: "GET" }),
  create: (body: {
    name: string;
    email: string;
    contact?: string;
    phone?: string;
    website?: string;
    location?: string;
    keyTechnologies?: string;
    clientAccountId?: string;
  }) =>
    request<{ data: Company }>("/api/recruiter/companies", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  update: (id: string, body: {
    name?: string;
    email?: string;
    contact?: string;
    phone?: string;
    website?: string;
    location?: string;
    keyTechnologies?: string;
    clientAccountId?: string;
  }) =>
    request<{ data: Company }>(`/api/recruiter/companies/${id}`, {
      method: "PUT",
      body: JSON.stringify(body),
    }),
  delete: (id: string) =>
    request<{ success: boolean }>(`/api/recruiter/companies/${id}`, {
      method: "DELETE",
    }),
};
