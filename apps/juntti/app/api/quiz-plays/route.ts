// Minimal anonymous analytics endpoint — inserts a quiz_plays row.
// Uses the public anon key; RLS allows INSERT only (no read) per Phase 1.
import { NextResponse, type NextRequest } from "next/server";
import { getPublicSupabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const sb = getPublicSupabase();
    const { error } = await sb.from("quiz_plays").insert({
      quiz_id: body.quiz_id,
      platform: body.platform,
      score: body.score,
      total: body.total,
      session_id: body.session_id,
    });
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message }, { status: 400 });
  }
}
