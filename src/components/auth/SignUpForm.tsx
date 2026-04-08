import { useState, FormEvent } from "react";
import { Link, useNavigate } from "react-router";
import { ChevronLeftIcon, EyeCloseIcon, EyeIcon } from "../../icons";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Checkbox from "../form/input/Checkbox";
import { useAuth } from "../../context/AuthContext";  // ← importer le hook

export default function SignUpForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { register } = useAuth();  // ← récupérer register

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!firstName || !lastName || !email || !password || !role) {
      setError("Veuillez remplir tous les champs.");
      return;
    }
    if (!isChecked) {
      setError("Veuillez accepter les conditions d'utilisation.");
      return;
    }

    setLoading(true);
    const result = await register({
      name: `${firstName} ${lastName}`,
      email,
      password,
      role: role.toUpperCase(),
    });
    setLoading(false);

    if (!result.success) {
      setError(result.message || "Erreur lors de la création du compte.");
      return;
    }

    // Redirection selon le rôle
    const saved = localStorage.getItem("reclamation_user");
    const user = saved ? JSON.parse(saved) : null;
    if (user?.role === "ADMIN") navigate("/");
    else if (user?.role === "TECHNICIEN") navigate("/technicien/dashboard");
    else navigate("/signin");
  };

  // ... le reste du JSX est identique (pas de changement)
  return (
    <div className="flex flex-col flex-1 w-full overflow-y-auto lg:w-1/2 no-scrollbar">
      <div className="w-full max-w-md mx-auto mb-5 sm:pt-10">
        <Link to="/" className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
          <ChevronLeftIcon className="size-5" />
          Retour au tableau de bord
        </Link>
      </div>

      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Créer un compte
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Rejoignez LabHub — Gestion des réclamations ENIC Carthage
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="space-y-5">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <Label>Prénom <span className="text-error-500">*</span></Label>
                  <Input type="text" placeholder="Votre prénom"
                    value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                </div>
                <div>
                  <Label>Nom <span className="text-error-500">*</span></Label>
                  <Input type="text" placeholder="Votre nom"
                    value={lastName} onChange={(e) => setLastName(e.target.value)} />
                </div>
              </div>

              <div>
                <Label>Email institutionnel <span className="text-error-500">*</span></Label>
                <Input type="email" placeholder="prenom.nom@enic-carthage.tn"
                  value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>

              <div>
                <Label>Rôle <span className="text-error-500">*</span></Label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                >
                  <option value="">Sélectionnez votre rôle</option>
                  <option value="technicien">Technicien de laboratoire</option>
                  <option value="admin">Administrateur</option>
                </select>
              </div>

              <div>
                <Label>Mot de passe <span className="text-error-500">*</span></Label>
                <div className="relative">
                  <Input placeholder="Créez votre mot de passe"
                    type={showPassword ? "text" : "password"}
                    value={password} onChange={(e) => setPassword(e.target.value)} />
                  <span onClick={() => setShowPassword(!showPassword)}
                    className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2">
                    {showPassword
                      ? <EyeIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                      : <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 size-5" />}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Checkbox className="w-5 h-5" checked={isChecked} onChange={setIsChecked} />
                <p className="inline-block font-normal text-gray-500 dark:text-gray-400">
                  J'accepte les{" "}
                  <span className="text-gray-800 dark:text-white/90">Conditions d'utilisation</span>
                  {" "}et la{" "}
                  <span className="text-gray-800 dark:text-white">Politique de confidentialité</span>
                </p>
              </div>

              {error && (
                <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="flex items-center justify-center w-full px-4 py-3 text-sm font-medium text-white transition rounded-lg bg-brand-500 shadow-theme-xs hover:bg-brand-600 disabled:opacity-60"
              >
                {loading ? "Création en cours..." : "Créer mon compte"}
              </button>
            </div>
          </form>

          <div className="mt-5">
            <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400">
              Déjà un compte ?{" "}
              <Link to="/signin" className="text-brand-500 hover:text-brand-600 dark:text-brand-400">
                Se connecter
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}