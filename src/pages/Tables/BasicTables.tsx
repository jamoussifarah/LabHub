import { useState, useEffect } from "react";
import PageMeta from "../../components/common/PageMeta";
import { complaintService } from "../../Services/complaintService";
import { userService } from "../../Services/userService";
import type { Complaint } from "../../Models/Complaint";
import type { User } from "../../Models/user";

// Helpers
const getMachineName = (machine: any): string => {
  if (!machine) return "-";
  if (typeof machine === "object") return machine.name || "-";
  if (typeof machine === "string") {
    try { return JSON.parse(machine).name || "-"; }
    catch { return machine; }
  }
  return "-";
};

const getFullImageUrl = (url?: string): string | null => {
  if (!url) return null;
  if (url.startsWith("http")) return url;
  const base = import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:8087";
  return `${base}${url}`;
};

const translatePriority = (p: string) => {
  if (p === "HIGH" || p === "CRITICAL") return "Élevée";
  if (p === "MEDIUM") return "Moyenne";
  return "Basse";
};

const translateStatus = (s: string) => {
  if (s === "OPEN") return "En attente";
  if (s === "IN_PROGRESS" || s === "En cours") return "En cours";
  if (s === "RESOLVED") return "Résolu";
  return "Fermé";
};

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

export default function Reclamations() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [techniciens, setTechniciens] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [statutFilter, setStatutFilter] = useState("Tous les statuts");
  const [selectedRec, setSelectedRec] = useState<Complaint | null>(null);
  const [assignModal, setAssignModal] = useState<Complaint | null>(null);
  const [selectedTechId, setSelectedTechId] = useState<string>("");
  const [selectedTechName, setSelectedTechName] = useState<string>("");
  const [assigning, setAssigning] = useState(false);

  // Chargement des réclamations
  const fetchReclamations = async () => {
    try {
      const response = await complaintService.getAll();
      const data = Array.isArray(response) ? response : (response as any)?.data;
      if (!Array.isArray(data)) {
        console.error("Format API invalide:", response);
        return;
      }
      setComplaints(data);
    } catch (err) {
      console.error("Erreur fetch réclamations:", err);
    }
  };

  useEffect(() => { fetchReclamations(); }, []);

  // Chargement des techniciens
  useEffect(() => {
    const fetchTechniciens = async () => {
      try {
        const data = await userService.getTechnicians();
        setTechniciens(data);
        if (data.length > 0) {
          setSelectedTechId(data[0].id);
          setSelectedTechName(data[0].name);
        }
      } catch (err) {
        console.error("Erreur fetch techniciens:", err);
      }
    };
    fetchTechniciens();
  }, []);

  // Assignation avec fallback local
  const handleAssign = async () => {
    if (!assignModal || !selectedTechId) return;
    setAssigning(true);
    try {
      await complaintService.assignTechnician(assignModal.id, selectedTechId);
      await fetchReclamations();
      setAssignModal(null);
    } catch (err) {
      console.error("Erreur assignation:", err);
      if (selectedTechName) {
        setComplaints(prev =>
          prev.map(c =>
            c.id === assignModal.id
              ? {
                  ...c,
                  status: "IN_PROGRESS" as any,
                  technicien: { name: selectedTechName } as any,
                }
              : c
          )
        );
      }
      setAssignModal(null);
      alert("Assignation effectuée localement (backend non disponible)");
    } finally {
      setAssigning(false);
    }
  };

  // Filtrage
  const filtered = complaints.filter(c => {
    const matchSearch =
      c.subject?.toLowerCase().includes(search.toLowerCase()) ||
      getMachineName(c.machine).toLowerCase().includes(search.toLowerCase()) ||
      c.userName?.toLowerCase().includes(search.toLowerCase());
    const statutFr = translateStatus(c.status);
    const matchStatut = statutFilter === "Tous les statuts" || statutFr === statutFilter;
    return matchSearch && matchStatut;
  });

  return (
    <>
      <PageMeta title="Gestion des réclamations | Admin Dashboard" description="Page de gestion des réclamations" />
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Gestion des réclamations</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{filtered.length} réclamation(s) trouvée(s)</p>
      </div>

      {/* Barre de recherche + filtre */}
      <div className="flex items-center gap-3 mb-5">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
          <input type="text" placeholder="Rechercher par sujet, machine ou étudiant..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-9 pr-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 dark:text-white" />
        </div>
        <select value={statutFilter} onChange={e => setStatutFilter(e.target.value)} className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300">
          <option>Tous les statuts</option>
          <option>En attente</option>
          <option>En cours</option>
          <option>Résolu</option>
        </select>
      </div>

      {/* Tableau */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                {["SUJET","MACHINE","TYPE","ÉTUDIANT","DATE","PRIORITÉ","STATUT","PHOTO","TECHNICIEN","ACTIONS"].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={10} className="text-center py-10 text-gray-400 text-sm">Aucune réclamation trouvée</td></tr>
              ) : filtered.map(c => {
                const priorite = translatePriority(c.priority);
                const statut = translateStatus(c.status);
                return (
                  <tr key={c.id} className="border-b border-gray-50 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                    <td className="px-4 py-3"><button onClick={() => setSelectedRec(c)} className="text-blue-600 font-medium hover:underline">{c.subject || "Sans sujet"}</button></td>
                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{getMachineName(c.machine)}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{c.category || "-"}</td>
                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300 whitespace-nowrap">{c.userName || c.user?.name || "-"}</td>
                    <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">{new Date(c.createdAt).toLocaleDateString("fr-FR")}</td>
                    <td className="px-4 py-3"><span className={prioriteColor[priorite]}>{priorite}</span></td>
                    <td className="px-4 py-3"><span className={`px-2 py-1 rounded-full text-xs font-medium ${statutStyle[statut]}`}>{statut}</span></td>
                    
                    {/* ✅ Cellule PHOTO corrigée avec fallback sur erreur */}
                    <td className="px-4 py-3">
                      {c.imageUrl ? (
                        <img
                          src={c.imageUrl.startsWith('http') ? c.imageUrl : `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:8087'}${c.imageUrl}`}
                          alt="photo"
                          className="w-10 h-10 rounded-lg object-cover cursor-pointer border border-gray-200 hover:scale-110 transition-transform"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="%239ca3af" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"%3E%3Crect x="2" y="2" width="20" height="20" rx="2" ry="2"%3E%3C/rect%3E%3Ccircle cx="8.5" cy="8.5" r="2.5"%3E%3C/circle%3E%3Cpath d="M21 15l-5-5-6 6-3-3-4 4"%3E%3C/path%3E%3C/svg%3E';
                          }}
                          onClick={() => setSelectedRec(c)}
                        />
                      ) : (
                        <span className="text-gray-300 text-xs">–</span>
                      )}
                    </td>
                    
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{(c as any).technicien?.name ?? "–"}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => setSelectedRec(c)} className="text-gray-400 hover:text-blue-600 transition-colors" title="Voir détails">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                        </button>
                        {statut === "En attente" && (
                          <button onClick={() => { setAssignModal(c); if (techniciens.length) { setSelectedTechId(techniciens[0].id); setSelectedTechName(techniciens[0].name); } }} className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1.5 rounded-lg">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                            Assigner
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal détails */}
      {selectedRec && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[1000] p-4" onClick={() => setSelectedRec(null)}>
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md max-h-[80vh] flex flex-col relative overflow-hidden border border-gray-100 dark:border-gray-800">
            <button onClick={() => setSelectedRec(null)} className="absolute top-3 right-3 z-50 p-2 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg transition-transform hover:scale-110">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
            <div className="overflow-y-auto p-6">
              <div className="mb-4">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white leading-tight">Détails Réclamation</h2>
                <span className="text-[10px] font-mono text-gray-400 block mt-1 uppercase">Réf: {selectedRec.id.slice(0, 18)}...</span>
              </div>
              {selectedRec.imageUrl && (
                <div className="mb-5 rounded-xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-700">
                  <img src={selectedRec.imageUrl.startsWith('http') ? selectedRec.imageUrl : `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:8087'}${selectedRec.imageUrl}`} alt="Preuve" className="w-full h-44 object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                </div>
              )}
              <div className="grid grid-cols-2 gap-3 mb-6">
                {[
                  { label: "Machine", value: getMachineName(selectedRec.machine) },
                  { label: "Priorité", value: translatePriority(selectedRec.priority) },
                  { label: "Étudiant", value: selectedRec.userName || selectedRec.user?.name || "-" },
                  { label: "Statut", value: translateStatus(selectedRec.status) },
                ].map(item => (
                  <div key={item.label} className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg">
                    <p className="text-[10px] text-gray-400 uppercase font-bold">{item.label}</p>
                    <p className="text-sm font-semibold dark:text-gray-200 truncate">{item.value}</p>
                  </div>
                ))}
              </div>
              <div className="space-y-4">
                <div className="border-l-4 border-blue-500 pl-3">
                  <p className="text-[10px] text-gray-400 uppercase font-bold">Sujet</p>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{selectedRec.subject || "Aucun sujet"}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800/80 p-3 rounded-lg">
                  <p className="text-[10px] text-gray-400 uppercase font-bold mb-1">Description</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed italic">{selectedRec.description || "Aucune description"}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal assignation */}
      {assignModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setAssignModal(null)}>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-[400px] p-6 relative mx-4">
            <button onClick={() => setAssignModal(null)} 
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
            <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-1">Assigner un technicien</h2>
            <p className="text-sm text-gray-400 mb-5 truncate">Réclamation : {assignModal.subject || assignModal.id}</p>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Sélectionner un technicien</label>
            <select value={selectedTechId} onChange=
            {e => { const tid = e.target.value; setSelectedTechId(tid); const tech = techniciens.find(t => t.id === tid); if (tech) setSelectedTechName(tech.name); }} 
            className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 dark:text-white mb-6">
              {techniciens.map(t => <option key={t.id} value={t.id}>{t.name} - {t.department}</option>)}
            </select>
            <div className="flex justify-end gap-2">
              <button onClick={() => setAssignModal(null)}
               className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:
               bg-gray-100 dark:hover:bg-gray-700">Annuler</button>
              <button onClick={handleAssign} disabled={assigning}
               className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 flex items-center gap-2">
                {assigning && <svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>}
                {assigning ? "Assignation..." : "Confirmer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}