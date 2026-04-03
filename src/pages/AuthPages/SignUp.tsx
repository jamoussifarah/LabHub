import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";
import SignUpForm from "../../components/auth/SignUpForm";

export default function SignUp() {
  return (
    <>
      <PageMeta
         title="Inscription | LabHub — ENIC Carthage"
         description="Créez votre compte sur la plateforme LabHub de l'École Nationale des Ingénieurs de Carthage."
      />
      <AuthLayout>
        <SignUpForm />
      </AuthLayout>
    </>
  );
}
