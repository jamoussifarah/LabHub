import { Lab } from "./Lab";
import { Machine } from "./Machine";
import { User } from "./user";

export type ComplaintStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
export type ComplaintPriority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
 
export interface Complaint {
  id: string;
  userId: string;
  user?: User;
  userName?: string;
  labId?: string;
  lab?: Lab;
  labName?: string;
  machine?: Machine;
  imageUrl?: string;
  subject: string;
  description: string;
  category?: string;
  status: ComplaintStatus;
  priority: ComplaintPriority;
  resolution?: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  
}
 
export interface CreateComplaintRequest {
  userId: string;
  labId?: string;
  subject: string;
  description: string;
  category?: string;
  priority?: ComplaintPriority;
  imageUrl?: string;
}