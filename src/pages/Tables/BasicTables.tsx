import { useState, useEffect } from "react";
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
  subject?: string;
  photoUrl?: string | null;
}

interface Technicien {
  id: string;
  name: string;
  department: string;
}

export default function Reclamations() {
  const [reclamations, setReclamations] = useState<Reclamation[]>([]);
  const [techniciens, setTechniciens] = useState<Technicien[]>([]);
  const [search, setSearch] = useState("");
  const [statutFilter, setStatutFilter] = useState("Tous les statuts");
  const [selectedRec, setSelectedRec] = useState<Reclamation | null>(null);
  const [assignModal, setAssignModal] = useState<Reclamation | null>(null);
  const [selectedTech, setSelectedTech] = useState<string>("");

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

  // ── Fetch réclamations
  useEffect(() => {
    const fetchReclamations = async () => {
      try {
        const res = await fetch("http://localhost:8087/api/complaints");
        const data = await res.json();

        const mapped: Reclamation[] = data.map((c: any) => ({
          id: c.id,
          machine: c.machine?.name || "-",
          type: c.category || "-",
          etudiant: c.userName || "-",
          date: c.createdAt,
          priorite:
            c.priority === "HIGH"
              ? "Élevée"
              : c.priority === "MEDIUM"
              ? "Moyenne"
              : "Basse",
          statut:
            c.status === "OPEN"
              ? "En attente"
              : c.status === "IN_PROGRESS"
              ? "En cours"
              : "Résolu",
          technicien: c.technicienName || null,
          laboratoire: c.labName,
          description: c.description,
          subject: c.subject,
          photoUrl: c.imageUrl 
        ? (c.imageUrl.startsWith("http") 
        ? c.imageUrl 
        : `http://localhost:8087${c.imageUrl}`)
    : null,
        }));

        setReclamations(mapped);
      } catch (err) {
        console.error("Erreur fetch réclamations:", err);
      }
    };
    fetchReclamations();
  }, []);

  // ── Fetch techniciens
  useEffect(() => {
    const fetchTechniciens = async () => {
      try {
        const res = await fetch("http://localhost:8087/api/auth/techniciens");
        const data: Technicien[] = await res.json();
        setTechniciens(data);
        if (data.length > 0)
          setSelectedTech(`${data[0].name} - ${data[0].department}`);
      } catch (err) {
        console.error("Erreur fetch techniciens:", err);
      }
    };
    fetchTechniciens();
  }, []);

  // ── Filtrage
  const filtered = reclamations.filter((r) => {
    const matchSearch =
      (r.id?.toLowerCase() || "").includes(search.toLowerCase()) ||
      (r.machine?.toLowerCase() || "").includes(search.toLowerCase()) ||
      (r.etudiant?.toLowerCase() || "").includes(search.toLowerCase());

    const matchStatut =
      statutFilter === "Tous les statuts" || r.statut === statutFilter;

    return matchSearch && matchStatut;
  });

  // ── Assignation d’un technicien
  const handleConfirmAssign = async () => {
    if (!assignModal) return;

    const selected = techniciens.find(
      (t) => `${t.name} - ${t.department}` === selectedTech
    );

    try {
      const res = await fetch(
        `http://localhost:8087/api/complaints/${assignModal.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            technicienId: selected?.id,
            technicienName: selected?.name,
            status: "IN_PROGRESS",
          }),
        }
      );

      const updated = await res.json();

      setReclamations((prev) =>
        prev.map((r) =>
          r.id === updated.id
            ? {
                ...r,
                technicien: updated.technicienName,
                statut: "En cours",
              }
            : r
        )
      );

      setAssignModal(null);
    } catch (err) {
      console.error("Erreur assignation:", err);
    }
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
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
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
                {[
                  "ID",
                  "MACHINE",
                  "TYPE",
                  "ÉTUDIANT",
                  "DATE",
                  "PRIORITÉ",
                  "STATUT",
                  "PHOTO",
                  "TECHNICIEN",
                  "ACTIONS",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr
                  key={r.id}
                  className="border-b border-gray-50 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
                >
                  <td className="px-4 py-3">
                    <button
                      onClick={() => setSelectedRec(r)}
                      className="text-blue-600 font-medium hover:underline"
                    >
                      {r.id}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                    {r.machine}
                  </td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                    {r.type}
                  </td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300 whitespace-nowrap">
                    {r.etudiant}
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">
                    {r.date}
                  </td>
                  <td className="px-4 py-3">
                    <span className={prioriteColor[r.priorite]}>
                      {r.priorite}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${statutStyle[r.statut]}`}
                    >
                      {r.statut}
                    </span>
                  </td>
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
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                    {r.technicien ?? "–"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedRec(r)}
                        className="text-gray-400 hover:text-blue-600 transition-colors"
                        title="Voir détails"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                      </button>
                      {r.statut === "En attente" && (
                        <button
                          onClick={() => {
                            setAssignModal(r);
                            if (techniciens.length > 0)
                              setSelectedTech(
                                `${techniciens[0].name} - ${techniciens[0].department}`
                              );
                          }}
                          className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap"
                        >
                          <svg
                            className="w-3 h-3"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                            />
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

      {/* ── Modal détails */}
      {/* ── Modal détails : Taille réduite & Pas de flou */}
{selectedRec && (
  <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[1000] p-4 animate-fadeIn">
    {/* Fenêtre avec hauteur max (80% de l'écran) et défilement interne */}
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md max-h-[80vh] flex flex-col relative overflow-hidden border border-gray-100 dark:border-gray-800">
      
      {/* Bouton Quitter : Très visible et fixe */}
      <button
        onClick={() => setSelectedRec(null)}
        className="absolute top-3 right-3 z-50 p-2 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg transition-transform hover:scale-110"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Zone de contenu scrollable */}
      <div className="overflow-y-auto p-6">
        <div className="mb-4">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white leading-tight">
            Détails Réclamation
          </h2>
          <span className="text-[10px] font-mono text-gray-400 block mt-1 uppercase">
            Réf: {selectedRec.id.slice(0, 18)}...
          </span>
        </div>

        {selectedRec.photoUrl && (
          <div className="mb-5 rounded-xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-700">
            <img
              src={selectedRec.photoUrl}
              alt="Preuve"
              className="w-full h-44 object-cover"
            />
          </div>
        )}

        {/* Informations en grille compacte */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {[
            { label: "Machine", value: selectedRec.machine },
            { label: "Priorité", value: selectedRec.priorite },
            { label: "Étudiant", value: selectedRec.etudiant },
            { label: "Statut", value: selectedRec.statut },
          ].map((item) => (
            <div key={item.label} className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg">
              <p className="text-[10px] text-gray-400 uppercase font-bold">{item.label}</p>
              <p className="text-sm font-semibold dark:text-gray-200 truncate">{item.value}</p>
            </div>
          ))}
        </div>

        {/* Sujet et Description */}
        <div className="space-y-4">
          <div className="border-l-4 border-blue-500 pl-3">
            <p className="text-[10px] text-gray-400 uppercase font-bold">Sujet</p>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {selectedRec.subject || "Aucun sujet"}
            </p>
          </div>

          <div className="bg-gray-50 dark:bg-gray-800/80 p-3 rounded-lg">
            <p className="text-[10px] text-gray-400 uppercase font-bold mb-1">Description</p>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed italic">
              {selectedRec.description}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
)}

      {/* ── Modal assignation */}
      {assignModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-[400px] p-6 relative mx-4">
            <button
              onClick={() => setAssignModal(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-1">
              Assigner un technicien
            </h2>
            <p className="text-sm text-gray-400 mb-5">
              Réclamation: {assignModal.id}
            </p>

            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Sélectionner un technicien
            </label>
            <select
              value={selectedTech}
              onChange={(e) => setSelectedTech(e.target.value)}
              className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 dark:text-white mb-6"
            >
              {techniciens.map((t) => (
                <option key={t.id} value={`${t.name} - ${t.department}`}>
                  {t.name} - {t.department}
                </option>
              ))}
            </select>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setAssignModal(null)}
                className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleConfirmAssign}
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors"
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}