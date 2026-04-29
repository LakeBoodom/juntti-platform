"use client";

import { useTransition } from "react";
import { setSiteSlugAction } from "@/lib/site-actions";

type Site = { id: string; slug: string; name: string };

export function SiteSwitcher({
  sites,
  currentSlug,
}: {
  sites: Site[];
  currentSlug: string;
}) {
  const [pending, startTransition] = useTransition();

  function onChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const slug = e.target.value;
    startTransition(async () => {
      await setSiteSlugAction(slug);
    });
  }

  return (
    <select
      value={currentSlug}
      onChange={onChange}
      disabled={pending}
      className="rounded-md border border-input bg-background px-3 py-1.5 text-sm font-medium ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50"
      aria-label="Vaihda site"
    >
      {sites.map((s) => (
        <option key={s.id} value={s.slug}>
          {s.name}
        </option>
      ))}
    </select>
  );
}
