import type { View, ProfileForm } from "../types";
import { Icons }                  from "../Icons";

const PAGE_LABELS: Record<View, string> = {
  dashboard:    "Tableau de bord",
  reclamations: "Réclamations",
  agenda:       "Agenda",
  profile:      "Mon profil",
};

interface Props {
  view:          View;
  onMenuOpen:    () => void;
  profileForm:   ProfileForm;
  userName?:     string;
  urgentCount:   number;
}

export const Header = ({ view, onMenuOpen, profileForm, userName, urgentCount }: Props) => {
  const displayName = profileForm.name || userName || "T";
  return (
    <header className="sticky top-0 z-10 bg-white dark:bg-boxdark border-b border-stroke dark:border-strokedark px-4 lg:px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button onClick={onMenuOpen} className="lg:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100">
          <Icons.Menu />
        </button>
        <div>
          <h1 className="text-base font-semibold text-black dark:text-white">{PAGE_LABELS[view]}</h1>
          <p className="text-xs text-gray-500 hidden sm:block">
            {new Date().toLocaleDateString("fr-FR", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button className="relative p-2 rounded-lg text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/5">
          <Icons.Bell />
          {urgentCount > 0 && <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500" />}
        </button>
        <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary to-blue-400 flex items-center justify-center font-bold text-white text-sm">
          {displayName.charAt(0).toUpperCase()}
        </div>
      </div>
    </header>
  );
};