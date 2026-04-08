export type StatutReclamation = "nouvelle" | "en_cours" | "resolue" | "fermee";
export type Priorite = "faible" | "moyenne" | "haute" | "urgente";

export interface Reclamation {
  id: string;                        // ← string (MongoDB)
  numero: string;
  titre: string;
  description: string;
  client: string;
  dateCreation: string;
  statut: StatutReclamation;
  priorite: Priorite;
  technicienAssigneId: string | null; // ← string (MongoDB)
  technicienAssigneNom: string | null;
  categorie: string;
  photoUrl?: string | null;           // ← AJOUTER pour les photos
  resolution?: string;                // ← AJOUTER pour la résolution
  labName?: string;                   // ← AJOUTER
  machine?: string;                   // ← AJOUTER
}

export interface Technicien {
  id: string;    // ← string (MongoDB)
  name: string;
  email: string;
  specialite: string;
  tachesEnCours: number;
}

// données mock gardées pour test
export const TECHNICIENS: Technicien[] = [
  { id: "2", name: "Mohamed Trabelsi", email: "tech@reclamation.tn", specialite: "Réseau",    tachesEnCours: 3 },
  { id: "3", name: "Sami Bouazizi",    email: "sami@reclamation.tn",  specialite: "Matériel", tachesEnCours: 2 },
];

export const RECLAMATIONS: Reclamation[] = [
  {
    id: "1", numero: "REC-001",
    titre: "Panne internet bureau 3",
    description: "Connexion internet totalement coupée au bureau 3 depuis ce matin.",
    client: "Société Alpha SARL",
    dateCreation: "2025-04-01",
    statut: "en_cours", priorite: "haute",
    technicienAssigneId: "2", technicienAssigneNom: "Mohamed Trabelsi",
    categorie: "Réseau",
  },
  {
    id: "2", numero: "REC-002",
    titre: "Imprimante ne fonctionne pas",
    description: "L'imprimante HP du département RH affiche une erreur papier en permanence.",
    client: "Cabinet Juridique Nour",
    dateCreation: "2025-04-02",
    statut: "nouvelle", priorite: "moyenne",
    technicienAssigneId: null, technicienAssigneNom: null,
    categorie: "Matériel",
  },
  {
    id: "3", numero: "REC-003",
    titre: "Écran noir sur PC direction",
    description: "Le PC du directeur général ne démarre plus, écran noir au démarrage.",
    client: "Groupe Invest TN",
    dateCreation: "2025-03-30",
    statut: "resolue", priorite: "urgente",
    technicienAssigneId: "3", technicienAssigneNom: "Sami Bouazizi",
    categorie: "Matériel",
  },
  {
    id: "4", numero: "REC-004",
    titre: "Lenteur du serveur",
    description: "Le serveur de fichiers est extrêmement lent depuis la mise à jour.",
    client: "MedTech Solutions",
    dateCreation: "2025-04-01",
    statut: "en_cours", priorite: "haute",
    technicienAssigneId: "2", technicienAssigneNom: "Mohamed Trabelsi",
    categorie: "Réseau",
  },
  {
    id: "5", numero: "REC-005",
    titre: "Clavier endommagé",
    description: "Plusieurs touches du clavier ne répondent plus.",
    client: "Agence Créative Pixel",
    dateCreation: "2025-04-03",
    statut: "nouvelle", priorite: "faible",
    technicienAssigneId: null, technicienAssigneNom: null,
    categorie: "Matériel",
  },
  {
    id: "6", numero: "REC-006",
    titre: "WiFi instable salle de réunion",
    description: "Le réseau WiFi se déconnecte toutes les 10 minutes en salle de réunion.",
    client: "BTP Constructions",
    dateCreation: "2025-03-28",
    statut: "en_cours", priorite: "moyenne",
    technicienAssigneId: "3", technicienAssigneNom: "Sami Bouazizi",
    categorie: "Réseau",
  },
];