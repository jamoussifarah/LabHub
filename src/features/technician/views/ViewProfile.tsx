import type { ProfileForm } from "../types";
import { Icons }            from "../Icons";

interface Stats { total: number; resolue: number; en_cours: number; }

interface Props {
  profileForm:     ProfileForm;
  setProfileForm:  React.Dispatch<React.SetStateAction<ProfileForm>>;
  userId?:         string;
  userEmail?:      string;
  editing:         boolean;
  setEditing:      (v: boolean) => void;
  saving:          boolean;
  message:         { type: "success" | "error"; text: string } | null;
  onSave:          () => void;
  onLogout:        () => void;
  stats:           Stats;
}

export const ViewProfile = ({
  profileForm, setProfileForm, userId, userEmail,
  editing, setEditing, saving, message, onSave, onLogout, stats,
}: Props) => (
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
          <button onClick={() => { setEditing(!editing); }}
            className="flex items-center gap-1.5 rounded-xl border border-stroke dark:border-strokedark px-3 py-1.5 text-xs text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
            <Icons.Edit /> {editing ? "Annuler" : "Modifier"}
          </button>
        </div>

        {message && (
          <div className={`mb-4 rounded-xl px-4 py-3 text-sm font-medium ${message.type === "success" ? "bg-green-50 text-green-700 border border-green-200 dark:bg-green-900/20 dark:text-green-400" : "bg-red-50 text-red-700 border border-red-200 dark:bg-red-900/20 dark:text-red-400"}`}>
            {message.type === "success" ? "✅ " : "❌ "}{message.text}
          </div>
        )}

        {editing ? (
          <div className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Informations personnelles</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {([
                { label: "Nom complet", key: "name",       type: "text",  placeholder: "Votre nom" },
                { label: "Email",       key: "email",      type: "email", placeholder: "votre@email.com" },
                { label: "Téléphone",   key: "phone",      type: "tel",   placeholder: "+216 XX XXX XXX" },
                { label: "Département", key: "department", type: "text",  placeholder: "Département" },
                { label: "Spécialité",  key: "specialite", type: "text",  placeholder: "Ex: Electronique" },
              ] as const).map(({ label, key, type, placeholder }) => (
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
              {([
                { label: "Mot de passe actuel",  key: "currentPassword" },
                { label: "Nouveau mot de passe", key: "newPassword" },
                { label: "Confirmer",            key: "confirmPassword" },
              ] as const).map(({ label, key }) => (
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
              <button onClick={onSave} disabled={saving}
                className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-white hover:bg-opacity-90 transition disabled:opacity-60">
                <Icons.Save /> {saving ? "Enregistrement..." : "Enregistrer"}
              </button>
              <button onClick={() => setEditing(false)}
                className="rounded-xl border border-stroke dark:border-strokedark px-5 py-2.5 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition">
                Annuler
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { label: "Email",         value: profileForm.email      || userEmail || "—" },
              { label: "Téléphone",     value: profileForm.phone      || "—" },
              { label: "Rôle",          value: "Technicien" },
              { label: "Établissement", value: "ENIC Carthage" },
              { label: "Département",   value: profileForm.department || "—" },
              { label: "Spécialité",    value: profileForm.specialite || "—" },
              { label: "Statut",        value: "Actif ✅" },
              { label: "ID",            value: `#${userId?.slice(-8) ?? "—"}` },
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

    {/* Statistiques */}
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

    <button onClick={onLogout}
      className="w-full flex items-center justify-center gap-2 rounded-xl border-2 border-red-200 dark:border-red-900/50 py-3 text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
      <Icons.Logout /> Se déconnecter
    </button>
  </div>
);