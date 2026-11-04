import Link from "next/link";
import { notFound } from "next/navigation";
import { getSupabaseAdmin, supabaseFromCookies } from "@/lib/supabase-server";
import { Nav } from "@/components/nav";
import { SynttaritTabs } from "../../tabs";
import { PageEditor } from "../page-editor";

export const dynamic = "force-dynamic";

export default async function SisaltoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const sb = await supabaseFromCookies();
  const {
    data: { user },
  } = await sb.auth.getUser();

  let initial = null;
  if (id !== "uusi") {
    if (!/^[0-9a-f-]{36}$/.test(id)) notFound();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (getSupabaseAdmin() as any).from("synttarit_pages").select("*").eq("id", id).maybeSingle();
    if (!data) notFound();
    initial = data;
  }

  return (
    <>
      <Nav email={user?.email} />
      <main className="mx-auto max-w-3xl space-y-6 px-4 py-8">
        <div>
          <Link href="/synttarit/sisallot" className="text-sm text-muted-foreground hover:underline">
            ← Kaikki sisällöt
          </Link>
          <h1 className="mt-1 text-2xl font-semibold">{initial ? initial.title : "Uusi sisältö"}</h1>
        </div>
        <SynttaritTabs active="sisallot" />
        <PageEditor initial={initial} />
      </main>
    </>
  );
}
