import type { StatutReclamation, Priorite } from "./types";

export const statutColors: Record<StatutReclamation, string> = {
  nouvelle: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  en_cours: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  resolue:  "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  fermee:   "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400",
};

export const statutLabels: Record<StatutReclamation, string> = {
  nouvelle: "Nouvelle",
  en_cours: "En cours",
  resolue:  "Résolue",
  fermee:   "Fermée",
};

export const prioriteColors: Record<Priorite, string> = {
  faible:  "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400",
  moyenne: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  haute:   "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  urgente: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

export const prioriteBar: Record<Priorite, string> = {
  faible:  "bg-gray-300",
  moyenne: "bg-blue-400",
  haute:   "bg-orange-400",
  urgente: "bg-red-500",
};

export const prioriteAgendaCouleur: Record<Priorite, string> = {
  faible:  "bg-gray-400",
  moyenne: "bg-blue-500",
  haute:   "bg-orange-500",
  urgente: "bg-red-500",
};

export const JOURS_FR = ["Dimanche","Lundi","Mardi","Mercredi","Jeudi","Vendredi","Samedi"];
export const MOIS_FR  = ["Jan","Fév","Mar","Avr","Mai","Juin","Juil","Août","Sep","Oct","Nov","Déc"];