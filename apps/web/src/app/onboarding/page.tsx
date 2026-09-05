import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { completarOnboarding } from "./actions";
import { OnboardingWizard } from "./onboarding-wizard";

type PageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function OnboardingPage({ searchParams }: PageProps) {
  const { error } = await searchParams;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: perfil } = await supabase
    .from("users")
    .select("onboarding_completado")
    .eq("id", user.id)
    .single();

  if (perfil?.onboarding_completado) {
    redirect("/dashboard");
  }

  return <OnboardingWizard action={completarOnboarding} error={error} />;
}
