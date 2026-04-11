import type { View, ProfileForm } from "../types";
import type { AgendaItem }        from "../types";
import { Icons }                  from "../Icons";

interface Props {
  open:        boolean;
  onClose:     () => void;
  view:        View;
  setView:     (v: View) => void;
  onLogout:    () => void;
  profileForm: ProfileForm;
  userName?:   string;
  userEmail?:  string;
  stats:       { total: number; urgente: number };
  agendaCount: number;
}

const navItems: { key: View; label: string; Icon: () => React.ReactElement }[] = [
  { key: "dashboard",    label: "Tableau de bord", Icon: Icons.Dashboard },
  { key: "reclamations", label: "Réclamations",    Icon: Icons.Reclamation },
  { key: "agenda",       label: "Agenda",          Icon: Icons.Agenda },
  { key: "profile",      label: "Mon profil",      Icon: Icons.Profile },
];

export const Sidebar = ({ open, onClose, view, setView, onLogout, profileForm, userName, userEmail, stats, agendaCount }: Props) => {
  const displayName  = profileForm.name  || userName  || "T";
  const displayEmail = profileForm.email || userEmail || "";

  return (
    <>
      {open && <div className="fixed inset-0 z-20 bg-black/50 lg:hidden" onClick={onClose} />}
      <aside className={`fixed top-0 left-0 z-30 h-full w-72 bg-white dark:bg-boxdark border-r border-stroke dark:border-strokedark flex flex-col transition-transform duration-300 ${open ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 lg:static lg:z-auto`}>

        {/* Logo */}
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
          <button onClick={onClose} className="lg:hidden text-gray-500"><Icons.Close /></button>
        </div>

        {/* Avatar */}
        <div className="px-6 py-4 border-b border-stroke dark:border-strokedark">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-blue-400 flex items-center justify-center font-bold text-white text-sm">
                {displayName.charAt(0).toUpperCase()}
              </div>
              <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-white dark:border-boxdark" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-black dark:text-white truncate">{displayName}</p>
              <p className="text-xs text-gray-500 truncate">{displayEmail}</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
          {navItems.map(({ key, label, Icon }) => (
            <button key={key} onClick={() => { setView(key); onClose(); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all active:scale-95 ${view === key ? "bg-primary/10 text-primary border border-primary/20 shadow-sm" : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 border border-transparent"}`}>
              <span className={view === key ? "text-primary" : ""}><Icon /></span>
              <span className={view === key ? "text-primary font-semibold" : ""}>{label}</span>
              {key === "reclamations" && stats.total > 0 && (
                <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-semibold">{stats.total}</span>
              )}
              {key === "agenda" && agendaCount > 0 && (
                <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-600 font-semibold">{agendaCount}</span>
              )}
            </button>
          ))}
        </nav>

        {/* Logout */}
        <div className="px-4 py-4 border-t border-stroke dark:border-strokedark">
          <button onClick={onLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
            <Icons.Logout /> Déconnexion
          </button>
        </div>
      </aside>
    </>
  );
};