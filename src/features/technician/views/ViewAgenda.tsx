import type { AgendaItem, Priorite, Reclamation } from "../types";
import { statutColors, statutLabels, prioriteColors, prioriteAgendaCouleur } from "../constants";
import { Icons } from "../Icons";

interface Props {
  agendaItems:  AgendaItem[];
  agendaParJour: Record<string, AgendaItem[]>;
  loading:      boolean;
  onSelect:     (r: Reclamation) => void;
}

export const ViewAgenda = ({ agendaItems, agendaParJour, loading, onSelect }: Props) => (
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

    {!loading && Object.keys(agendaParJour).length === 0 && (
      <div className="rounded-xl bg-white dark:bg-boxdark p-12 text-center border border-stroke dark:border-strokedark">
        <p className="text-5xl mb-3">📅</p>
        <p className="text-gray-600 dark:text-gray-300 font-medium">Aucune intervention planifiée</p>
        <p className="text-gray-400 text-xs mt-1">Les réclamations assignées apparaîtront ici automatiquement.</p>
      </div>
    )}

    {!loading && Object.entries(agendaParJour).map(([dateLabel, items]) => {
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
              <div key={item.id} className="flex items-start gap-4 px-6 py-4 hover:bg-gray-50 dark:hover:bg-white/5 cursor-pointer transition-colors" onClick={() => onSelect(item.reclamation)}>
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