import type { Complaint, ComplaintStatus, ComplaintPriority } from "../../Models/Complaint";
import type { User } from "../../Models/user";

export type { Complaint, ComplaintStatus, ComplaintPriority, User };

export type StatutReclamation = "nouvelle" | "en_cours" | "resolue" | "fermee";
export type Priorite          = "faible" | "moyenne" | "haute" | "urgente";
export type View              = "dashboard" | "profile" | "agenda" | "reclamations";

export interface Reclamation {
  id:                   string;
  numero:               string;
  titre:                string;
  description:          string;
  client:               string;
  dateCreation:         string;
  dateRaw:              Date | null;
  categorie:            string;
  priorite:             Priorite;
  statut:               StatutReclamation;
  technicienAssigneId?: string | null;
  technicienAssigneNom?:string | null;
  labId?:               string;
  labName?:             string;
  machine?:             string;
  photoUrl?:            string | null;
  resolution?:          string;
}

export interface AgendaItem {
  id:          string;
  reclamation: Reclamation;
  jourLabel:   string;
  dateLabel:   string;
  heure:       string;
  titre:       string;
  lieu:        string;
  couleur:     string;
  dateRaw:     Date;
}

export interface ProfileForm {
  name:            string;
  email:           string;
  phone:           string;
  department:      string;
  specialite:      string;
  currentPassword: string;
  newPassword:     string;
  confirmPassword: string;
}