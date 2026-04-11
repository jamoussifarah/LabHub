import { useState, useEffect }        from "react";
import { useNavigate }                from "react-router";
import { useAuth }                    from "../../context/AuthContext";
import { complaintService }           from "../../Services/complaintService";
import { userService }                from "../../Services/userService";
import type { View, Reclamation, StatutReclamation, ProfileForm } from "./types";
import { mapComplaint, buildAgenda }  from "./utils";
import { Sidebar }                    from "./components/Sidebar";
import { Header }                     from "./components/Header";
import { ReclamationModal }           from "./components/ReclamationModal";
import { ViewDashboard }              from "./views/ViewDashboard";
import { ViewReclamations }           from "./views/ViewReclamations";
import { ViewAgenda }                 from "./views/ViewAgenda";
import { ViewProfile }                from "./views/ViewProfile";

const TechnicianDashboard = () => {
  const { user, logout } = useAuth();
  const navigate         = useNavigate();

  const [view,         setView]         = useState<View>("dashboard");
  const [sidebarOpen,  setSidebarOpen]  = useState(false);
  const [selected,     setSelected]     = useState<Reclamation | null>(null);
  const [note,         setNote]         = useState("");
  const [taches,       setTaches]       = useState<Reclamation[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [filter,       setFilter]       = useState<"toutes" | StatutReclamation>("toutes");

  const [profileForm,    setProfileForm]    = useState<ProfileForm>({
    name: user?.name ?? "", email: user?.email ?? "",
    phone: "", department: "Laboratoires", specialite: "",
    currentPassword: "", newPassword: "", confirmPassword: "",
  });
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileSaving,  setProfileSaving]  = useState(false);
  const [profileMessage, setProfileMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // ── Réclamations ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!user?.id) return;
    setLoading(true);
    complaintService.getByTechnician(user.id)
      .then((data) => setTaches(data.map(mapComplaint)))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user?.id]);

  // ── Profil ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!user?.id) return;
    userService.getTechnicians()
      .then((data) => {
        const me = data.find((t) => t.id === user.id || t.email === user.email);
        if (me) setProfileForm((p) => ({
          ...p,
          name:       me.name              ?? p.name,
          email:      me.email             ?? p.email,
          phone:      (me as any).phone      ?? p.phone,
          department: (me as any).department ?? p.department,
          specialite: (me as any).specialite ?? p.specialite,
        }));
      })
      .catch(console.error);
  }, [user?.id]);

  // ── Actions ─────────────────────────────────────────────────────────────
  const handleLogout = () => { logout(); navigate("/signin"); };

  const updateStatut = async (id: string, statut: StatutReclamation) => {
    try {
      if (statut === "en_cours") await complaintService.update(id, { status: "IN_PROGRESS" });
      else if (statut === "resolue") await complaintService.resolve(id, note || "Problème résolu");
      setTaches((prev) => prev.map((t) => t.id === id ? { ...t, statut } : t));
      setSelected((prev) => prev?.id === id ? { ...prev, statut } : prev);
      setNote("");
    } catch (e) { console.error(e); }
  };

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
        name: profileForm.name, email: profileForm.email,
        phone: profileForm.phone, department: profileForm.department,
        specialite: profileForm.specialite,
      };
      if (profileForm.newPassword) {
        payload.currentPassword = profileForm.currentPassword;
        payload.newPassword     = profileForm.newPassword;
      }
      await userService.update(user!.id,payload);
      setProfileMessage({ type: "success", text: "Profil mis à jour avec succès !" });
      setEditingProfile(false);
      setProfileForm((p) => ({ ...p, currentPassword: "", newPassword: "", confirmPassword: "" }));
    } catch {
      setProfileMessage({ type: "error", text: "Erreur réseau. Veuillez réessayer." });
    } finally {
      setProfileSaving(false);
    }
  };

  // ── Dérivés ─────────────────────────────────────────────────────────────
  const stats = {
    total:    taches.length,
    en_cours: taches.filter((t) => t.statut === "en_cours").length,
    resolue:  taches.filter((t) => t.statut === "resolue").length,
    urgente:  taches.filter((t) => t.priorite === "urgente" || t.priorite === "haute").length,
    nouvelle: taches.filter((t) => t.statut === "nouvelle").length,
  };
  const agendaItems   = buildAgenda(taches);
  const agendaParJour = agendaItems.reduce<Record<string, typeof agendaItems>>((acc, item) => {
    (acc[item.dateLabel] ??= []).push(item);
    return acc;
  }, {});

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 overflow-hidden">
      <Sidebar
        open={sidebarOpen} onClose={() => setSidebarOpen(false)}
        view={view} setView={setView} onLogout={handleLogout}
        profileForm={profileForm} userName={user?.name} userEmail={user?.email}
        stats={stats} agendaCount={agendaItems.length}
      />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Header
          view={view} onMenuOpen={() => setSidebarOpen(true)}
          profileForm={profileForm} userName={user?.name}
          urgentCount={stats.urgente}
        />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {view === "dashboard" && (
            <ViewDashboard
              stats={stats} taches={taches} agendaItems={agendaItems}
              loading={loading} profileForm={profileForm} userName={user?.name}
              onSelectTache={setSelected} onSelectAgenda={setSelected}
              onNavigateReclamations={() => setView("reclamations")}
              onNavigateAgenda={() => setView("agenda")}
            />
          )}
          {view === "reclamations" && (
            <ViewReclamations
              taches={taches} loading={loading}
              filter={filter} onFilter={setFilter}
              onSelect={setSelected} onUpdateStatut={updateStatut}
            />
          )}
          {view === "agenda" && (
            <ViewAgenda
              agendaItems={agendaItems} agendaParJour={agendaParJour}
              loading={loading} onSelect={setSelected}
            />
          )}
          {view === "profile" && (
            <ViewProfile
              profileForm={profileForm} setProfileForm={setProfileForm}
              userId={user?.id} userEmail={user?.email}
              editing={editingProfile} setEditing={setEditingProfile}
              saving={profileSaving} message={profileMessage}
              onSave={handleSaveProfile} onLogout={handleLogout}
              stats={stats}
            />
          )}
        </main>
      </div>
      {selected && (
        <ReclamationModal
          selected={selected} note={note}
          onNoteChange={setNote} onClose={() => setSelected(null)}
          onUpdateStatut={updateStatut}
        />
      )}
    </div>
  );
};

export default TechnicianDashboard;