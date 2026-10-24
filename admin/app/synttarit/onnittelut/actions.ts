"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseAdmin } from "@juntti/db";
import { RECIPIENTS, TONES, type Recipient, type Status, type Tone } from "@/lib/synttarit";

export type GreetingInput = {
  age: number | null;
  tone: Tone;
  recipient: Recipient;
  text: string;
  sort: number;
  status: Status;
};

export async function saveGreeting(
  id: string | null,
  input: GreetingInput
): Promise<{ ok: boolean; error?: string }> {
  if (!input.text.trim()) return { ok: false, error: "Onnitteluteksti puuttuu" };
  if (!TONES.includes(input.tone)) return { ok: false, error: "Tuntematon sävy" };
  if (!RECIPIENTS.includes(input.recipient)) return { ok: false, error: "Tuntematon vastaanottaja" };
  if (input.age !== null && (!Number.isInteger(input.age) || input.age < 0 || input.age > 120))
    return { ok: false, error: "Ikä on kokonaisluku 0–120 tai tyhjä (yleinen onnittelu)" };

  const row = { ...input, text: input.text.trim(), sort: Number.isFinite(input.sort) ? input.sort : 0 };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const q = (getSupabaseAdmin() as any).from("synttarit_greetings");
  const { error } = id ? await q.update(row).eq("id", id) : await q.insert(row);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/synttarit/onnittelut");
  return { ok: true };
}

export async function setGreetingStatus(id: string, status: Status): Promise<{ ok: boolean; error?: string }> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (getSupabaseAdmin() as any).from("synttarit_greetings").update({ status }).eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/synttarit/onnittelut");
  return { ok: true };
}
