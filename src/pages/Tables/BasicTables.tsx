
import { useState } from "react";
import PageMeta from "../../components/common/PageMeta";

interface Reclamation {
  id: string;
  machine: string;
  type: string;
  etudiant: string;
  date: string;
  priorite: "Élevée" | "Moyenne" | "Basse";
  statut: "En attente" | "En cours" | "Résolu";
  technicien: string | null;
  laboratoire?: string;
  description?: string;
  photoUrl?: string | null; // ← corrigé
}

const reclamationsData: Reclamation[] = [
  {
    id: "REC-2024-001",
    machine: "PC-A101",
    type: "Machine cassée",
    etudiant: "Mohamed Ben Ali",
    date: "2026-02-23 14:30",
    priorite: "Élevée",
    statut: "En attente",
    technicien: null,
    laboratoire: "Labo Info 1",
    description: "L'ordinateur ne démarre plus. Écran noir au démarrage.",
    photoUrl: "https://placehold.co/400x300?text=Photo+Machine",
  },
  {
    id: "REC-2024-002",
    machine: "OSC-B205",
    type: "Problème réseau",
    etudiant: "Fatma Trabelsi",
    date: "2026-02-23 13:18",
    priorite: "Moyenne",
    statut: "En cours",
    technicien: "Ahmed Khaled",
    laboratoire: "Labo Réseau",
    description: "Connexion internet instable.",
    photoUrl: null,
  },
  {
    id: "REC-2024-003",
    machine: "IMP3D-A103",
    type: "Logiciel défectueux",
    etudiant: "Youssef Mansour",
    date: "2026-02-23 11:45",
    priorite: "Basse",
    statut: "En attente",
    technicien: null,
    laboratoire: "Labo Info 2",
    description: "Le logiciel de simulation plante au démarrage.",
    photoUrl: "https://placehold.co/400x300?text=Photo+Logiciel",
  },
  {
    id: "REC-2024-004",
    machine: "RTR-C301",
    type: "Panne de courant",
    etudiant: "Amira Jebali",
    date: "2026-02-23 10:20",
    priorite: "Élevée",
    statut: "En cours",
    technicien: "Karim Sassi",
    laboratoire: "Labo Électro",
    description: "Disjoncteur déclenché dans la salle.",
    photoUrl: null,
  },
  {
    id: "REC-2024-005",
    machine: "PC-A105",
    type: "Machine cassée",
    etudiant: "Sara Ben Salem",
    date: "2026-02-22 16:45",
    priorite: "Moyenne",
    statut: "En attente",
    technicien: null,
    laboratoire: "Labo Info 1",
    description: "Clavier défaillant.",
    photoUrl: "https://placehold.co/400x300?text=Photo+Clavier",
  },
  {
    id: "REC-2024-006",
    machine: "MC-B102",
    type: "Équipement manquant",
    etudiant: "Khalil Jebari",
    date: "2026-02-22 09:30",
    priorite: "Basse",
    statut: "Résolu",
    technicien: "Ahmed Khaled",
    laboratoire: "Labo Mécanique",
    description: "Outil manquant dans la salle.",
    photoUrl: null,
  },
];

const techniciensDisponibles = [
  "Ahmed Khaled - Informatique",
  "Karim Sassi - Réseau",
  "Sami Haddad - Électronique",
  "Leila Mansour - Logiciel",
];

const prioriteColor: Record<string, string> = {
  Élevée: "text-red-500 font-semibold",
  Moyenne: "text-yellow-500 font-semibold",
  Basse: "text-green-600 font-semibold",
};

const statutStyle: Record<string, string> = {
  "En attente": "bg-blue-100 text-blue-700",
  "En cours": "bg-green-100 text-green-700",
  Résolu: "bg-gray-100 text-gray-600",
};
// Mapper statuts backend → frontend
const statutMapping: Record<string, string> = {
  "OPEN": "En attente",
  "IN_PROGRESS": "En cours",
  "RESOLVED": "Résolu",
  "CLOSED": "Fermé"
}

export default function Reclamations() {
  const [reclamations, setReclamations] = useState<Reclamation[]>(reclamationsData);
  const [search, setSearch] = useState("");
  const [statutFilter, setStatutFilter] = useState("Tous les statuts");
  const [selectedRec, setSelectedRec] = useState<Reclamation | null>(null);
  const [assignModal, setAssignModal] = useState<Reclamation | null>(null);
  const [selectedTech, setSelectedTech] = useState(techniciensDisponibles[0]);

  const filtered = reclamations.filter((r) => {
    const matchSearch =
      r.id.toLowerCase().includes(search.toLowerCase()) ||
      r.machine.toLowerCase().includes(search.toLowerCase()) ||
      r.etudiant.toLowerCase().includes(search.toLowerCase());
    const matchStatut =
      statutFilter === "Tous les statuts" || r.statut === statutFilter;
    return matchSearch && matchStatut;
  });

  const handleConfirmAssign = () => {
    if (!assignModal) return;
    const techName = selectedTech.split(" - ")[0];
    setReclamations((prev) =>
      prev.map((r) =>
        r.id === assignModal.id
          ? { ...r, technicien: techName, statut: "En cours" }
          : r
      )
    );
    setAssignModal(null);
  };

  return (
    <>
      <PageMeta
        title="Gestion des réclamations | Admin Dashboard"
        description="Page de gestion des réclamations"
      />

      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
          Gestion des réclamations
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {filtered.length} réclamation(s) trouvée(s)
        </p>
      </div>

      <div className="flex items-center gap-3 mb-5">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Rechercher par ID, machine ou étudiant..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 dark:text-white"
          />
        </div>
        <select
          value={statutFilter}
          onChange={(e) => setStatutFilter(e.target.value)}
          className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300"
        >
          <option>Tous les statuts</option>
          <option>En attente</option>
          <option>En cours</option>
          <option>Résolu</option>
        </select>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                {["ID", "MACHINE", "TYPE", "ÉTUDIANT", "DATE", "PRIORITÉ", "STATUT", "PHOTO", "TECHNICIEN", "ACTIONS"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id} className="border-b border-gray-50 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                  <td className="px-4 py-3">
                    <button onClick={() => setSelectedRec(r)} className="text-blue-600 font-medium hover:underline">
                      {r.id}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{r.machine}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{r.type}</td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300 whitespace-nowrap">{r.etudiant}</td>
                  <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">{r.date}</td>
                  <td className="px-4 py-3">
                    <span className={prioriteColor[r.priorite]}>{r.priorite}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statutStyle[r.statut]}`}>
                      {r.statut}
                    </span>
                  </td>

                  {/* ← COLONNE PHOTO AJOUTÉE */}
                  <td className="px-4 py-3">
                    {r.photoUrl ? (
                      <img
                        src={r.photoUrl}
                        alt="photo"
                        className="w-10 h-10 rounded-lg object-cover cursor-pointer border border-gray-200 hover:scale-110 transition-transform"
                        onClick={() => setSelectedRec(r)}
                      />
                    ) : (
                      <span className="text-gray-300 text-xs">–</span>
                    )}
                  </td>

                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{r.technicien ?? "–"}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => setSelectedRec(r)} className="text-gray-400 hover:text-blue-600 transition-colors" title="Voir détails">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                      {r.statut === "En attente" && (
                        <button
                          onClick={() => { setAssignModal(r); setSelectedTech(techniciensDisponibles[0]); }}
                          className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          Assigner
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal — avec photo */}
      {selectedRec && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-[500px] p-6 relative mx-4">
            <button onClick={() => setSelectedRec(null)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-1">Détails de la réclamation</h2>
            <p className="text-sm text-gray-400 mb-5">{selectedRec.id}</p>

            {/* ← PHOTO DANS MODAL */}
            {selectedRec.photoUrl && (
              <div className="mb-4">
                <p className="text-xs text-gray-400 mb-2">Photo du problème</p>
                <img
                  src={selectedRec.photoUrl}
                  alt="photo problème"
                  className="w-full h-48 object-cover rounded-lg border border-gray-200 dark:border-gray-600"
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 mb-4">
              {[
                { label: "Machine", value: selectedRec.machine },
                { label: "Type", value: selectedRec.type },
                { label: "Étudiant", value: selectedRec.etudiant },
                { label: "Laboratoire", value: selectedRec.laboratoire ?? "–" },
                { label: "Date", value: selectedRec.date },
                { label: "Technicien assigné", value: selectedRec.technicien ?? "Non assigné" },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-xs text-gray-400 mb-1">{label}</p>
                  <p className="text-sm font-medium text-gray-800 dark:text-white">{value}</p>
                </div>
              ))}
            </div>

            <div>
              <p className="text-xs text-gray-400 mb-1">Description</p>
              <p className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                {selectedRec.description}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Assign Modal */}
      {assignModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-[400px] p-6 relative mx-4">
            <button onClick={() => setAssignModal(null)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-1">Assigner un technicien</h2>
            <p className="text-sm text-gray-400 mb-5">Réclamation: {assignModal.id}</p>

            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Sélectionner un technicien
            </label>
            <select
              value={selectedTech}
              onChange={(e) => setSelectedTech(e.target.value)}
              className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 dark:text-white mb-6"
            >
              {techniciensDisponibles.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>

            <div className="flex justify-end gap-3">
              <button onClick={() => setAssignModal(null)} className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                Annuler
              </button>
              <button onClick={handleConfirmAssign} className="px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}