import { useState, FormEvent } from "react";
import { Link, useNavigate } from "react-router";
import { EyeCloseIcon, EyeIcon } from "../../icons";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Checkbox from "../form/input/Checkbox";
import Button from "../ui/button/Button";
import { useAuth } from "../../context/AuthContext";

export default function SignInForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setIsChecked]       = useState(false);
  const [email, setEmail]               = useState("");
  const [password, setPassword]         = useState("");
  const [error, setError]               = useState("");
  const [loading, setLoading]           = useState(false);

  const { login } = useAuth();
  const navigate  = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await login(email, password);

    setLoading(false);

    if (!result.success) {
      setError(result.message || "Email ou mot de passe incorrect.");
      console.log("❌ Échec, message affiché :", result.message);
      return;
    }
const user = JSON.parse(localStorage.getItem("reclamation_user") || "null");


if (!user) {
  console.warn("⚠️ Aucun utilisateur trouvé");
  navigate("/signin");
  return;
}

if (user.role === "ADMIN") {
  navigate("/dashboard");
} else if (user.role === "TECHNICIEN") {
  navigate("/technicien/dashboard");
} else {
  console.warn("⚠️ Rôle inconnu");
  navigate("/signin");
}
  };

  return (
    <div className="flex flex-col flex-1 items-center justify-center min-h-screen bg-white dark:bg-gray-900 px-6">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-brand-500 mb-4">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path d="M9 3H5C3.9 3 3 3.9 3 5V9C3 10.1 3.9 11 5 11H9C10.1 11 11 10.1 11 9V5C11 3.9 10.1 3 9 3Z" fill="white"/>
              <path d="M19 3H15C13.9 3 13 3.9 13 5V9C13 10.1 13.9 11 15 11H19C20.1 11 21 10.1 21 9V5C21 3.9 20.1 3 19 3Z" fill="white" opacity="0.7"/>
              <path d="M9 13H5C3.9 13 3 13.9 3 15V19C3 20.1 3.9 21 5 21H9C10.1 21 11 20.1 11 19V15C11 13.9 10.1 13 9 13Z" fill="white" opacity="0.7"/>
              <path d="M19 13H15C13.9 13 13 13.9 13 15V19C13 20.1 13.9 21 15 21H19C20.1 21 21 20.1 21 19V15C21 13.9 20.1 13 19 13Z" fill="white" opacity="0.4"/>
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">LabHub</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            École Nationale des Ingénieurs de Carthage
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Connexion</h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Accédez à votre espace de gestion
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="space-y-5">
              <div>
                <Label>Email <span className="text-error-500">*</span></Label>
                <Input
                  type="email"
                  placeholder="votre@reclamation.tn"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div>
                <Label>Mot de passe <span className="text-error-500">*</span></Label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <span
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                  >
                    {showPassword
                      ? <EyeIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                      : <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                    }
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Checkbox checked={isChecked} onChange={setIsChecked} />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Rester connecté</span>
                </div>
                <Link to="/reset-password" className="text-sm text-brand-500 hover:text-brand-600 dark:text-brand-400">
                  Mot de passe oublié ?
                </Link>
              </div>

              {error && (
                <div className="flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
                  <svg className="size-4 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd"/>
                  </svg>
                  {error}
                </div>
              )}

              <Button className="w-full" size="sm" disabled={loading}>
                {loading ? "Connexion en cours..." : "Se connecter"}
              </Button>
            </div>
          </form>
        </div>

        <p className="mt-6 text-sm text-center text-gray-500 dark:text-gray-400">
          Pas encore de compte ?{" "}
          <Link to="/signup" className="text-brand-500 hover:text-brand-600 font-medium">
            Créer un compte
          </Link>
        </p>
      </div>
    </div>
  );
}