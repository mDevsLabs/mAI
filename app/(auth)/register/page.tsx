"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useActionState, useEffect, useState } from "react";
import { AuthForm } from "@/components/chat/auth-form";
import { SubmitButton } from "@/components/chat/submit-button";
import { toast } from "@/components/chat/toast";
import { type RegisterActionState, register } from "../actions";

export default function Page() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isSuccessful, setIsSuccessful] = useState(false);

  const [state, formAction] = useActionState<RegisterActionState, FormData>(
    register,
    { status: "idle" }
  );

  const { update: updateSession } = useSession();

  // biome-ignore lint/correctness/useExhaustiveDependencies: router and updateSession are stable refs
  useEffect(() => {
    if (state.status === "user_exists") {
      toast({ type: "error", description: "Le compte existe déjà !" });
    } else if (state.status === "failed") {
      toast({ type: "error", description: "Échec de la création du compte !" });
    } else if (state.status === "invalid_data") {
      toast({
        type: "error",
        description: "Échec de la validation de votre soumission !",
      });
    } else if (state.status === "success") {
      toast({ type: "success", description: "Compte créé !" });
      setIsSuccessful(true);
      updateSession();
      router.refresh();
    }
  }, [state.status]);

  const handleSubmit = (formData: FormData) => {
    setEmail(formData.get("email") as string);
    formAction(formData);
  };

  return (
    <>
      <h1 className="text-2xl font-semibold tracking-tight">Créer un compte</h1>
      <p className="text-sm text-muted-foreground">Commencez gratuitement</p>
      <AuthForm action={handleSubmit} defaultEmail={email}>
        <SubmitButton isSuccessful={isSuccessful}>S'inscrire</SubmitButton>
        <p className="text-center text-[13px] text-muted-foreground">
          {"Vous avez déjà un compte ? "}
          <Link
            className="text-foreground underline-offset-4 hover:underline"
            href="/login"
          >
            Se connecter
          </Link>
        </p>
      </AuthForm>
    </>
  );
}
