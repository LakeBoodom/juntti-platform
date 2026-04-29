"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { SITE_COOKIE } from "./sites";

const ONE_YEAR = 60 * 60 * 24 * 365;

export async function setSiteSlugAction(slug: string) {
  const store = await cookies();
  store.set(SITE_COOKIE, slug, {
    path: "/",
    httpOnly: false, // luetaan myös client-puolelta jos tarve
    sameSite: "lax",
    maxAge: ONE_YEAR,
  });
  revalidatePath("/", "layout");
}
