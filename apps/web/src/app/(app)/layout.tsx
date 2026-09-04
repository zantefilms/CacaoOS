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

  return (
    <div className="flex flex-1 flex-col pb-24">
      {children}
      <TabBar />
    </div>
  );
}
