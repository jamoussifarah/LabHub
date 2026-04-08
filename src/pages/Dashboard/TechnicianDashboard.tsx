import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../../context/AuthContext";
import { Reclamation, StatutReclamation } from "../../data/mockData";

type View = "dashboard" | "profile" | "agenda" | "reclamations";

const statutColors: Record<StatutReclamation, string> = {
  nouvelle: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  en_cours: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  resolue:  "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  fermee:   "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400",
};
const statutLabels: Record<StatutReclamation, string> = {
  nouvelle: "Nouvelle", en_cours: "En cours", resolue: "Résolue", fermee: "Fermée",
};
const prioriteColors: Record<string, string> = {
  faible:  "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400",
  moyenne: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  haute:   "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  urgente: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};
const prioriteBar: Record<string, string> = {
  faible: "bg-gray-300", moyenne: "bg-blue-400", haute: "bg-orange-400", urgente: "bg-red-500",
};

// mapper backend → frontend
const mapPriorite = (p: string): string => {
  const map: Record<string, string> = {
    LOW: "faible", MEDIUM: "moyenne", HIGH: "haute", URGENT: "urgente",
  };
  return map[p] ?? "moyenne";
};

const mapStatut = (s: string): StatutReclamation => {
  const map: Record<string, StatutReclamation> = {
    OPEN: "nouvelle", IN_PROGRESS: "en_cours",
    RESOLVED: "resolue", CLOSED: "fermee",
  };
  return map[s] ?? "nouvelle";
};

const mapComplaint = (c: any): Reclamation => ({
  id: c.id,
  numero: c.id?.slice(-6)?.toUpperCase() ?? "------",
  titre: c.subject,
  description: c.description,
  client: c.userName,
  dateCreation: c.createdAt
    ? new Date(c.createdAt).toLocaleDateString("fr-FR")
    : "—",
  categorie: c.category ?? "—",
  priorite: mapPriorite(c.priority) as any,
  statut: mapStatut(c.status),
  technicienAssigneId: c.technicienId ?? null,
  technicienAssigneNom: c.technicienName ?? null,
  labName: c.labName,
  machine: c.machine,
  photoUrl: c.photoUrl,
  resolution: c.resolution,
});

const AGENDA = [
  { id: 1, jour: "Lundi",    date: "07 Avr", heure: "09:00", titre: "Inspection Lab A",      lieu: "Bâtiment A",   couleur: "bg-blue-500" },
  { id: 2, jour: "Lundi",    date: "07 Avr", heure: "14:00", titre: "Maintenance serveur",   lieu: "Salle IT",     couleur: "bg-orange-500" },
  { id: 3, jour: "Mardi",    date: "08 Avr", heure: "10:00", titre: "Réunion équipe tech",   lieu: "Salle B204",   couleur: "bg-purple-500" },
  { id: 4, jour: "Mercredi", date: "09 Avr", heure: "08:30", titre: "Calibrage équipements", lieu: "Lab Chimie",   couleur: "bg-green-500" },
  { id: 5, jour: "Mercredi", date: "09 Avr", heure: "15:00", titre: "Formation sécurité",    lieu: "Amphi 1",      couleur: "bg-red-500" },
  { id: 6, jour: "Jeudi",    date: "10 Avr", heure: "11:00", titre: "Contrôle qualité",      lieu: "Lab Physique", couleur: "bg-teal-500" },
  { id: 7, jour: "Vendredi", date: "11 Avr", heure: "09:30", titre: "Rapport hebdomadaire",  lieu: "Bureau chef",  couleur: "bg-indigo-500" },
];

const Icons = {
  Dashboard: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
    </svg>
  ),
  Profile: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
    </svg>
  ),
  Agenda: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
    </svg>
  ),
  Reclamation: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
    </svg>
  ),
  Logout: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
    </svg>
  ),
  Menu: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16"/>
    </svg>
  ),
  Bell: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
    </svg>
  ),
  Close: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
    </svg>
  ),
  Check: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/>
    </svg>
  ),
  Clock: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
    </svg>
  ),
  MapPin: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
    </svg>
  ),
};

const TechnicianDashboard = () => {
  const { user, logout }  = useAuth();
  const navigate          = useNavigate();
  const [view, setView]   = useState<View>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selected, setSelected]       = useState<Reclamation | null>(null);
  const [note, setNote]               = useState("");
  const [tachesState, setTachesState] = useState<Reclamation[]>([]);
  const [loading, setLoading]         = useState(true);

  // ── Charger réclamations depuis backend ────────────────────────────────────
  useEffect(() => {
    if (!user?.id) return;
    fetch(`http://localhost:8087/api/complaints/technicien/${user.id}`)
      .then((r) => r.json())
      .then((data) => setTachesState(data.map(mapComplaint)))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user?.id]);

  const handleLogout = () => { logout(); navigate("/signin"); };

  // ── Mettre à jour statut via backend ──────────────────────────────────────
  const updateStatut = async (id: string, statut: StatutReclamation) => {
    const token = localStorage.getItem("reclamation_token");
    try {
      if (statut === "en_cours") {
        await fetch(`http://localhost:8087/api/complaints/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: "IN_PROGRESS" }),
        });
      } else if (statut === "resolue") {
        await fetch(
          `http://localhost:8087/api/complaints/${id}/resolve?resolution=${encodeURIComponent(note || "Problème résolu")}`,
          {
            method: "PUT",
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      }

      setTachesState((prev) =>
        prev.map((t) => t.id === id ? { ...t, statut } : t)
      );
      if (selected?.id === id)
        setSelected((prev) => prev ? { ...prev, statut } : prev);
      setNote("");
    } catch (e) {
      console.error("Erreur update statut:", e);
    }
  };

  const stats = {
    total:    tachesState.length,
    en_cours: tachesState.filter((t) => t.statut === "en_cours").length,
    resolue:  tachesState.filter((t) => t.statut === "resolue").length,
    urgente:  tachesState.filter((t) => t.priorite === "urgente" || t.priorite === "haute").length,
  };

  const navItems: { key: View; label: string; Icon: () => React.ReactElement }[] = [
    { key: "dashboard",    label: "Tableau de bord", Icon: Icons.Dashboard },
    { key: "reclamations", label: "Réclamations",    Icon: Icons.Reclamation },
    { key: "agenda",       label: "Agenda",          Icon: Icons.Agenda },
    { key: "profile",      label: "Mon profil",      Icon: Icons.Profile },
  ];

  const Sidebar = () => (
    <>
      {sidebarOpen && (
        <div className="fixed inset-0 z-20 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}
      <aside className={`fixed top-0 left-0 z-30 h-full w-72 bg-white dark:bg-boxdark border-r border-stroke dark:border-strokedark flex flex-col transition-transform duration-300 ease-in-out ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 lg:static lg:z-auto`}>
        <div className="flex items-center justify-between px-6 py-5 border-b border-stroke dark:border-strokedark">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M9 3H5C3.9 3 3 3.9 3 5V9C3 10.1 3.9 11 5 11H9C10.1 11 11 10.1 11 9V5C11 3.9 10.1 3 9 3Z" fill="white"/>
                <path d="M19 3H15C13.9 3 13 3.9 13 5V9C13 10.1 13.9 11 15 11H19C20.1 11 21 10.1 21 9V5C21 3.9 20.1 3 19 3Z" fill="white" opacity="0.7"/>
                <path d="M9 13H5C3.9 13 3 13.9 3 15V19C3 20.1 3.9 21 5 21H9C10.1 21 11 20.1 11 19V15C11 13.9 10.1 13 9 13Z" fill="white" opacity="0.7"/>
                <path d="M19 13H15C13.9 13 13 13.9 13 15V19C13 20.1 13.9 21 15 21H19C20.1 21 21 20.1 21 19V15C21 13.9 20.1 13 19 13Z" fill="white" opacity="0.4"/>
              </svg>
            </div>
            <div>
              <p className="text-sm font-bold text-black dark:text-white">LabHub</p>
              <p className="text-xs text-gray-500">ENIC Carthage</p>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-gray-500 hover:text-gray-700">
            <Icons.Close />
          </button>
        </div>

        <div className="px-6 py-4 border-b border-stroke dark:border-strokedark">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-blue-400 flex items-center justify-center font-bold text-white text-sm">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-white dark:border-boxdark" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-black dark:text-white truncate">{user?.name}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
          <p className="px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">Menu principal</p>
          {navItems.map(({ key, label, Icon }) => (
            <button key={key} onClick={() => { setView(key); setSidebarOpen(false); }}
              style={{ transition: "all 0.2s cubic-bezier(.4,0,.2,1)" }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium active:scale-95 ${view === key ? "bg-primary/10 text-primary border border-primary/20 shadow-sm" : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 border border-transparent"}`}>
              <span className={`transition-colors duration-200 ${view === key ? "text-primary" : ""}`}><Icon /></span>
              <span className={`transition-colors duration-200 ${view === key ? "text-primary font-semibold" : ""}`}>{label}</span>
              {key === "reclamations" && stats.total > 0 && (
                <span className="ml-auto text-xs px-2 py-0.5 rounded-full font-semibold bg-primary/10 text-primary">{stats.total}</span>
              )}
            </button>
          ))}
        </nav>

        <div className="px-4 py-4 border-t border-stroke dark:border-strokedark">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
            <Icons.Logout /> Déconnexion
          </button>
        </div>
      </aside>
    </>
  );

  const Header = () => (
    <header className="sticky top-0 z-10 bg-white dark:bg-boxdark border-b border-stroke dark:border-strokedark px-4 lg:px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/5">
          <Icons.Menu />
        </button>
        <div>
          <h1 className="text-base font-semibold text-black dark:text-white">
            {navItems.find((n) => n.key === view)?.label ?? "Tableau de bord"}
          </h1>
          <p className="text-xs text-gray-500 hidden sm:block">
            {new Date().toLocaleDateString("fr-FR", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button className="relative p-2 rounded-lg text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/5">
          <Icons.Bell />
          {stats.urgente > 0 && <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500" />}
        </button>
        <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary to-blue-400 flex items-center justify-center font-bold text-white text-sm">
          {user?.name?.charAt(0).toUpperCase()}
        </div>
      </div>
    </header>
  );

  const ViewDashboard = () => (
    <div className="space-y-6">
      <div className="rounded-2xl bg-gradient-to-r from-primary to-blue-400 p-6 text-white shadow-md">
        <p className="text-sm opacity-80">Bonjour 👋</p>
        <h2 className="text-2xl font-bold mt-1">{user?.name}</h2>
        <p className="text-sm opacity-80 mt-1">Technicien de laboratoire — ENIC Carthage</p>
        <div className="mt-4 flex gap-3">
          <div className="bg-white/20 rounded-xl px-4 py-2 text-center">
            <p className="text-2xl font-bold">{stats.en_cours}</p>
            <p className="text-xs opacity-80">En cours</p>
          </div>
          <div className="bg-white/20 rounded-xl px-4 py-2 text-center">
            <p className="text-2xl font-bold">{stats.urgente}</p>
            <p className="text-xs opacity-80">Urgentes</p>
          </div>
          <div className="bg-white/20 rounded-xl px-4 py-2 text-center">
            <p className="text-2xl font-bold">{stats.resolue}</p>
            <p className="text-xs opacity-80">Résolues</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Total tâches", value: stats.total,    color: "text-primary",    bg: "bg-primary/10",                        icon: "📋" },
          { label: "En cours",     value: stats.en_cours, color: "text-yellow-600", bg: "bg-yellow-50 dark:bg-yellow-900/20",   icon: "⏳" },
          { label: "Résolues",     value: stats.resolue,  color: "text-green-600",  bg: "bg-green-50 dark:bg-green-900/20",     icon: "✅" },
          { label: "Urgentes",     value: stats.urgente,  color: "text-red-600",    bg: "bg-red-50 dark:bg-red-900/20",         icon: "🔥" },
        ].map((s) => (
          <div key={s.label} className={`rounded-xl ${s.bg} border border-stroke dark:border-strokedark p-5`}>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-gray-500 dark:text-gray-400">{s.label}</p>
              <span className="text-lg">{s.icon}</span>
            </div>
            <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl bg-white dark:bg-boxdark border border-stroke dark:border-strokedark">
        <div className="flex items-center justify-between px-6 py-4 border-b border-stroke dark:border-strokedark">
          <h3 className="font-semibold text-black dark:text-white">Tâches récentes</h3>
          <button onClick={() => setView("reclamations")} className="text-xs text-primary hover:underline">Voir tout →</button>
        </div>
        <div className="divide-y divide-stroke dark:divide-strokedark">
          {loading && <p className="px-6 py-8 text-center text-sm text-gray-500">Chargement...</p>}
          {!loading && tachesState.slice(0, 4).map((t) => (
            <div key={t.id} className="flex items-center gap-4 px-6 py-3 hover:bg-gray-50 dark:hover:bg-white/5 cursor-pointer transition-colors"
              onClick={() => { setSelected(t); setView("reclamations"); }}>
              <div className={`h-2 w-2 rounded-full flex-shrink-0 ${prioriteBar[t.priorite]}`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-black dark:text-white truncate">{t.titre}</p>
                <p className="text-xs text-gray-500">{t.numero} · {t.client}</p>
              </div>
              <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${statutColors[t.statut]}`}>
                {statutLabels[t.statut]}
              </span>
            </div>
          ))}
          {!loading && tachesState.length === 0 && (
            <p className="px-6 py-8 text-center text-sm text-gray-500">Aucune tâche assignée.</p>
          )}
        </div>
      </div>

      <div className="rounded-xl bg-white dark:bg-boxdark border border-stroke dark:border-strokedark">
        <div className="flex items-center justify-between px-6 py-4 border-b border-stroke dark:border-strokedark">
          <h3 className="font-semibold text-black dark:text-white">Agenda cette semaine</h3>
          <button onClick={() => setView("agenda")} className="text-xs text-primary hover:underline">Voir tout →</button>
        </div>
        <div className="divide-y divide-stroke dark:divide-strokedark">
          {AGENDA.slice(0, 3).map((ev) => (
            <div key={ev.id} className="flex items-center gap-4 px-6 py-3">
              <div className={`h-2 w-2 rounded-full flex-shrink-0 ${ev.couleur}`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-black dark:text-white truncate">{ev.titre}</p>
                <p className="text-xs text-gray-500">{ev.jour} {ev.date} · {ev.heure}</p>
              </div>
              <span className="text-xs text-gray-400">{ev.lieu}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const ViewReclamations = () => (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2">
        {(["toutes", "nouvelle", "en_cours", "resolue", "fermee"] as const).map((f) => (
          <button key={f} className="rounded-full border border-stroke dark:border-strokedark px-3 py-1 text-xs text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 capitalize transition-colors">
            {f === "toutes" ? "Toutes" : statutLabels[f as StatutReclamation]}
          </button>
        ))}
      </div>

      {loading && <p className="text-center py-12 text-gray-500">Chargement des réclamations...</p>}

      {!loading && tachesState.length === 0 && (
        <div className="rounded-xl bg-white dark:bg-boxdark p-12 text-center border border-stroke dark:border-strokedark">
          <p className="text-4xl mb-3">📭</p>
          <p className="text-gray-500">Aucune réclamation assignée.</p>
        </div>
      )}

      {!loading && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {tachesState.map((tache) => (
            <div key={tache.id} className="rounded-xl bg-white dark:bg-boxdark border border-stroke dark:border-strokedark overflow-hidden hover:shadow-md transition-shadow">
              <div className={`h-1 w-full ${prioriteBar[tache.priorite]}`} />
              <div className="p-5">
                <div className="mb-3 flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-mono text-xs text-gray-400">{tache.numero}</p>
                    <h3 className="mt-0.5 text-sm font-semibold text-black dark:text-white truncate">{tache.titre}</h3>
                  </div>
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${statutColors[tache.statut]}`}>
                    {statutLabels[tache.statut]}
                  </span>
                </div>
                <p className="mb-3 text-xs text-gray-500 dark:text-gray-400 line-clamp-2">{tache.description}</p>
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-xs text-gray-500">{tache.client}</span>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${prioriteColors[tache.priorite]}`}>
                    {tache.priorite}
                  </span>
                </div>
                {tache.photoUrl && (
                  <img src={`http://localhost:8087${tache.photoUrl}`} alt="photo"
                    className="w-full h-28 object-cover rounded-lg mb-3 border border-gray-200" />
                )}
                <div className="flex gap-2">
                  <button onClick={() => setSelected(tache)}
                    className="flex-1 rounded-lg border border-stroke dark:border-strokedark py-1.5 text-xs text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                    Voir détail
                  </button>
                  {tache.statut === "nouvelle" && (
                    <button onClick={() => updateStatut(tache.id, "en_cours")}
                      className="flex-1 rounded-lg bg-primary py-1.5 text-xs font-medium text-white hover:bg-opacity-90">
                      Démarrer
                    </button>
                  )}
                  {tache.statut === "en_cours" && (
                    <button onClick={() => updateStatut(tache.id, "resolue")}
                      className="flex-1 rounded-lg bg-green-500 py-1.5 text-xs font-medium text-white hover:bg-green-600">
                      ✓ Résolu
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const ViewAgenda = () => {
    const jours = [...new Set(AGENDA.map((e) => e.jour))];
    return (
      <div className="space-y-6">
        {jours.map((jour) => (
          <div key={jour} className="rounded-xl bg-white dark:bg-boxdark border border-stroke dark:border-strokedark overflow-hidden">
            <div className="px-6 py-3 bg-gray-50 dark:bg-white/5 border-b border-stroke dark:border-strokedark">
              <h3 className="font-semibold text-black dark:text-white text-sm">
                {jour} — {AGENDA.find((e) => e.jour === jour)?.date}
              </h3>
            </div>
            <div className="divide-y divide-stroke dark:divide-strokedark">
              {AGENDA.filter((e) => e.jour === jour).map((ev) => (
                <div key={ev.id} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                  <div className={`h-10 w-1 rounded-full flex-shrink-0 ${ev.couleur}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-black dark:text-white">{ev.titre}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="flex items-center gap-1 text-xs text-gray-500"><Icons.Clock /> {ev.heure}</span>
                      <span className="flex items-center gap-1 text-xs text-gray-500"><Icons.MapPin /> {ev.lieu}</span>
                    </div>
                  </div>
                  <div className={`h-3 w-3 rounded-full flex-shrink-0 ${ev.couleur}`} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const ViewProfile = () => (
    <div className="space-y-6 max-w-2xl">
      <div className="rounded-2xl bg-white dark:bg-boxdark border border-stroke dark:border-strokedark overflow-hidden">
        <div className="h-24 bg-gradient-to-r from-primary to-blue-400" />
        <div className="px-6 pb-6">
          <div className="flex items-end gap-4 -mt-10 mb-4">
            <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-primary to-blue-400 border-4 border-white dark:border-boxdark flex items-center justify-center font-bold text-white text-2xl shadow-lg">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="pb-2">
              <h2 className="text-xl font-bold text-black dark:text-white">{user?.name}</h2>
              <p className="text-sm text-gray-500">Technicien de laboratoire</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { label: "Email",         value: user?.email ?? "—" },
              { label: "Rôle",          value: "Technicien" },
              { label: "Établissement", value: "ENIC Carthage" },
              { label: "Département",   value: "Laboratoires" },
              { label: "Statut",        value: "Actif" },
              { label: "ID",            value: `#${user?.id ?? "—"}` },
            ].map(({ label, value }) => (
              <div key={label} className="rounded-xl bg-gray-50 dark:bg-white/5 px-4 py-3">
                <p className="text-xs text-gray-500 mb-0.5">{label}</p>
                <p className="text-sm font-medium text-black dark:text-white">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-xl bg-white dark:bg-boxdark border border-stroke dark:border-strokedark p-6">
        <h3 className="font-semibold text-black dark:text-white mb-4">Mes statistiques</h3>
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Tâches totales", value: stats.total,    color: "text-primary" },
            { label: "Résolues",       value: stats.resolue,  color: "text-green-500" },
            { label: "En cours",       value: stats.en_cours, color: "text-yellow-500" },
          ].map(({ label, value, color }) => (
            <div key={label} className="text-center p-4 rounded-xl bg-gray-50 dark:bg-white/5">
              <p className={`text-3xl font-bold ${color}`}>{value}</p>
              <p className="text-xs text-gray-500 mt-1">{label}</p>
            </div>
          ))}
        </div>
        <div className="mt-4">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Taux de résolution</span>
            <span>{stats.total > 0 ? Math.round((stats.resolue / stats.total) * 100) : 0}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-gray-100 dark:bg-white/10">
            <div className="h-2 rounded-full bg-gradient-to-r from-primary to-green-400 transition-all"
              style={{ width: `${stats.total > 0 ? (stats.resolue / stats.total) * 100 : 0}%` }} />
          </div>
        </div>
      </div>

      <button onClick={handleLogout}
        className="w-full flex items-center justify-center gap-2 rounded-xl border-2 border-red-200 dark:border-red-900/50 py-3 text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
        <Icons.Logout /> Se déconnecter
      </button>
    </div>
  );

  const Modal = () => {
    if (!selected) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" onClick={() => setSelected(null)}>
        <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-boxdark shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
          <div className={`h-1.5 w-full ${prioriteBar[selected.priorite]}`} />
          <div className="px-6 py-5 border-b border-stroke dark:border-strokedark flex items-start justify-between gap-3">
            <div>
              <p className="font-mono text-xs text-gray-400 mb-1">{selected.numero}</p>
              <h3 className="text-lg font-semibold text-black dark:text-white">{selected.titre}</h3>
            </div>
            <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600 mt-1"><Icons.Close /></button>
          </div>

          <div className="px-6 py-5 space-y-4 max-h-[60vh] overflow-y-auto">
            {selected.photoUrl && (
              <div>
                <p className="text-xs text-gray-500 mb-2">Photo du problème</p>
                <img src={`http://localhost:8087${selected.photoUrl}`} alt="photo"
                  className="w-full h-48 object-cover rounded-xl border border-gray-200" />
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Client",      value: selected.client },
                { label: "Date",        value: selected.dateCreation },
                { label: "Catégorie",   value: selected.categorie },
                { label: "Machine",     value: selected.machine ?? "—" },
                { label: "Laboratoire", value: selected.labName ?? "—" },
              ].map(({ label, value }) => (
                <div key={label} className="rounded-xl bg-gray-50 dark:bg-white/5 px-4 py-3">
                  <p className="text-xs text-gray-500 mb-0.5">{label}</p>
                  <p className="text-sm font-medium text-black dark:text-white">{value}</p>
                </div>
              ))}
              <div className="rounded-xl bg-gray-50 dark:bg-white/5 px-4 py-3">
                <p className="text-xs text-gray-500 mb-0.5">Priorité</p>
                <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium capitalize ${prioriteColors[selected.priorite]}`}>
                  {selected.priorite}
                </span>
              </div>
              <div className="col-span-2 rounded-xl bg-gray-50 dark:bg-white/5 px-4 py-3">
                <p className="text-xs text-gray-500 mb-0.5">Statut</p>
                <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${statutColors[selected.statut]}`}>
                  {statutLabels[selected.statut]}
                </span>
              </div>
            </div>

            <div>
              <p className="text-xs text-gray-500 mb-2">Description</p>
              <p className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-white/5 rounded-xl px-4 py-3">
                {selected.description}
              </p>
            </div>

            {selected.statut === "en_cours" && (
              <div>
                <p className="text-xs text-gray-500 mb-2">Note d'intervention</p>
                <textarea value={note} onChange={(e) => setNote(e.target.value)}
                  placeholder="Décrivez votre intervention..."
                  rows={3}
                  className="w-full rounded-xl border border-stroke dark:border-strokedark bg-transparent px-4 py-3 text-sm text-black dark:text-white outline-none focus:border-primary resize-none" />
              </div>
            )}
          </div>

          <div className="px-6 py-4 border-t border-stroke dark:border-strokedark flex gap-2">
            {selected.statut === "nouvelle" && (
              <button onClick={() => updateStatut(selected.id, "en_cours")}
                className="flex-1 rounded-xl bg-primary py-2.5 text-sm font-medium text-white hover:bg-opacity-90 transition">
                Démarrer l'intervention
              </button>
            )}
            {selected.statut === "en_cours" && (
              <button onClick={() => updateStatut(selected.id, "resolue")}
                className="flex-1 rounded-xl bg-green-500 py-2.5 text-sm font-medium text-white hover:bg-green-600 transition flex items-center justify-center gap-2">
                <Icons.Check /> Marquer comme résolu
              </button>
            )}
            <button onClick={() => setSelected(null)}
              className="rounded-xl border border-stroke dark:border-strokedark px-4 py-2.5 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition">
              Fermer
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {view === "dashboard"    && <ViewDashboard />}
          {view === "reclamations" && <ViewReclamations />}
          {view === "agenda"       && <ViewAgenda />}
          {view === "profile"      && <ViewProfile />}
        </main>
      </div>
      <Modal />
    </div>
  );
};

export default TechnicianDashboard;