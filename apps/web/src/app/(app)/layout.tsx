import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { TabBar } from "@/components/tab-bar";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
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

  if (!perfil?.onboarding_completado) {
    redirect("/onboarding");
  }

  return (
    <div className="flex flex-1 flex-col pb-24">
      {children}
      <TabBar />
    </div>
  );
}
