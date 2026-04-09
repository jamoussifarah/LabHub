import { Lab } from "./Lab";
import { User } from "./user";

export type ReservationStatus = "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";
 
export interface Reservation {
  id: string;
  purpose?: string;
  status: ReservationStatus;
  notes?: string;
  startTime: string; // ISO date string
  endTime: string;
  createdAt?: string;
  confirmedAt?: string;
  cancelledAt?: string;
  userId?: string;
  user?: User;
  labId?: string;
  lab?: Lab;
}
export interface CreateReservationRequest {
  purpose?: string;
  notes?: string;
  startTime: string;
  endTime: string;
  userId: string;
  labId: string;
}