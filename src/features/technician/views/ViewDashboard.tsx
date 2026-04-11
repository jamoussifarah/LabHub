import type { Reclamation, AgendaItem, ProfileForm } from "../types";
import { statutColors, statutLabels, prioriteBar }  from "../constants";
import { Icons }                                     from "../Icons";

interface Stats { total: number; en_cours: number; resolue: number; urgente: number; nouvelle: number; }

interface Props {
  stats:        Stats;
  taches:       Reclamation[];
  agendaItems:  AgendaItem[];
  loading:      boolean;
  profileForm:  ProfileForm;
  userName?:    string;
  onSelectTache:     (r: Reclamation) => void;
  onSelectAgenda:    (r: Reclamation) => void;
  onNavigateReclamations: () => void;
  onNavigateAgenda:       () => void;
}

export const ViewDashboard = ({
  stats, taches, agendaItems, loading, profileForm, userName,
  onSelectTache, onSelectAgenda, onNavigateReclamations, onNavigateAgenda,
}: Props) => {
  const displayName = profileForm.name || userName || "Technicien";
  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-primary to-blue-400 p-6 text-white shadow-md">
        <p className="text-sm opacity-80">Bonjour 👋</p>
        <h2 className="text-2xl font-bold mt-1">{displayName}</h2>
        <p className="text-sm opacity-80 mt-1">Technicien de laboratoire — ENIC Carthage</p>
        <div className="mt-4 flex gap-3 flex-wrap">
          {[
            { label: "En cours", value: stats.en_cours },
            { label: "Urgentes", value: stats.urgente },
            { label: "Résolues", value: stats.resolue },
          ].map((s) => (
            <div key={s.label} className="bg-white/20 rounded-xl px-4 py-2 text-center">
              <p className="text-2xl font-bold">{s.value}</p>
              <p className="text-xs opacity-80">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Stat cards */}
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
              <span>{s.icon}</span>
            </div>
            <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Tâches récentes */}
      <div className="rounded-xl bg-white dark:bg-boxdark border border-stroke dark:border-strokedark">
        <div className="flex items-center justify-between px-6 py-4 border-b border-stroke dark:border-strokedark">
          <div>
            <h3 className="font-semibold text-black dark:text-white">Mes tâches récentes</h3>
            <p className="text-xs text-gray-400 mt-0.5">{stats.nouvelle} nouvelle(s) en attente</p>
          </div>
          <button onClick={onNavigateReclamations} className="text-xs text-primary hover:underline">Voir tout →</button>
        </div>
        <div className="divide-y divide-stroke dark:divide-strokedark">
          {loading && <div className="flex justify-center py-10"><div className="animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent" /></div>}
          {!loading && taches.length === 0 && <p className="px-6 py-8 text-center text-sm text-gray-500">Aucune tâche assignée.</p>}
          {!loading && taches.slice(0, 5).map((t) => (
            <div key={t.id} className="flex items-center gap-4 px-6 py-3.5 hover:bg-gray-50 dark:hover:bg-white/5 cursor-pointer transition-colors" onClick={() => onSelectTache(t)}>
              <div className={`h-2.5 w-2.5 rounded-full flex-shrink-0 ${prioriteBar[t.priorite]}`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-black dark:text-white truncate">{t.titre}</p>
                <p className="text-xs text-gray-500">{t.numero}{t.machine ? ` · 🖥️ ${t.machine}` : ""}{t.labName ? ` · 🏛️ ${t.labName}` : ""}</p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${statutColors[t.statut]}`}>{statutLabels[t.statut]}</span>
                <span className="text-xs text-gray-400">{t.dateCreation}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Agenda résumé */}
      <div className="rounded-xl bg-white dark:bg-boxdark border border-stroke dark:border-strokedark">
        <div className="flex items-center justify-between px-6 py-4 border-b border-stroke dark:border-strokedark">
          <div>
            <h3 className="font-semibold text-black dark:text-white">Prochaines interventions</h3>
            <p className="text-xs text-gray-400 mt-0.5">{agendaItems.length} intervention(s)</p>
          </div>
          <button onClick={onNavigateAgenda} className="text-xs text-primary hover:underline">Voir agenda →</button>
        </div>
        <div className="divide-y divide-stroke dark:divide-strokedark">
          {!loading && agendaItems.length === 0 && <p className="px-6 py-6 text-center text-sm text-gray-500">Aucune intervention planifiée.</p>}
          {!loading && agendaItems.slice(0, 4).map((item) => (
            <div key={item.id} className="flex items-center gap-4 px-6 py-3.5 hover:bg-gray-50 dark:hover:bg-white/5 cursor-pointer transition-colors" onClick={() => onSelectAgenda(item.reclamation)}>
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
};