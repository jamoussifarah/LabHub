import type { Reclamation, StatutReclamation } from "../types";
import { statutColors, statutLabels, prioriteColors, prioriteBar } from "../constants";

interface Props {
  taches:       Reclamation[];
  loading:      boolean;
  filter:       "toutes" | StatutReclamation;
  onFilter:     (f: "toutes" | StatutReclamation) => void;
  onSelect:     (r: Reclamation) => void;
  onUpdateStatut: (id: string, statut: StatutReclamation) => Promise<void>;
}

export const ViewReclamations = ({ taches, loading, filter, onFilter, onSelect, onUpdateStatut }: Props) => {
  const filtered = filter === "toutes" ? taches : taches.filter((t) => t.statut === filter);
  return (
    <div className="space-y-5">
      {/* Filtres */}
      <div className="flex flex-wrap gap-2">
        {(["toutes", "nouvelle", "en_cours", "resolue", "fermee"] as const).map((f) => {
          const count = f === "toutes" ? taches.length : taches.filter((t) => t.statut === f).length;
          return (
            <button key={f} onClick={() => onFilter(f)}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${filter === f ? "bg-primary text-white border-primary" : "border-stroke dark:border-strokedark text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5"}`}>
              {f === "toutes" ? "Toutes" : statutLabels[f as StatutReclamation]}
              <span className="ml-1.5 opacity-70">({count})</span>
            </button>
          );
        })}
      </div>

      {loading && <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent" /></div>}

      {!loading && filtered.length === 0 && (
        <div className="rounded-xl bg-white dark:bg-boxdark p-12 text-center border border-stroke dark:border-strokedark">
          <p className="text-4xl mb-3">📭</p>
          <p className="text-gray-500 text-sm">Aucune réclamation {filter !== "toutes" ? `"${statutLabels[filter as StatutReclamation]}"` : "assignée"}</p>
        </div>
      )}

      {!loading && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((tache) => (
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
                  {tache.machine && <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-300"><span>🖥️</span><span>{tache.machine}</span></div>}
                  {tache.labName && <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-300"><span>🏛️</span><span>{tache.labName}</span></div>}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs text-gray-400"><span>📅</span><span>{tache.dateCreation}</span></div>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${prioriteColors[tache.priorite]}`}>{tache.priorite}</span>
                  </div>
                </div>
                {tache.photoUrl && (
                  <img src={tache.photoUrl} alt="photo" className="w-full h-28 object-cover rounded-lg mb-3 border border-gray-200 cursor-pointer" onClick={() => onSelect(tache)} />
                )}
                <div className="flex gap-2 mt-auto">
                  <button onClick={() => onSelect(tache)} className="flex-1 rounded-lg border border-stroke dark:border-strokedark py-1.5 text-xs text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">Voir détail</button>
                  {tache.statut === "nouvelle" && (
                    <button onClick={() => onUpdateStatut(tache.id, "en_cours")} className="flex-1 rounded-lg bg-primary py-1.5 text-xs font-medium text-white hover:bg-opacity-90 transition">▶ Démarrer</button>
                  )}
                  {tache.statut === "en_cours" && (
                    <button onClick={() => onSelect(tache)} className="flex-1 rounded-lg bg-green-500 py-1.5 text-xs font-medium text-white hover:bg-green-600 transition">✓ Résoudre</button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};