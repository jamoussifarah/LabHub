import { useState, useEffect } from "react";
import PageMeta from "../../components/common/PageMeta";
import { complaintService } from "../../Services/complaintService";
import { userService } from "../../Services/userService";
import type { Complaint, ComplaintStatus } from "../../Models/Complaint";
import type { User } from "../../Models/user";

// ✅ Extension locale pour inclure le champ technicien (DBRef)
interface ExtendedComplaint extends Complaint {
  technicien?: {
    id: string;
    name: string;
  };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
const getMachineName = (machine: any): string => {
  if (!machine) return "—";
  if (typeof machine === "object") return machine.name || "—";
  if (typeof machine === "string") {
    try { return JSON.parse(machine).name || "—"; }
    catch { return machine; }
  }
  return "—";
};

const getFullImageUrl = (url?: string): string | null => {
  if (!url) return null;
  if (url.startsWith("http")) return url;
  const base = import.meta.env.VITE_API_URL?.replace("/api", "") ;
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

const isStatusInProgress = (status: string): boolean => {
  return status === "IN_PROGRESS" || status === "En cours";
};

const priorityDot: Record<string, string> = {
  HIGH: "bg-rose-500", CRITICAL: "bg-red-600",
  MEDIUM: "bg-orange-400", LOW: "bg-gray-300",
};

const statutStyle: Record<string, string> = {
  OPEN: "bg-blue-50 text-blue-700 border border-blue-200",
  IN_PROGRESS: "bg-amber-50 text-amber-700 border border-amber-200",
  "En cours": "bg-amber-50 text-amber-700 border border-amber-200",
  RESOLVED: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  CLOSED: "bg-gray-50 text-gray-500 border border-gray-200",
};

// ─── Icônes ─────────────────────────────────────────────────────────────────
const IconTicket  = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 5v2m0 4v2m0 4v2M5 5h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2z"/></svg>;
const IconClock   = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>;
const IconCheck   = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>;
const IconAlert   = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>;
const IconTool    = () => <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>;
const IconArrow   = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/></svg>;
const IconAssign  = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>;

// ─── Composant principal ───────────────────────────────────────────────────
export default function Home() {
  const [complaints, setComplaints]               = useState<ExtendedComplaint[]>([]);
  const [techniciens, setTechniciens]             = useState<User[]>([]);
  const [loading, setLoading]                     = useState(true);
  const [selectedComplaint, setSelectedComplaint] = useState<ExtendedComplaint | null>(null);
  const [assignModal, setAssignModal]             = useState<ExtendedComplaint | null>(null);
  const [selectedTechId, setSelectedTechId]       = useState<string>("");
  const [assigning, setAssigning]                 = useState(false);

  // Chargement des données
  const fetchAll = async () => {
    try {
      const [complaintsData, usersData] = await Promise.all([
        complaintService.getAll(),
        userService.getTechnicians(),
      ]);
      setComplaints(complaintsData as ExtendedComplaint[]);
      setTechniciens(usersData);
      if (usersData.length) setSelectedTechId(usersData[0].id);
    } catch (err) {
      console.error("Erreur chargement:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  // ─── Statistiques (utilisation de isStatusInProgress) ────────────────────
  const stats = {
    total:      complaints.length,
    open:       complaints.filter(c => c.status === "OPEN").length,
    inProgress: complaints.filter(c => isStatusInProgress(c.status)).length,
    resolved:   complaints.filter(c => c.status === "RESOLVED").length,
    highPrio:   complaints.filter(c => c.priority === "HIGH" || c.priority === "CRITICAL").length,
    unassigned: complaints.filter(c => c.status === "OPEN" && !c.technicien).length,
  };

  const tauxResolution = stats.total > 0 ? Math.round((stats.resolved / stats.total) * 100) : 0;
  const circumference  = 2 * Math.PI * 15.9;
  const dashOffset     = circumference - (tauxResolution / 100) * circumference;

  const urgentes = complaints
    .filter(c => c.status === "OPEN" && (c.priority === "HIGH" || c.priority === "CRITICAL"))
    .slice(0, 4);
  const enCours = complaints
    .filter(c => isStatusInProgress(c.status))
    .slice(0, 4);

  const categories = complaints.reduce<Record<string, number>>((acc, c) => {
    const cat = c.category || "Autre";
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {});
  const topCategories = Object.entries(categories).sort((a, b) => b[1] - a[1]).slice(0, 5);

  // Stats techniciens basées sur c.technicien?.name
  const techStats = techniciens.map(tech => {
    const assigned   = complaints.filter(c => c.technicien?.name === tech.name);
    const resolved   = assigned.filter(c => c.status === "RESOLVED").length;
    const inProgress = assigned.filter(c => isStatusInProgress(c.status)).length;
    const rate       = assigned.length ? Math.round((resolved / assigned.length) * 100) : 0;
    return { ...tech, assigned: assigned.length, resolved, inProgress, rate };
  });

  // ─── Assignation (fallback local avec status "IN_PROGRESS" pour respecter le type) ──
  const handleConfirmAssign = async () => {
    if (!assignModal) return;
    const tech = techniciens.find(t => t.id === selectedTechId);
    if (!tech) return;

    setAssigning(true);
    try {
      await complaintService.assignTechnician(assignModal.id, tech.id);
      await fetchAll();
      setAssignModal(null);
    } catch (err) {
      console.error("Erreur assignation API, fallback local:", err);
      // Fallback local : on met à jour l'état avec status "IN_PROGRESS" (valide pour ComplaintStatus)
      setComplaints(prev => prev.map(c =>
        c.id === assignModal.id
          ? { ...c, status: "IN_PROGRESS" as ComplaintStatus, technicien: { name: tech.name, id: tech.id } }
          : c
      ));
      setAssignModal(null);
      alert("Assignation enregistrée localement (backend non disponible)");
    } finally {
      setAssigning(false);
    }
  };

  // ──────────────────────────────────────────────────────────────────────────
  return (
    <>
      <PageMeta title="Dashboard Admin | LabHub" description="Tableau de bord administrateur" />

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-brand-500 border-t-transparent" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* En-tête */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Tableau de bord</h1>
              <p className="text-sm text-gray-400 mt-0.5">Vue d'ensemble du système de réclamations</p>
            </div>
            <span className="self-start sm:self-auto text-sm text-gray-400 bg-gray-50 dark:bg-gray-800 px-3 py-1.5 rounded-full border border-gray-200 dark:border-gray-700">
              {new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}
            </span>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Total",         value: stats.total,      icon: <IconTicket />, color: "text-brand-500",   bg: "bg-brand-50 dark:bg-brand-500/10",     iconBg: "bg-brand-100 dark:bg-brand-500/20" },
              { label: "En cours",      value: stats.inProgress, icon: <IconClock />,  color: "text-amber-600",   bg: "bg-amber-50 dark:bg-amber-500/10",     iconBg: "bg-amber-100 dark:bg-amber-500/20" },
              { label: "Résolues",      value: stats.resolved,   icon: <IconCheck />,  color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-500/10", iconBg: "bg-emerald-100 dark:bg-emerald-500/20" },
              { label: "Non assignées", value: stats.unassigned, icon: <IconAlert />,  color: "text-rose-600",    bg: "bg-rose-50 dark:bg-rose-500/10",       iconBg: "bg-rose-100 dark:bg-rose-500/20" },
            ].map(s => (
              <div key={s.label} className={`rounded-xl border border-gray-200 dark:border-gray-800 ${s.bg} p-4`}>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{s.label}</p>
                  <div className={`${s.iconBg} ${s.color} p-1.5 rounded-lg`}>{s.icon}</div>
                </div>
                <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
                <div className="mt-2 h-1 w-full rounded-full bg-black/5 dark:bg-white/10">
                  <div className={`h-1 rounded-full ${s.color.replace("text-", "bg-")}`}
                    style={{ width: stats.total > 0 ? `${Math.round((s.value / stats.total) * 100)}%` : "0%" }} />
                </div>
              </div>
            ))}
          </div>

          {/* Urgences + En cours */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Urgentes non assignées */}
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-rose-200 dark:border-rose-900/50 shadow-sm overflow-hidden">
              <div className="flex items-center gap-2 px-5 py-3.5 border-b border-rose-100 dark:border-rose-900/40 bg-rose-50 dark:bg-rose-500/5">
                <div className="text-rose-500"><IconAlert /></div>
                <div>
                  <h3 className="text-sm font-semibold text-rose-700 dark:text-rose-400">À traiter en urgence</h3>
                  <p className="text-xs text-rose-400">{urgentes.length} réclamation(s) haute priorité non assignée(s)</p>
                </div>
              </div>
              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {urgentes.length === 0 ? (
                  <div className="px-5 py-8 text-center text-sm text-gray-400">✓ Aucune urgence en attente</div>
                ) : urgentes.map(c => (
                  <div key={c.id} className="px-5 py-3 flex items-center justify-between gap-3 hover:bg-gray-50 dark:hover:bg-gray-800/30">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`h-2 w-2 rounded-full ${priorityDot[c.priority]}`} />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-800 dark:text-white truncate">{c.subject || "Sans sujet"}</p>
                        <p className="text-xs text-gray-400 truncate">{getMachineName(c.machine)} · {c.labName || "—"}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => { setAssignModal(c); if (techniciens.length) setSelectedTechId(techniciens[0].id); }}
                      className="flex items-center gap-1.5 text-xs bg-blue-600 hover:bg-blue-700 text-white px-2.5 py-1.5 rounded-lg"
                    >
                      <IconAssign /> Assigner
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* En cours */}
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-amber-200 dark:border-amber-900/50 shadow-sm overflow-hidden">
              <div className="flex items-center gap-2 px-5 py-3.5 border-b border-amber-100 dark:border-amber-900/40 bg-amber-50 dark:bg-amber-500/5">
                <div className="text-amber-500"><IconClock /></div>
                <div>
                  <h3 className="text-sm font-semibold text-amber-700 dark:text-amber-400">En cours de traitement</h3>
                  <p className="text-xs text-amber-400">{stats.inProgress} réclamation(s) active(s)</p>
                </div>
              </div>
              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {enCours.length === 0 ? (
                  <div className="px-5 py-8 text-center text-sm text-gray-400">— Aucune réclamation en cours</div>
                ) : enCours.map(c => (
                  <div key={c.id} onClick={() => setSelectedComplaint(c)} className="px-5 py-3 flex items-center justify-between gap-3 hover:bg-gray-50 dark:hover:bg-gray-800/30 cursor-pointer">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-800 dark:text-white truncate">{c.subject || "Sans sujet"}</p>
                      <p className="text-xs text-gray-400 truncate">{getMachineName(c.machine)} · {c.technicien?.name || "Non assigné"}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statutStyle[c.status]}`}>{translateStatus(c.status)}</span>
                      <IconArrow />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Taux résolution + Catégories */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Taux de résolution</h3>
              <div className="flex items-center gap-6">
                <div className="relative w-28 h-28">
                  <svg viewBox="0 0 36 36" className="w-28 h-28 -rotate-90">
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="#F3F4F6" strokeWidth="3"/>
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="#10b981" strokeWidth="3"
                      strokeDasharray={circumference} strokeDashoffset={dashOffset} strokeLinecap="round"
                      style={{ transition: "stroke-dashoffset 0.6s ease" }} />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-xl font-bold text-gray-800 dark:text-white">{tauxResolution}%</span>
                    <span className="text-xs text-gray-400">résolu</span>
                  </div>
                </div>
                <div className="space-y-2 flex-1">
                  {[
                    { label: "En attente", value: stats.open, color: "bg-blue-400" },
                    { label: "En cours",   value: stats.inProgress, color: "bg-amber-400" },
                    { label: "Résolues",   value: stats.resolved, color: "bg-emerald-400" },
                    { label: "Priorité ↑", value: stats.highPrio, color: "bg-rose-400" },
                  ].map(item => (
                    <div key={item.label} className="flex items-center gap-2">
                      <div className={`h-2 w-2 rounded-full ${item.color}`} />
                      <span className="text-xs text-gray-500 dark:text-gray-400 flex-1">{item.label}</span>
                      <span className="text-xs font-semibold text-gray-700 dark:text-gray-200">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Réclamations par catégorie</h3>
              {topCategories.length === 0 ? <p className="text-xs text-gray-400">Aucune donnée</p> : (
                <div className="space-y-3">
                  {topCategories.map(([cat, count]) => (
                    <div key={cat}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-600 dark:text-gray-300 font-medium">{cat}</span>
                        <span className="text-gray-400">{count} / {stats.total}</span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-gray-100 dark:bg-gray-800">
                        <div className="h-1.5 rounded-full bg-brand-500 transition-all" style={{ width: `${(count / stats.total) * 100}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Techniciens */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
            <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800">
              <h3 className="text-sm font-semibold text-gray-800 dark:text-white">Charge de travail — Techniciens</h3>
              <p className="text-xs text-gray-400 mt-0.5">{techniciens.length} technicien(s) actif(s)</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-5">
              {techStats.map(tech => (
                <div key={tech.id} className="rounded-xl border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-brand-400 to-blue-500 flex items-center justify-center text-white font-bold text-sm">
                      {tech.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-sm text-gray-800 dark:text-white truncate">{tech.name}</p>
                      <p className="text-xs text-gray-400 truncate">{tech.email || tech.department}</p>
                    </div>
                  </div>
                  {tech.department && (
                    <span className="inline-flex items-center gap-1 text-xs text-brand-600 bg-brand-50 dark:bg-brand-500/10 px-2 py-0.5 rounded-full mb-3">
                      <IconTool /> {tech.department}
                    </span>
                  )}
                  <div className="grid grid-cols-3 gap-1.5 mb-3">
                    {[
                      { label: "Assignées", value: tech.assigned,   color: "text-gray-700 dark:text-gray-200" },
                      { label: "En cours",  value: tech.inProgress, color: "text-amber-600" },
                      { label: "Résolues",  value: tech.resolved,   color: "text-emerald-600" },
                    ].map(s => (
                      <div key={s.label} className="text-center bg-gray-50 dark:bg-gray-800/50 rounded-lg py-2">
                        <p className={`text-base font-bold ${s.color}`}>{s.value}</p>
                        <p className="text-[10px] text-gray-400">{s.label}</p>
                      </div>
                    ))}
                  </div>
                  <div>
                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                      <span>Taux résolution</span>
                      <span className="font-medium text-gray-600 dark:text-gray-300">{tech.rate}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-gradient-to-r from-brand-500 to-emerald-400 transition-all" style={{ width: `${tech.rate}%` }} />
                    </div>
                  </div>
                </div>
              ))}
              {techniciens.length === 0 && <div className="col-span-full text-center py-6 text-gray-400 text-sm">Aucun technicien trouvé</div>}
            </div>
          </div>
        </div>
      )}

      {/* Modal détail */}
      {selectedComplaint && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedComplaint(null)}>
          <div className="bg-white dark:bg-gray-900 rounded-xl max-w-lg w-full max-h-[85vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-5 py-4 flex justify-between items-center">
              <h3 className="font-semibold text-gray-800 dark:text-white">Détail de la réclamation</h3>
              <button onClick={() => setSelectedComplaint(null)} className="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
            </div>
            <div className="p-5 space-y-4">
              {selectedComplaint.imageUrl && <img src={getFullImageUrl(selectedComplaint.imageUrl)!} alt="preuve" className="rounded-lg w-full h-40 object-cover border" />}
              <div><p className="text-xs text-gray-400">Sujet</p><p className="font-semibold">{selectedComplaint.subject || "Sans sujet"}</p></div>
              <div><p className="text-xs text-gray-400">Description</p><p className="text-sm">{selectedComplaint.description || "—"}</p></div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Machine", value: getMachineName(selectedComplaint.machine) },
                  { label: "Catégorie", value: selectedComplaint.category || "—" },
                  { label: "Étudiant", value: selectedComplaint.userName || selectedComplaint.user?.name || "—" },
                  { label: "Laboratoire", value: selectedComplaint.labName || selectedComplaint.lab?.name || "—" },
                  { label: "Priorité", value: translatePriority(selectedComplaint.priority) },
                  { label: "Statut", value: translateStatus(selectedComplaint.status) },
                  { label: "Technicien", value: selectedComplaint.technicien?.name || "Non assigné" },
                  { label: "Date", value: new Date(selectedComplaint.createdAt).toLocaleDateString("fr-FR") },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-gray-50 dark:bg-white/5 rounded-lg px-3 py-2.5">
                    <p className="text-[10px] text-gray-400 uppercase font-semibold mb-0.5">{label}</p>
                    <p className="text-sm font-medium text-gray-800 dark:text-white truncate">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal assignation */}
      {assignModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setAssignModal(null)}>
          <div className="bg-white dark:bg-gray-900 rounded-xl w-full max-w-sm p-5 shadow-2xl" onClick={e => e.stopPropagation()}>
            <h3 className="font-semibold text-gray-800 dark:text-white mb-1">Assigner un technicien</h3>
            <p className="text-xs text-gray-400 mb-4 truncate">Réclamation : {assignModal.subject || assignModal.id}</p>
            <select value={selectedTechId} onChange={e => setSelectedTechId(e.target.value)} className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 mb-4 text-sm dark:bg-gray-800 dark:text-white">
              {techniciens.map(t => <option key={t.id} value={t.id}>{t.name} — {t.department}</option>)}
            </select>
            <div className="flex justify-end gap-2">
              <button onClick={() => setAssignModal(null)} className="px-4 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">Annuler</button>
              <button onClick={handleConfirmAssign} disabled={assigning} className="px-4 py-2 text-sm bg-brand-600 hover:bg-brand-700 text-white rounded-lg disabled:opacity-50">
                {assigning ? "Assignation..." : "Confirmer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}