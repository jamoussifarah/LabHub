import { api } from "./apiClient";
import type { Reservation, CreateReservationRequest, ReservationStatus } from "../types/models";

export const reservationService = {
  getAll: (): Promise<Reservation[]> =>
    api.get("/reservations"),

  getById: (id: string): Promise<Reservation> =>
    api.get(`/reservations/${id}`),

  getByUser: (userId: string): Promise<Reservation[]> =>
    api.get(`/reservations/user/${userId}`),

  getByLab: (labId: string): Promise<Reservation[]> =>
    api.get(`/reservations/lab/${labId}`),

  create: (reservation: CreateReservationRequest): Promise<Reservation> =>
    api.post("/reservations", reservation),

  updateStatus: (id: string, status: ReservationStatus): Promise<Reservation> =>
    api.patch(`/reservations/${id}/status`, { status }),

  delete: (id: string): Promise<void> =>
    api.delete(`/reservations/${id}`),
};
