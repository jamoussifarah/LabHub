import type { Reclamation, StatutReclamation } from "../types";
import { statutColors, statutLabels, prioriteColors, prioriteBar } from "../constants";
import { Icons } from "../Icons";

interface Props {
  selected:     Reclamation;
  note:         string;
  onNoteChange: (v: string) => void;
  onClose:      () => void;
  onUpdateStatut: (id: string, statut: StatutReclamation) => Promise<void>;
}

export const ReclamationModal = ({ selected, note, onNoteChange, onClose, onUpdateStatut }: Props) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" onClick={onClose}>
    <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-boxdark shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
      <div className={`h-1.5 w-full ${prioriteBar[selected.priorite]}`} />

      {/* Header */}
      <div className="px-6 py-5 border-b border-stroke dark:border-strokedark flex items-start justify-between gap-3">
        <div>
          <p className="font-mono text-xs text-gray-400 mb-1">{selected.numero}</p>
          <h3 className="text-lg font-semibold text-black dark:text-white">{selected.titre}</h3>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 mt-1 flex-shrink-0"><Icons.Close /></button>
      </div>

      {/* Body */}
      <div className="px-6 py-5 space-y-4 max-h-[60vh] overflow-y-auto">
        {selected.photoUrl && (
          <img src={selected.photoUrl} alt="photo" className="w-full h-48 object-cover rounded-xl border border-gray-200" />
        )}
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Client",      value: selected.client },
            { label: "Date",        value: selected.dateCreation },
            { label: "Catégorie",   value: selected.categorie },
            { label: "Machine",     value: selected.machine     ?? "—" },
            { label: "Laboratoire", value: selected.labName     ?? "—" },
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
            <textarea
              value={note}
              onChange={(e) => onNoteChange(e.target.value)}
              placeholder="Décrivez votre intervention..."
              rows={3}
              className="w-full rounded-xl border border-stroke dark:border-strokedark bg-transparent px-4 py-3 text-sm text-black dark:text-white outline-none focus:border-primary resize-none"
            />
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-stroke dark:border-strokedark flex gap-2">
        {selected.statut === "nouvelle" && (
          <button onClick={() => onUpdateStatut(selected.id, "en_cours")}
            className="flex-1 rounded-xl bg-primary py-2.5 text-sm font-medium text-white hover:bg-opacity-90 transition">
            ▶ Démarrer l'intervention
          </button>
        )}
        {selected.statut === "en_cours" && (
          <button onClick={() => onUpdateStatut(selected.id, "resolue")}
            className="flex-1 rounded-xl bg-green-500 py-2.5 text-sm font-medium text-white hover:bg-green-600 transition flex items-center justify-center gap-2">
            <Icons.Check /> Marquer comme résolu
          </button>
        )}
        <button onClick={onClose}
          className="rounded-xl border border-stroke dark:border-strokedark px-4 py-2.5 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition">
          Fermer
        </button>
      </div>
    </div>
  </div>
);