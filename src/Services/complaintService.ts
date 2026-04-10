import { Complaint, CreateComplaintRequest } from "../Models/Complaint";
import { api } from "./apiClient";

export const complaintService = {
  getAll: (): Promise<Complaint[]> =>
    api.get("/complaints"),

  getById: (id: string): Promise<Complaint> =>
    api.get(`/complaints/${id}`),

  getByUser: (userId: string): Promise<Complaint[]> =>
    api.get(`/complaints/user/${userId}`),

  getByStatus: (status: string): Promise<Complaint[]> =>
    api.get(`/complaints/status/${status}`),

  create: (complaint: CreateComplaintRequest): Promise<Complaint> =>
    api.post("/complaints", complaint),

  update: (id: string, complaint: Partial<Complaint>): Promise<Complaint> =>
    api.put(`/complaints/${id}`, complaint),

  delete: (id: string): Promise<void> =>
    api.delete(`/complaints/${id}`),
  // Ajoutez cette méthode à l'objet complaintService existant
  assignTechnician: (complaintId: string, technicianId: string): Promise<Complaint> =>
  api.put(`/complaints/${complaintId}/assign`, { technicianId }),
};
