import { api } from "./apiClient";
import type { Lab } from "../types/models";

export const labService = {
  getAll: (): Promise<Lab[]> =>
    api.get("/labs"),

  getAvailable: (): Promise<Lab[]> =>
    api.get("/labs/available"),

  getById: (id: string): Promise<Lab> =>
    api.get(`/labs/${id}`),

  search: (name: string): Promise<Lab[]> =>
    api.get(`/labs/search?name=${encodeURIComponent(name)}`),

  create: (lab: Omit<Lab, "id" | "createdAt" | "updatedAt" | "machines">): Promise<Lab> =>
    api.post("/labs", lab),

  update: (id: string, lab: Partial<Lab>): Promise<Lab> =>
    api.put(`/labs/${id}`, lab),

  delete: (id: string): Promise<void> =>
    api.delete(`/labs/${id}`),
};
