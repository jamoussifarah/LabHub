import type { Complaint }                    from "../../Models/Complaint";
import type { Reclamation, AgendaItem, Priorite, StatutReclamation } from "./types";
import { JOURS_FR, MOIS_FR, prioriteAgendaCouleur }                 from "./constants";

export const mapPriorite = (p: string): Priorite => {
  const v = (p ?? "").toLowerCase();
  if (v === "low"    || v === "faible")                       return "faible";
  if (v === "medium" || v === "moyenne")                      return "moyenne";
  if (v === "high"   || v === "haute")                        return "haute";
  if (v === "urgent" || v === "urgente" || v === "critical")  return "urgente";
  return "moyenne";
};

export const mapStatut = (s: string): StatutReclamation => {
  const map: Record<string, StatutReclamation> = {
    OPEN:        "nouvelle",
    IN_PROGRESS: "en_cours",
    RESOLVED:    "resolue",
    CLOSED:      "fermee",
    "En cours":  "en_cours",
  };
  return map[s] ?? "nouvelle";
};

export const mapComplaint = (c: Complaint): Reclamation => {
  const dateRaw = c.createdAt ? new Date(c.createdAt) : null;
  const base    = import.meta.env.VITE_API_URL?.replace("/api", "") ?? "";
  return {
    id:           c.id,
    numero:       c.id.slice(-6).toUpperCase(),
    titre:        c.subject        ?? "Sans titre",
    description:  c.description    ?? "",
    client:       c.userName       ?? "—",
    dateCreation: dateRaw
      ? dateRaw.toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" })
      : "—",
    dateRaw,
    categorie:   c.category        ?? "—",
    priorite:    mapPriorite(c.priority  ?? ""),
    statut:      mapStatut(c.status      ?? ""),
    technicienAssigneId:  null,
    technicienAssigneNom: null,
    labId:    c.labId   ?? undefined,
    labName:  c.labName ?? undefined,
    machine:  c.machine
      ? (typeof c.machine === "object" ? (c.machine as any).name : c.machine)
      : undefined,
    photoUrl: c.imageUrl
      ? (c.imageUrl.startsWith("http") ? c.imageUrl : `${base}${c.imageUrl}`)
      : null,
    resolution: c.resolution ?? undefined,
  };
};

export const buildAgenda = (reclamations: Reclamation[]): AgendaItem[] =>
  reclamations
    .filter((r) => r.statut !== "fermee")
    .map((r) => {
      const date = r.dateRaw ?? new Date();
      return {
        id:        r.id,
        reclamation: r,
        jourLabel: JOURS_FR[date.getDay()],
        dateLabel: `${date.getDate().toString().padStart(2, "0")} ${MOIS_FR[date.getMonth()]} ${date.getFullYear()}`,
        heure:     `${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`,
        titre:     r.titre,
        lieu:      r.labName ?? r.machine ?? "Laboratoire",
        couleur:   prioriteAgendaCouleur[r.priorite],
        dateRaw:   date,
      };
    })
    .sort((a, b) => a.dateRaw.getTime() - b.dateRaw.getTime());