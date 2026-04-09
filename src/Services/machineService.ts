import { Machine } from "../Models/Machine";
import { api } from "./apiClient";

export const machineService = {
  getAll: (): Promise<Machine[]> =>
    api.get("/machines"),

  getById: (id: string): Promise<Machine> =>
    api.get(`/machines/${id}`),

  create: (machine: Omit<Machine, "id">): Promise<Machine> =>
    api.post("/machines", machine),

  update: (id: string, machine: Partial<Machine>): Promise<Machine> =>
    api.put(`/machines/${id}`, machine),

  delete: (id: string): Promise<void> =>
    api.delete(`/machines/${id}`),
};
