import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";
import SignInForm from "../../components/auth/SignInForm";

export default function SignIn() {
  return (
    <>
      <PageMeta
        title="Connexion | LabHub — ENIC Carthage"
        description="Connectez-vous à la plateforme de gestion des réclamations de laboratoire de l'ENIC Carthage."
      />
      <AuthLayout>
        <SignInForm />
      </AuthLayout>
    </>
  );
}
