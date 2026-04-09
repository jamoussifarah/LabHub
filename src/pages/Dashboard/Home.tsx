import { useState, useEffect } from "react";
import PageMeta from "../../components/common/PageMeta";

// ─── Types ────────────────────────────────────────────────────────────────────
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
  numero?: string;
}

interface Technicien {
  id: string;
  name: string;
  email?: string;
  department: string;
  specialite?: string;
}

// ─── Couleurs ─────────────────────────────────────────────────────────────────
const statutStyle: Record<string, string> = {
  "En attente": "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  "En cours":   "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  "Résolu":     "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
};

const prioriteColor: Record<string, string> = {
  Élevée: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
  Moyenne: "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400",
  Basse: "bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400",
};

const prioriteBar: Record<string, string> = {
  Élevée: "bg-red-500",
  Moyenne: "bg-orange-400",
  Basse: "bg-gray-300",
};

// ─── Icônes ───────────────────────────────────────────────────────────────────
const IconClipboard = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
  </svg>
);
const IconClock = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
  </svg>
);
const IconCheck = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
  </svg>
);
const IconAlert = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
  </svg>
);
const IconTool = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
  </svg>
);

// ─── Composant principal ──────────────────────────────────────────────────────
export default function Home() {
  const [reclamations, setReclamations] = useState<Reclamation[]>([]);
  const [techniciens, setTechniciens]   = useState<Technicien[]>([]);
  const [loading, setLoading]           = useState(true);
  const [selectedRec, setSelectedRec]   = useState<Reclamation | null>(null);

  // ── Fetch réclamations (même logique que Reclamations.tsx)
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [recRes, techRes] = await Promise.all([
          fetch("http://localhost:8087/api/complaints"),
          fetch("http://localhost:8087/api/auth/techniciens"),
        ]);

        const recData  = await recRes.json();
        const techData: Technicien[] = await techRes.json();

        const mapped: Reclamation[] = recData.map((c: any) => ({
          id:          c.id,
          numero:      c.id?.slice(0, 8)?.toUpperCase() ?? "-",
          machine:     c.machine?.name || "-",
          type:        c.category || "-",
          etudiant:    c.userName || "-",
          date:        c.createdAt,
          priorite:
            c.priority === "HIGH"   ? "Élevée"  :
            c.priority === "MEDIUM" ? "Moyenne" : "Basse",
          statut:
            c.status === "OPEN"        ? "En attente" :
            c.status === "IN_PROGRESS" ? "En cours"   : "Résolu",
          technicien:  c.technicienName || null,
          laboratoire: c.labName,
          description: c.description,
          subject:     c.subject,
          photoUrl:    c.imageUrl
            ? (c.imageUrl.startsWith("http") ? c.imageUrl : `http://localhost:8087${c.imageUrl}`)
            : null,
        }));

        setReclamations(mapped);
        setTechniciens(techData);
      } catch (err) {
        console.error("Erreur fetch données:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  // ── Stats calculées depuis les données réelles
  const stats = {
    total:        reclamations.length,
    enAttente:    reclamations.filter((r) => r.statut === "En attente").length,
    enCours:      reclamations.filter((r) => r.statut === "En cours").length,
    resolues:     reclamations.filter((r) => r.statut === "Résolu").length,
    urgentes:     reclamations.filter((r) => r.priorite === "Élevée").length,
    nonAssignees: reclamations.filter((r) => !r.technicien).length,
  };

  const tauxResolution = stats.total > 0
    ? Math.round((stats.resolues / stats.total) * 100)
    : 0;

  // Répartition par catégorie
  const categories = reclamations.reduce<Record<string, number>>((acc, r) => {
    if (r.type) acc[r.type] = (acc[r.type] || 0) + 1;
    return acc;
  }, {});
  const categoriesArr = Object.entries(categories).sort((a, b) => b[1] - a[1]);

  // ─── Rendu ────────────────────────────────────────────────────────────────
  return (
    <>
      <PageMeta
        title="Admin Dashboard | LabHub — ENIC Carthage"
        description="Tableau de bord administrateur — Gestion des réclamations ENIC Carthage"
      />

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-brand-500 border-t-transparent" />
        </div>
      ) : (
        <div className="grid grid-cols-12 gap-4 md:gap-6">

          {/* ── Bannière ── */}
          <div className="col-span-12">
            <div className="rounded-2xl bg-gradient-to-r from-brand-500 to-blue-400 p-6 text-white shadow-md">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <p className="text-sm opacity-80">Tableau de bord</p>
                  <h2 className="text-2xl font-bold mt-0.5">Administration LabHub</h2>
                  <p className="text-sm opacity-75 mt-1">École Nationale des Ingénieurs de Carthage</p>
                </div>
                <div className="flex gap-3 flex-wrap">
                  <div className="bg-white/20 rounded-xl px-4 py-2 text-center min-w-[80px]">
                    <p className="text-2xl font-bold">{stats.total}</p>
                    <p className="text-xs opacity-80">Réclamations</p>
                  </div>
                  <div className="bg-white/20 rounded-xl px-4 py-2 text-center min-w-[80px]">
                    <p className="text-2xl font-bold">{techniciens.length}</p>
                    <p className="text-xs opacity-80">Techniciens</p>
                  </div>
                  <div className="bg-white/20 rounded-xl px-4 py-2 text-center min-w-[80px]">
                    <p className="text-2xl font-bold">{tauxResolution}%</p>
                    <p className="text-xs opacity-80">Résolution</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── Cartes stats ── */}
          {[
            {
              label: "Total réclamations",
              value: stats.total,
              icon: <IconClipboard />,
              color: "text-brand-500",
              bg: "bg-brand-50 dark:bg-brand-500/10",
              iconBg: "bg-brand-100 dark:bg-brand-500/20",
            },
            {
              label: "En cours",
              value: stats.enCours,
              icon: <IconClock />,
              color: "text-yellow-600",
              bg: "bg-yellow-50 dark:bg-yellow-500/10",
              iconBg: "bg-yellow-100 dark:bg-yellow-500/20",
            },
            {
              label: "Résolues",
              value: stats.resolues,
              icon: <IconCheck />,
              color: "text-green-600",
              bg: "bg-green-50 dark:bg-green-500/10",
              iconBg: "bg-green-100 dark:bg-green-500/20",
            },
            {
              label: "Priorité Élevée",
              value: stats.urgentes,
              icon: <IconAlert />,
              color: "text-red-600",
              bg: "bg-red-50 dark:bg-red-500/10",
              iconBg: "bg-red-100 dark:bg-red-500/20",
            },
          ].map((s) => (
            <div key={s.label} className="col-span-12 sm:col-span-6 xl:col-span-3">
              <div className={`rounded-2xl border border-gray-200 dark:border-gray-800 ${s.bg} p-5`}>
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400">{s.label}</p>
                  <div className={`${s.iconBg} ${s.color} p-2 rounded-xl`}>{s.icon}</div>
                </div>
                <p className={`text-4xl font-bold ${s.color}`}>{s.value}</p>
                <div className="mt-3 h-1.5 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                  <div
                    className={`h-1.5 rounded-full ${s.color.replace("text-", "bg-")}`}
                    style={{ width: stats.total > 0 ? `${Math.round((s.value / stats.total) * 100)}%` : "0%" }}
                  />
                </div>
                <p className="mt-1 text-xs text-gray-400">
                  {stats.total > 0 ? Math.round((s.value / stats.total) * 100) : 0}% du total
                </p>
              </div>
            </div>
          ))}

          {/* ── Tableau réclamations récentes ── */}
          <div className="col-span-12 xl:col-span-8">
            <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-white/[0.03]">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800">
                <div>
                  <h3 className="font-semibold text-gray-800 dark:text-white">Réclamations récentes</h3>
                  <p className="text-xs text-gray-400 mt-0.5">{stats.enAttente} en attente</p>
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                  stats.nonAssignees > 0
                    ? "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
                    : "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
                }`}>
                  {stats.nonAssignees > 0 ? `${stats.nonAssignees} non assignée(s)` : "Tout assigné ✓"}
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 dark:border-gray-800">
                      {["Numéro", "Machine / Type", "Priorité", "Statut", "Technicien", "Date"].map((h) => (
                        <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {reclamations.slice(0, 10).map((r) => (
                      <tr
                        key={r.id}
                        onClick={() => setSelectedRec(r)}
                        className="hover:bg-gray-50 dark:hover:bg-white/5 cursor-pointer transition-colors"
                      >
                        <td className="px-5 py-3.5 font-mono text-xs text-gray-400 whitespace-nowrap">
                          {r.id?.slice(0, 8)?.toUpperCase()}
                        </td>
                        <td className="px-5 py-3.5">
                          <p className="font-medium text-gray-800 dark:text-white truncate max-w-[180px]">{r.machine}</p>
                          <p className="text-xs text-gray-400 truncate max-w-[180px]">{r.type}</p>
                        </td>
                        <td className="px-5 py-3.5 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <div className={`h-2 w-2 rounded-full flex-shrink-0 ${prioriteBar[r.priorite]}`} />
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${prioriteColor[r.priorite]}`}>
                              {r.priorite}
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 whitespace-nowrap">
                          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statutStyle[r.statut]}`}>
                            {r.statut}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 whitespace-nowrap">
                          {r.technicien ? (
                            <div className="flex items-center gap-2">
                              <div className="h-6 w-6 rounded-full bg-gradient-to-br from-brand-400 to-blue-400 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                {r.technicien.charAt(0)}
                              </div>
                              <span className="text-xs text-gray-600 dark:text-gray-300 truncate max-w-[100px]">
                                {r.technicien.split(" ")[0]}
                              </span>
                            </div>
                          ) : (
                            <span className="text-xs text-red-400 italic">Non assigné</span>
                          )}
                        </td>
                        <td className="px-5 py-3.5 text-xs text-gray-400 whitespace-nowrap">
                          {r.date
                            ? new Date(r.date).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" })
                            : "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* ── Panneau droit ── */}
          <div className="col-span-12 xl:col-span-4 flex flex-col gap-4">

            {/* Taux de résolution */}
            <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-white/[0.03] p-6">
              <h3 className="font-semibold text-gray-800 dark:text-white mb-4">Taux de résolution</h3>
              <div className="flex items-center justify-center">
                <div className="relative w-32 h-32">
                  <svg viewBox="0 0 36 36" className="w-32 h-32 -rotate-90">
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="#E5E7EB" strokeWidth="3"/>
                    <circle
                      cx="18" cy="18" r="15.9" fill="none"
                      stroke="#465FFF" strokeWidth="3"
                      strokeDasharray={`${tauxResolution} ${100 - tauxResolution}`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold text-gray-800 dark:text-white">{tauxResolution}%</span>
                    <span className="text-xs text-gray-400">résolu</span>
                  </div>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2">
                {[
                  { label: "En attente", value: stats.enAttente, color: "bg-blue-400" },
                  { label: "En cours",   value: stats.enCours,   color: "bg-yellow-400" },
                  { label: "Résolues",   value: stats.resolues,  color: "bg-green-400" },
                  { label: "Élevée",     value: stats.urgentes,  color: "bg-red-400" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-2 rounded-lg bg-gray-50 dark:bg-white/5 px-3 py-2">
                    <div className={`h-2.5 w-2.5 rounded-full flex-shrink-0 ${item.color}`} />
                    <div>
                      <p className="text-xs text-gray-400">{item.label}</p>
                      <p className="text-sm font-semibold text-gray-800 dark:text-white">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Répartition par catégorie */}
            <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-white/[0.03] p-6">
              <h3 className="font-semibold text-gray-800 dark:text-white mb-4">Par catégorie</h3>
              <div className="space-y-3">
                {categoriesArr.length === 0 ? (
                  <p className="text-xs text-gray-400 italic">Aucune donnée</p>
                ) : (
                  categoriesArr.map(([cat, count]) => (
                    <div key={cat}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-600 dark:text-gray-300">{cat}</span>
                        <span className="font-semibold text-gray-800 dark:text-white">{count}</span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-gray-100 dark:bg-gray-800">
                        <div
                          className="h-1.5 rounded-full bg-brand-500"
                          style={{ width: `${Math.round((count / stats.total) * 100)}%` }}
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* ── Section techniciens ── */}
          <div className="col-span-12">
            <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-white/[0.03]">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800">
                <div>
                  <h3 className="font-semibold text-gray-800 dark:text-white">Techniciens</h3>
                  <p className="text-xs text-gray-400 mt-0.5">{techniciens.length} technicien(s) actifs</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
                {techniciens.map((tech) => {
                  const sesRecs  = reclamations.filter((r) => r.technicien === tech.name);
                  const resolues = sesRecs.filter((r) => r.statut === "Résolu").length;
                  const enCours  = sesRecs.filter((r) => r.statut === "En cours").length;
                  const taux     = sesRecs.length > 0 ? Math.round((resolues / sesRecs.length) * 100) : 0;

                  return (
                    <div key={tech.id} className="rounded-xl border border-gray-200 dark:border-gray-800 p-5 hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="h-11 w-11 rounded-full bg-gradient-to-br from-brand-400 to-blue-400 flex items-center justify-center font-bold text-white text-base flex-shrink-0">
                          {tech.name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-800 dark:text-white truncate">{tech.name}</p>
                          <p className="text-xs text-gray-400 truncate">{tech.email ?? tech.department}</p>
                        </div>
                      </div>

                      {(tech.specialite || tech.department) && (
                        <div className="flex items-center gap-2 mb-3">
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 dark:bg-brand-500/10 px-2.5 py-1 text-xs font-medium text-brand-500">
                            <IconTool />
                            {tech.specialite ?? tech.department}
                          </span>
                        </div>
                      )}

                      <div className="grid grid-cols-3 gap-2 mb-3">
                        {[
                          { label: "Total",    value: sesRecs.length, color: "text-gray-700 dark:text-gray-200" },
                          { label: "En cours", value: enCours,        color: "text-yellow-600" },
                          { label: "Résolues", value: resolues,       color: "text-green-600" },
                        ].map((s) => (
                          <div key={s.label} className="text-center rounded-lg bg-gray-50 dark:bg-white/5 py-2">
                            <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
                            <p className="text-xs text-gray-400">{s.label}</p>
                          </div>
                        ))}
                      </div>

                      <div>
                        <div className="flex justify-between text-xs text-gray-400 mb-1">
                          <span>Taux de résolution</span>
                          <span className="font-medium text-gray-700 dark:text-gray-300">{taux}%</span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-gray-100 dark:bg-gray-800">
                          <div
                            className="h-1.5 rounded-full bg-gradient-to-r from-brand-500 to-green-400 transition-all"
                            style={{ width: `${taux}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

        </div>
      )}

      {/* ── Modal détail réclamation ── */}
      {selectedRec && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => setSelectedRec(null)}
        >
          <div
            className="w-full max-w-lg rounded-2xl bg-white dark:bg-gray-900 shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className={`h-1.5 w-full ${prioriteBar[selectedRec.priorite]}`} />
            <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-800 flex items-start justify-between gap-3">
              <div>
                <p className="font-mono text-xs text-gray-400">{selectedRec.id?.slice(0, 8)?.toUpperCase()}</p>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mt-0.5">
                  {selectedRec.subject || selectedRec.machine}
                </h3>
              </div>
              <button onClick={() => setSelectedRec(null)} className="text-gray-400 hover:text-gray-600 mt-1 flex-shrink-0">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>

            <div className="px-6 py-5 space-y-4 max-h-[60vh] overflow-y-auto">
              {selectedRec.photoUrl && (
                <div className="rounded-xl overflow-hidden border border-gray-100 dark:border-gray-700">
                  <img src={selectedRec.photoUrl} alt="Preuve" className="w-full h-44 object-cover" />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Machine",    value: selectedRec.machine },
                  { label: "Catégorie",  value: selectedRec.type },
                  { label: "Étudiant",   value: selectedRec.etudiant },
                  { label: "Technicien", value: selectedRec.technicien ?? "Non assigné" },
                  { label: "Date",       value: selectedRec.date ? new Date(selectedRec.date).toLocaleDateString("fr-FR") : "-" },
                  { label: "Laboratoire", value: selectedRec.laboratoire ?? "-" },
                ].map(({ label, value }) => (
                  <div key={label} className="rounded-xl bg-gray-50 dark:bg-white/5 px-4 py-3">
                    <p className="text-xs text-gray-400 mb-0.5">{label}</p>
                    <p className="text-sm font-medium text-gray-800 dark:text-white truncate">{value}</p>
                  </div>
                ))}
                <div className="rounded-xl bg-gray-50 dark:bg-white/5 px-4 py-3">
                  <p className="text-xs text-gray-400 mb-1">Priorité</p>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${prioriteColor[selectedRec.priorite]}`}>
                    {selectedRec.priorite}
                  </span>
                </div>
                <div className="rounded-xl bg-gray-50 dark:bg-white/5 px-4 py-3">
                  <p className="text-xs text-gray-400 mb-1">Statut</p>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statutStyle[selectedRec.statut]}`}>
                    {selectedRec.statut}
                  </span>
                </div>
              </div>

              <div className="rounded-xl bg-gray-50 dark:bg-white/5 px-4 py-3">
                <p className="text-xs text-gray-400 mb-1.5">Description</p>
                <p className="text-sm text-gray-700 dark:text-gray-300">{selectedRec.description || "Aucune description"}</p>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-800 flex justify-end">
              <button
                onClick={() => setSelectedRec(null)}
                className="rounded-xl border border-gray-200 dark:border-gray-700 px-5 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}