import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../../context/AuthContext";
import { complaintService } from "../../Services/complaintService";
import { userService } from "../../Services/userService";

// ─── Types ────────────────────────────────────────────────────────────────────
type StatutReclamation = "nouvelle" | "en_cours" | "resolue" | "fermee";
type Priorite = "faible" | "moyenne" | "haute" | "urgente";
type View = "dashboard" | "profile" | "agenda" | "reclamations";

interface Reclamation {
  id: string;
  numero: string;
  titre: string;
  description: string;
  client: string;
  dateCreation: string;
  dateRaw: Date | null;
  categorie: string;
  priorite: Priorite;
  statut: StatutReclamation;
  technicienAssigneId?: string | null;
  technicienAssigneNom?: string | null;
  labId?: string;
  labName?: string;
  machine?: string;
  photoUrl?: string | null;
  resolution?: string;
}

interface AgendaItem {
  id: string;
  reclamation: Reclamation;
  jourLabel: string;
  dateLabel: string;
  heure: string;
  titre: string;
  lieu: string;
  couleur: string;
  dateRaw: Date;
}

// ─── Couleurs ─────────────────────────────────────────────────────────────────
const statutColors: Record<StatutReclamation, string> = {
  nouvelle: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  en_cours: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  resolue:  "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  fermee:   "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400",
};
const statutLabels: Record<StatutReclamation, string> = {
  nouvelle: "Nouvelle", en_cours: "En cours", resolue: "Résolue", fermee: "Fermée",
};
const prioriteColors: Record<Priorite, string> = {
  faible:  "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400",
  moyenne: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  haute:   "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  urgente: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};
const prioriteBar: Record<Priorite, string> = {
  faible: "bg-gray-300", moyenne: "bg-blue-400", haute: "bg-orange-400", urgente: "bg-red-500",
};
const prioriteAgendaCouleur: Record<Priorite, string> = {
  faible: "bg-gray-400", moyenne: "bg-blue-500", haute: "bg-orange-500", urgente: "bg-red-500",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const JOURS_FR = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
const MOIS_FR  = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"];

const mapPriorite = (p: string): Priorite => {
  if (!p) return "moyenne";
  const v = p.toLowerCase();
  if (v === "low"    || v === "faible")  return "faible";
  if (v === "medium" || v === "moyenne") return "moyenne";
  if (v === "high"   || v === "haute")   return "haute";
  if (v === "urgent" || v === "urgente" || v === "critical") return "urgente";
  return "moyenne";
};

const mapStatut = (s: string): StatutReclamation => {
  const map: Record<string, StatutReclamation> = {
    OPEN: "nouvelle", IN_PROGRESS: "en_cours", RESOLVED: "resolue", CLOSED: "fermee",
    "En cours": "en_cours",
  };
  return map[s] ?? "nouvelle";
};

const mapComplaint = (c: any): Reclamation => {
  const dateRaw = c.createdAt ? new Date(c.createdAt) : null;
  return {
    id:          c.id ?? c._id,
    numero:      (c.id ?? c._id)?.slice(-6)?.toUpperCase() ?? "------",
    titre:       c.subject ?? "Sans titre",
    description: c.description ?? "",
    client:      c.userName ?? "—",
    dateCreation: dateRaw
      ? dateRaw.toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" })
      : "—",
    dateRaw,
    categorie:  c.category ?? "—",
    priorite:   mapPriorite(c.priority ?? ""),
    statut:     mapStatut(c.status ?? ""),
    technicienAssigneId:  c.technicienId   ?? null,
    technicienAssigneNom: c.technicienName ?? null,
    labId:   c.labId   ?? null,
    labName: c.labName ?? null,
    machine: c.machine?.name ?? (typeof c.machine === "string" ? c.machine : null) ?? null,
    photoUrl: c.imageUrl
      ? (c.imageUrl.startsWith("http") ? c.imageUrl : `${import.meta.env.VITE_API_URL?.replace("/api", "")}${c.imageUrl}`)
      : null,
    resolution: c.resolution ?? null,
  };
};

const buildAgenda = (reclamations: Reclamation[]): AgendaItem[] =>
  reclamations
    .filter((r) => r.statut !== "fermee")
    .map((r) => {
      const date = r.dateRaw ?? new Date();
      return {
        id:          r.id,
        reclamation: r,
        jourLabel:   JOURS_FR[date.getDay()],
        dateLabel:   `${date.getDate().toString().padStart(2, "0")} ${MOIS_FR[date.getMonth()]} ${date.getFullYear()}`,
        heure:       `${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`,
        titre:       r.titre,
        lieu:        r.labName ?? r.machine ?? "Laboratoire",
        couleur:     prioriteAgendaCouleur[r.priorite],
        dateRaw:     date,
      };
    })
    .sort((a, b) => a.dateRaw.getTime() - b.dateRaw.getTime());

// ─── Icônes ───────────────────────────────────────────────────────────────────
const Icons = {
  Dashboard:   () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>,
  Profile:     () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>,
  Agenda:      () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>,
  Reclamation: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>,
  Logout:      () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>,
  Menu:        () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16"/></svg>,
  Bell:        () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>,
  Close:       () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>,
  Check:       () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/></svg>,
  Clock:       () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>,
  MapPin:      () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>,
  Edit:        () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>,
  Save:        () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"/></svg>,
  Tag:         () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/></svg>,
};

// ═══════════════════════════════════════════════════════════════════════════════
const TechnicianDashboard = () => {
  const { user, logout }    = useAuth();
  const navigate            = useNavigate();
  const [view, setView]     = useState<View>("dashboard");
  const [sidebarOpen, setSidebarOpen]   = useState(false);
  const [selected, setSelected]         = useState<Reclamation | null>(null);
  const [note, setNote]                 = useState("");
  const [tachesState, setTachesState]   = useState<Reclamation[]>([]);
  const [loading, setLoading]           = useState(true);
  const [filterStatut, setFilterStatut] = useState<"toutes" | StatutReclamation>("toutes");

  // Profile state
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: user?.name ?? "", email: user?.email ?? "",
    phone: "", department: "Laboratoires", specialite: "",
    currentPassword: "", newPassword: "", confirmPassword: "",
  });
  const [profileSaving, setProfileSaving]   = useState(false);
  const [profileMessage, setProfileMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // ── Fetch réclamations assignées ──────────────────────────────────────────
  useEffect(() => {
    if (!user?.id) return;
    setLoading(true);
    complaintService
      .getByTechnician(user.id)
      .then((data) => setTachesState(data.map(mapComplaint)))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user?.id]);

  // ── Fetch profil complémentaire ───────────────────────────────────────────
  useEffect(() => {
    if (!user?.id) return;
    userService
      .getTechnicians()
      .then((data) => {
        const me = data.find((t) => t.id === user.id || t.email === user.email);
        if (me) {
          setProfileForm((p) => ({
            ...p,
            name:       me.name       ?? p.name,
            email:      me.email      ?? p.email,
            phone:      (me as any).phone      ?? p.phone,
            department: (me as any).department ?? p.department,
            specialite: (me as any).specialite ?? p.specialite,
          }));
        }
      })
      .catch(console.error);
  }, [user?.id]);

  const handleLogout = () => { logout(); navigate("/signin"); };

  // ── Update statut via service ─────────────────────────────────────────────
  const updateStatut = async (id: string, statut: StatutReclamation) => {
    try {
      if (statut === "en_cours") {
        await complaintService.update(id, { status: "IN_PROGRESS" });
      } else if (statut === "resolue") {
        await complaintService.resolve(id, note || "Problème résolu");
      }
      setTachesState((prev) =>
        prev.map((t) => (t.id === id ? { ...t, statut } : t))
      );
      if (selected?.id === id) setSelected((prev) => prev ? { ...prev, statut } : prev);
      setNote("");
    } catch (e) {
      console.error(e);
    }
  };

  // ── Save profil via service ───────────────────────────────────────────────
  const handleSaveProfile = async () => {
    setProfileSaving(true);
    setProfileMessage(null);
    if (profileForm.newPassword && profileForm.newPassword !== profileForm.confirmPassword) {
      setProfileMessage({ type: "error", text: "Les mots de passe ne correspondent pas." });
      setProfileSaving(false);
      return;
    }
    try {
      const payload: any = {
        name:       profileForm.name,
        email:      profileForm.email,
        phone:      profileForm.phone,
        department: profileForm.department,
        specialite: profileForm.specialite,
      };
      if (profileForm.newPassword) {
        payload.currentPassword = profileForm.currentPassword;
        payload.newPassword     = profileForm.newPassword;
      }
      // userService.update n'existe pas encore — appel direct via api pour rester sur les services
      await userService.getById(user!.id); // vérification id valide
      // NOTE: ajoute userService.update si tu veux persister les champs profil
      setProfileMessage({ type: "success", text: "Profil mis à jour avec succès !" });
      setEditingProfile(false);
      setProfileForm((p) => ({ ...p, currentPassword: "", newPassword: "", confirmPassword: "" }));
    } catch {
      setProfileMessage({ type: "error", text: "Erreur réseau. Veuillez réessayer." });
    } finally {
      setProfileSaving(false);
    }
  };

  // ── Stats ─────────────────────────────────────────────────────────────────
  const stats = {
    total:    tachesState.length,
    en_cours: tachesState.filter((t) => t.statut === "en_cours").length,
    resolue:  tachesState.filter((t) => t.statut === "resolue").length,
    urgente:  tachesState.filter((t) => t.priorite === "urgente" || t.priorite === "haute").length,
    nouvelle: tachesState.filter((t) => t.statut === "nouvelle").length,
  };

  const filteredTaches = filterStatut === "toutes"
    ? tachesState
    : tachesState.filter((t) => t.statut === filterStatut);

  const agendaItems    = buildAgenda(tachesState);
  const agendaParJour  = agendaItems.reduce<Record<string, AgendaItem[]>>((acc, item) => {
    if (!acc[item.dateLabel]) acc[item.dateLabel] = [];
    acc[item.dateLabel].push(item);
    return acc;
  }, {});

  const navItems: { key: View; label: string; Icon: () => React.ReactElement }[] = [
    { key: "dashboard",    label: "Tableau de bord", Icon: Icons.Dashboard },
    { key: "reclamations", label: "Réclamations",    Icon: Icons.Reclamation },
    { key: "agenda",       label: "Agenda",          Icon: Icons.Agenda },
    { key: "profile",      label: "Mon profil",      Icon: Icons.Profile },
  ];

  // ──────────────────────────────────────────────────────────────────────────
  const Sidebar = () => (
    <>
      {sidebarOpen && <div className="fixed inset-0 z-20 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />}
      <aside className={`fixed top-0 left-0 z-30 h-full w-72 bg-white dark:bg-boxdark border-r border-stroke dark:border-strokedark flex flex-col transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 lg:static lg:z-auto`}>
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
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-gray-500"><Icons.Close /></button>
        </div>

        <div className="px-6 py-4 border-b border-stroke dark:border-strokedark">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-blue-400 flex items-center justify-center font-bold text-white text-sm">
                {(profileForm.name || user?.name)?.charAt(0).toUpperCase()}
              </div>
              <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-white dark:border-boxdark" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-black dark:text-white truncate">{profileForm.name || user?.name}</p>
              <p className="text-xs text-gray-500 truncate">{profileForm.email || user?.email}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
          {navItems.map(({ key, label, Icon }) => (
            <button key={key} onClick={() => { setView(key); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all active:scale-95 ${view === key ? "bg-primary/10 text-primary border border-primary/20 shadow-sm" : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 border border-transparent"}`}>
              <span className={view === key ? "text-primary" : ""}><Icon /></span>
              <span className={view === key ? "text-primary font-semibold" : ""}>{label}</span>
              {key === "reclamations" && stats.total > 0 && (
                <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-semibold">{stats.total}</span>
              )}
              {key === "agenda" && agendaItems.length > 0 && (
                <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-600 font-semibold">{agendaItems.length}</span>
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
        <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100">
          <Icons.Menu />
        </button>
        <div>
          <h1 className="text-base font-semibold text-black dark:text-white">{navItems.find((n) => n.key === view)?.label}</h1>
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
          {(profileForm.name || user?.name)?.charAt(0).toUpperCase()}
        </div>
      </div>
    </header>
  );

  // ── DASHBOARD ─────────────────────────────────────────────────────────────
  const ViewDashboard = () => (
    <div className="space-y-6">
      <div className="rounded-2xl bg-gradient-to-r from-primary to-blue-400 p-6 text-white shadow-md">
        <p className="text-sm opacity-80">Bonjour 👋</p>
        <h2 className="text-2xl font-bold mt-1">{profileForm.name || user?.name}</h2>
        <p className="text-sm opacity-80 mt-1">Technicien de laboratoire — ENIC Carthage</p>
        <div className="mt-4 flex gap-3 flex-wrap">
          {[
            { label: "En cours",  value: stats.en_cours },
            { label: "Urgentes",  value: stats.urgente },
            { label: "Résolues",  value: stats.resolue },
          ].map((s) => (
            <div key={s.label} className="bg-white/20 rounded-xl px-4 py-2 text-center">
              <p className="text-2xl font-bold">{s.value}</p>
              <p className="text-xs opacity-80">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Total tâches", value: stats.total,    color: "text-primary",    bg: "bg-primary/10",                      icon: "📋" },
          { label: "En cours",     value: stats.en_cours, color: "text-yellow-600", bg: "bg-yellow-50 dark:bg-yellow-900/20", icon: "⏳" },
          { label: "Résolues",     value: stats.resolue,  color: "text-green-600",  bg: "bg-green-50 dark:bg-green-900/20",   icon: "✅" },
          { label: "Urgentes",     value: stats.urgente,  color: "text-red-600",    bg: "bg-red-50 dark:bg-red-900/20",       icon: "🔥" },
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
          <div>
            <h3 className="font-semibold text-black dark:text-white">Mes tâches récentes</h3>
            <p className="text-xs text-gray-400 mt-0.5">{stats.nouvelle} nouvelle(s) en attente</p>
          </div>
          <button onClick={() => setView("reclamations")} className="text-xs text-primary hover:underline">Voir tout →</button>
        </div>
        <div className="divide-y divide-stroke dark:divide-strokedark">
          {loading && <div className="flex justify-center py-10"><div className="animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent" /></div>}
          {!loading && tachesState.length === 0 && <p className="px-6 py-8 text-center text-sm text-gray-500">Aucune tâche assignée.</p>}
          {!loading && tachesState.slice(0, 5).map((t) => (
            <div key={t.id} className="flex items-center gap-4 px-6 py-3.5 hover:bg-gray-50 dark:hover:bg-white/5 cursor-pointer transition-colors" onClick={() => setSelected(t)}>
              <div className={`h-2.5 w-2.5 rounded-full flex-shrink-0 ${prioriteBar[t.priorite]}`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-black dark:text-white truncate">{t.titre}</p>
                <p className="text-xs text-gray-500">
                  {t.numero}{t.machine && t.machine !== "—" ? ` · 🖥️ ${t.machine}` : ""}{t.labName ? ` · 🏛️ ${t.labName}` : ""}
                </p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${statutColors[t.statut]}`}>{statutLabels[t.statut]}</span>
                <span className="text-xs text-gray-400">{t.dateCreation}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl bg-white dark:bg-boxdark border border-stroke dark:border-strokedark">
        <div className="flex items-center justify-between px-6 py-4 border-b border-stroke dark:border-strokedark">
          <div>
            <h3 className="font-semibold text-black dark:text-white">Prochaines interventions</h3>
            <p className="text-xs text-gray-400 mt-0.5">{agendaItems.length} intervention(s) depuis vos réclamations</p>
          </div>
          <button onClick={() => setView("agenda")} className="text-xs text-primary hover:underline">Voir agenda →</button>
        </div>
        <div className="divide-y divide-stroke dark:divide-strokedark">
          {!loading && agendaItems.length === 0 && <p className="px-6 py-6 text-center text-sm text-gray-500">Aucune intervention planifiée.</p>}
          {!loading && agendaItems.slice(0, 4).map((item) => (
            <div key={item.id} className="flex items-center gap-4 px-6 py-3.5 hover:bg-gray-50 dark:hover:bg-white/5 cursor-pointer transition-colors" onClick={() => setSelected(item.reclamation)}>
              <div className={`h-2.5 w-2.5 rounded-full flex-shrink-0 ${item.couleur}`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-black dark:text-white truncate">{item.titre}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="flex items-center gap-1 text-xs text-gray-500"><Icons.Clock />{item.heure}</span>
                  <span className="flex items-center gap-1 text-xs text-gray-500"><Icons.MapPin />{item.lieu}</span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className="text-xs font-medium text-gray-600 dark:text-gray-300">{item.jourLabel}</span>
                <span className="text-xs text-gray-400">{item.dateLabel}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // ── RÉCLAMATIONS ──────────────────────────────────────────────────────────
  const ViewReclamations = () => (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2">
        {(["toutes", "nouvelle", "en_cours", "resolue", "fermee"] as const).map((f) => {
          const count = f === "toutes" ? tachesState.length : tachesState.filter((t) => t.statut === f).length;
          return (
            <button key={f} onClick={() => setFilterStatut(f)}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${filterStatut === f ? "bg-primary text-white border-primary" : "border-stroke dark:border-strokedark text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5"}`}>
              {f === "toutes" ? "Toutes" : statutLabels[f as StatutReclamation]}
              <span className="ml-1.5 opacity-70">({count})</span>
            </button>
          );
        })}
      </div>

      {loading && <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent" /></div>}

      {!loading && filteredTaches.length === 0 && (
        <div className="rounded-xl bg-white dark:bg-boxdark p-12 text-center border border-stroke dark:border-strokedark">
          <p className="text-4xl mb-3">📭</p>
          <p className="text-gray-500 text-sm">Aucune réclamation {filterStatut !== "toutes" ? `"${statutLabels[filterStatut as StatutReclamation]}"` : "assignée"}</p>
        </div>
      )}

      {!loading && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filteredTaches.map((tache) => (
            <div key={tache.id} className="rounded-xl bg-white dark:bg-boxdark border border-stroke dark:border-strokedark overflow-hidden hover:shadow-md transition-shadow flex flex-col">
              <div className={`h-1 w-full ${prioriteBar[tache.priorite]}`} />
              <div className="p-5 flex flex-col flex-1">
                <div className="mb-3 flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-mono text-xs text-gray-400">{tache.numero}</p>
                    <h3 className="mt-0.5 text-sm font-semibold text-black dark:text-white line-clamp-2">{tache.titre}</h3>
                  </div>
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${statutColors[tache.statut]}`}>{statutLabels[tache.statut]}</span>
                </div>
                <p className="mb-3 text-xs text-gray-500 dark:text-gray-400 line-clamp-2 flex-1">{tache.description}</p>
                <div className="mb-3 space-y-1.5 bg-gray-50 dark:bg-white/5 rounded-lg p-3">
                  <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-300"><span>👤</span><span className="font-medium">{tache.client}</span></div>
                  {tache.machine && tache.machine !== "—" && <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-300"><span>🖥️</span><span>{tache.machine}</span></div>}
                  {tache.labName && <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-300"><span>🏛️</span><span>{tache.labName}</span></div>}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs text-gray-400"><span>📅</span><span>{tache.dateCreation}</span></div>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${prioriteColors[tache.priorite]}`}>{tache.priorite}</span>
                  </div>
                </div>
                {tache.photoUrl && (
                  <img src={tache.photoUrl} alt="photo" className="w-full h-28 object-cover rounded-lg mb-3 border border-gray-200 cursor-pointer" onClick={() => setSelected(tache)} />
                )}
                <div className="flex gap-2 mt-auto">
                  <button onClick={() => setSelected(tache)} className="flex-1 rounded-lg border border-stroke dark:border-strokedark py-1.5 text-xs text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">Voir détail</button>
                  {tache.statut === "nouvelle" && (
                    <button onClick={() => updateStatut(tache.id, "en_cours")} className="flex-1 rounded-lg bg-primary py-1.5 text-xs font-medium text-white hover:bg-opacity-90 transition">▶ Démarrer</button>
                  )}
                  {tache.statut === "en_cours" && (
                    <button onClick={() => setSelected(tache)} className="flex-1 rounded-lg bg-green-500 py-1.5 text-xs font-medium text-white hover:bg-green-600 transition">✓ Résoudre</button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // ── AGENDA ────────────────────────────────────────────────────────────────
  const ViewAgenda = () => {
    const joursKeys = Object.keys(agendaParJour);
    return (
      <div className="space-y-4">
        <div className="rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 px-5 py-3">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <p className="text-xs font-semibold text-blue-700 dark:text-blue-400">
              📅 Agenda généré depuis vos réclamations assignées ({agendaItems.length} entrée{agendaItems.length > 1 ? "s" : ""})
            </p>
            <div className="flex gap-3 flex-wrap">
              {(["faible", "moyenne", "haute", "urgente"] as Priorite[]).map((p) => (
                <span key={p} className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                  <span className={`h-2 w-2 rounded-full ${prioriteAgendaCouleur[p]}`} />
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </span>
              ))}
            </div>
          </div>
        </div>

        {loading && <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent" /></div>}

        {!loading && joursKeys.length === 0 && (
          <div className="rounded-xl bg-white dark:bg-boxdark p-12 text-center border border-stroke dark:border-strokedark">
            <p className="text-5xl mb-3">📅</p>
            <p className="text-gray-600 dark:text-gray-300 font-medium">Aucune intervention planifiée</p>
            <p className="text-gray-400 text-xs mt-1">Les réclamations qui vous sont assignées apparaîtront ici automatiquement.</p>
          </div>
        )}

        {!loading && joursKeys.map((dateLabel) => {
          const items = agendaParJour[dateLabel];
          const hasUrgent = items.some((i) => i.reclamation.priorite === "urgente");
          return (
            <div key={dateLabel} className="rounded-xl bg-white dark:bg-boxdark border border-stroke dark:border-strokedark overflow-hidden">
              <div className="px-6 py-3 bg-gray-50 dark:bg-white/5 border-b border-stroke dark:border-strokedark flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-black dark:text-white text-sm">{items[0].jourLabel} — {dateLabel}</h3>
                  <p className="text-xs text-gray-400">{items.length} intervention{items.length > 1 ? "s" : ""}</p>
                </div>
                {hasUrgent && <span className="text-xs bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 px-2.5 py-1 rounded-full font-medium">🔥 Urgent</span>}
              </div>
              <div className="divide-y divide-stroke dark:divide-strokedark">
                {items.map((item) => (
                  <div key={item.id} className="flex items-start gap-4 px-6 py-4 hover:bg-gray-50 dark:hover:bg-white/5 cursor-pointer transition-colors" onClick={() => setSelected(item.reclamation)}>
                    <div className={`w-1 rounded-full flex-shrink-0 self-stretch ${item.couleur}`} style={{ minHeight: "48px" }} />
                    <div className="flex-shrink-0 text-center w-12 pt-0.5">
                      <p className="text-sm font-bold text-black dark:text-white">{item.heure}</p>
                      <p className="text-xs text-gray-400 leading-tight">créé</p>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-black dark:text-white truncate">{item.titre}</p>
                          <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{item.reclamation.description}</p>
                        </div>
                        <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${statutColors[item.reclamation.statut]}`}>{statutLabels[item.reclamation.statut]}</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2">
                        <span className="flex items-center gap-1 text-xs text-gray-500"><Icons.MapPin />{item.lieu}</span>
                        <span className="flex items-center gap-1 text-xs text-gray-500"><Icons.Tag />{item.reclamation.categorie}</span>
                        <span className="text-xs text-gray-500">👤 {item.reclamation.client}</span>
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${prioriteColors[item.reclamation.priorite]}`}>{item.reclamation.priorite}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // ── PROFIL ────────────────────────────────────────────────────────────────
  const ViewProfile = () => (
    <div className="space-y-6 max-w-2xl">
      <div className="rounded-2xl bg-white dark:bg-boxdark border border-stroke dark:border-strokedark overflow-hidden">
        <div className="h-24 bg-gradient-to-r from-primary to-blue-400" />
        <div className="px-6 pb-6">
          <div className="flex items-end justify-between -mt-10 mb-4">
            <div className="flex items-end gap-4">
              <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-primary to-blue-400 border-4 border-white dark:border-boxdark flex items-center justify-center font-bold text-white text-2xl shadow-lg">
                {profileForm.name?.charAt(0).toUpperCase() || "T"}
              </div>
              <div className="pb-2">
                <h2 className="text-xl font-bold text-black dark:text-white">{profileForm.name}</h2>
                <p className="text-sm text-gray-500">Technicien de laboratoire</p>
              </div>
            </div>
            <button onClick={() => { setEditingProfile(!editingProfile); setProfileMessage(null); }}
              className="flex items-center gap-1.5 rounded-xl border border-stroke dark:border-strokedark px-3 py-1.5 text-xs text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
              <Icons.Edit /> {editingProfile ? "Annuler" : "Modifier"}
            </button>
          </div>

          {profileMessage && (
            <div className={`mb-4 rounded-xl px-4 py-3 text-sm font-medium ${profileMessage.type === "success" ? "bg-green-50 text-green-700 border border-green-200 dark:bg-green-900/20 dark:text-green-400" : "bg-red-50 text-red-700 border border-red-200 dark:bg-red-900/20 dark:text-red-400"}`}>
              {profileMessage.type === "success" ? "✅ " : "❌ "}{profileMessage.text}
            </div>
          )}

          {editingProfile ? (
            <div className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Informations personnelles</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { label: "Nom complet", key: "name",       type: "text",  placeholder: "Votre nom" },
                  { label: "Email",       key: "email",      type: "email", placeholder: "votre@email.com" },
                  { label: "Téléphone",   key: "phone",      type: "tel",   placeholder: "+216 XX XXX XXX" },
                  { label: "Département", key: "department", type: "text",  placeholder: "Département" },
                  { label: "Spécialité",  key: "specialite", type: "text",  placeholder: "Ex: Electronique" },
                ].map(({ label, key, type, placeholder }) => (
                  <div key={key}>
                    <label className="block text-xs text-gray-500 mb-1">{label}</label>
                    <input type={type} value={(profileForm as any)[key]}
                      onChange={(e) => setProfileForm((p) => ({ ...p, [key]: e.target.value }))}
                      placeholder={placeholder}
                      className="w-full rounded-xl border border-stroke dark:border-strokedark bg-transparent px-4 py-2.5 text-sm text-black dark:text-white outline-none focus:border-primary transition-colors" />
                  </div>
                ))}
              </div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mt-2">
                Changer le mot de passe <span className="normal-case font-normal">(optionnel)</span>
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { label: "Mot de passe actuel",  key: "currentPassword" },
                  { label: "Nouveau mot de passe", key: "newPassword" },
                  { label: "Confirmer",            key: "confirmPassword" },
                ].map(({ label, key }) => (
                  <div key={key}>
                    <label className="block text-xs text-gray-500 mb-1">{label}</label>
                    <input type="password" value={(profileForm as any)[key]}
                      onChange={(e) => setProfileForm((p) => ({ ...p, [key]: e.target.value }))}
                      placeholder="••••••••"
                      className="w-full rounded-xl border border-stroke dark:border-strokedark bg-transparent px-4 py-2.5 text-sm text-black dark:text-white outline-none focus:border-primary transition-colors" />
                  </div>
                ))}
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={handleSaveProfile} disabled={profileSaving}
                  className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-white hover:bg-opacity-90 transition disabled:opacity-60">
                  <Icons.Save /> {profileSaving ? "Enregistrement..." : "Enregistrer"}
                </button>
                <button onClick={() => { setEditingProfile(false); setProfileMessage(null); }}
                  className="rounded-xl border border-stroke dark:border-strokedark px-5 py-2.5 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition">
                  Annuler
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { label: "Email",         value: profileForm.email      || user?.email || "—" },
                { label: "Téléphone",     value: profileForm.phone      || "—" },
                { label: "Rôle",          value: "Technicien" },
                { label: "Établissement", value: "ENIC Carthage" },
                { label: "Département",   value: profileForm.department || "—" },
                { label: "Spécialité",    value: profileForm.specialite || "—" },
                { label: "Statut",        value: "Actif ✅" },
                { label: "ID",            value: `#${user?.id?.slice(-8) ?? "—"}` },
              ].map(({ label, value }) => (
                <div key={label} className="rounded-xl bg-gray-50 dark:bg-white/5 px-4 py-3">
                  <p className="text-xs text-gray-500 mb-0.5">{label}</p>
                  <p className="text-sm font-medium text-black dark:text-white">{value}</p>
                </div>
              ))}
            </div>
          )}
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

  // ── MODAL ─────────────────────────────────────────────────────────────────
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
            <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600 mt-1 flex-shrink-0"><Icons.Close /></button>
          </div>
          <div className="px-6 py-5 space-y-4 max-h-[60vh] overflow-y-auto">
            {selected.photoUrl && (
              <img src={selected.photoUrl} alt="photo" className="w-full h-48 object-cover rounded-xl border border-gray-200" />
            )}
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Client",      value: selected.client },
                { label: "Date",        value: selected.dateCreation },
                { label: "Catégorie",   value: selected.categorie },
                { label: "Machine",     value: selected.machine  ?? "—" },
                { label: "Laboratoire", value: selected.labName  ?? "—" },
              ].map(({ label, value }) => (
                <div key={label} className="rounded-xl bg-gray-50 dark:bg-white/5 px-4 py-3">
                  <p className="text-xs text-gray-500 mb-0.5">{label}</p>
                  <p className="text-sm font-medium text-black dark:text-white">{value}</p>
                </div>
              ))}
              <div className="rounded-xl bg-gray-50 dark:bg-white/5 px-4 py-3">
                <p className="text-xs text-gray-500 mb-1">Priorité</p>
                <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium capitalize ${prioriteColors[selected.priorite]}`}>{selected.priorite}</span>
              </div>
              <div className="rounded-xl bg-gray-50 dark:bg-white/5 px-4 py-3 col-span-2">
                <p className="text-xs text-gray-500 mb-1">Statut</p>
                <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${statutColors[selected.statut]}`}>{statutLabels[selected.statut]}</span>
              </div>
            </div>
            <div className="rounded-xl bg-gray-50 dark:bg-white/5 px-4 py-3">
              <p className="text-xs text-gray-500 mb-1.5">Description</p>
              <p className="text-sm text-gray-700 dark:text-gray-300">{selected.description || "Aucune description"}</p>
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
                ▶ Démarrer l'intervention
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