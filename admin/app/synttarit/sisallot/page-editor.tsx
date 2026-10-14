"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  PAGE_TYPES,
  slugify,
  synttaritBetaUrl,
  type Block,
  type PageType,
  type Status,
} from "@/lib/synttarit";
import { saveSynttaritPage, type SynttaritPageInput } from "./actions";
import { BlockEditor } from "./block-editor";

type Row = SynttaritPageInput & { id: string; published_at: string | null };

const lines = (s: string) => s.split("\n");
const unlines = (xs: string[] | null | undefined) => (xs ?? []).join("\n");

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function PageEditor({ initial }: { initial: Row | null }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const [type, setType] = useState<PageType>(initial?.type ?? "opas");
  const [title, setTitle] = useState(initial?.title ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(!!initial);
  const [age, setAge] = useState(initial?.age != null ? String(initial.age) : "");
  const [eyebrow, setEyebrow] = useState(initial?.eyebrow ?? "");
  const [ingress, setIngress] = useState(initial?.ingress ?? "");
  const [heroUrl, setHeroUrl] = useState(initial?.hero_image_url ?? "");
  const [heroCredit, setHeroCredit] = useState(initial?.hero_image_credit ?? "");
  const [chips, setChips] = useState(unlines(initial?.meta_chips));
  const [related, setRelated] = useState(unlines(initial?.related_slugs));
  const [seoTitle, setSeoTitle] = useState(initial?.seo_title ?? "");
  const [metaDesc, setMetaDesc] = useState(initial?.meta_description ?? "");
  const [status, setStatus] = useState<Status>(initial?.status ?? "draft");
  const [body, setBody] = useState<Block[]>(Array.isArray(initial?.body) ? initial.body : []);

  function onTitle(v: string) {
    setTitle(v);
    if (!slugTouched) setSlug(slugify(v));
  }

  function save(nextStatus: Status = status) {
    setError(null);
    setSaved(false);
    const input: SynttaritPageInput = {
      type,
      slug: slug.replace(/^\/+|\/+$/g, ""),
      age: age.trim() === "" ? null : Number(age),
      title,
      seo_title: seoTitle,
      meta_description: metaDesc,
      eyebrow,
      ingress,
      hero_image_url: heroUrl,
      hero_image_credit: heroCredit,
      meta_chips: lines(chips),
      body,
      related_slugs: lines(related).map((s) => s.trim().replace(/^\/+/, "")),
      status: nextStatus,
    };
    startTransition(async () => {
      const res = await saveSynttaritPage(initial?.id ?? null, input);
      if (!res.ok) {
        setError(res.error ?? "Tuntematon virhe");
        return;
      }
      setStatus(nextStatus);
      setSaved(true);
      if (!initial) router.replace(`/synttarit/sisallot/${res.id}`);
      else router.refresh();
    });
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        save();
      }}
      className="space-y-8"
    >
      <section className="space-y-4 rounded-lg border p-4">
        <h2 className="font-semibold">Perustiedot</h2>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Sivun tyyppi">
            <Select value={type} onValueChange={(v) => setType(v as PageType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PAGE_TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Ikä" hint="Merkkivuosi- ja onnittelusivuille, esim. 50. Muuten tyhjä.">
            <Input type="number" min={0} max={120} value={age} onChange={(e) => setAge(e.target.value)} />
          </Field>
        </div>
        <Field label="Otsikko *">
          <Input value={title} onChange={(e) => onTitle(e.target.value)} placeholder="esim. Mitä lahjaksi 30-vuotiaalle?" required />
        </Field>
        <Field
          label="Osoite *"
          hint="Muodostuu otsikosta. Lasten synttärien ja juhlaoppaiden alasivuilla esim. lasten-synttarit/5-vuotiaat."
        >
          <div className="flex items-center gap-1">
            <span className="text-sm text-muted-foreground">/</span>
            <Input
              value={slug}
              onChange={(e) => {
                setSlugTouched(true);
                setSlug(e.target.value.toLowerCase());
              }}
              required
            />
          </div>
        </Field>
        <Field label="Yläteksti" hint="Pieni teksti otsikon yläpuolella, esim. LAHJAOPAS">
          <Input value={eyebrow} onChange={(e) => setEyebrow(e.target.value)} />
        </Field>
        <Field label="Ingressi">
          <Textarea value={ingress} onChange={(e) => setIngress(e.target.value)} rows={3} />
        </Field>
        <Field label="Metatietolaput" hint="Yksi lappu per rivi, esim. 10 vierasta">
          <Textarea value={chips} onChange={(e) => setChips(e.target.value)} rows={3} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Pääkuvan URL">
            <Input type="url" value={heroUrl} onChange={(e) => setHeroUrl(e.target.value)} placeholder="https://…" />
          </Field>
          <Field label="Pääkuvan lähde ja lisenssi">
            <Input value={heroCredit} onChange={(e) => setHeroCredit(e.target.value)} placeholder="esim. Kuva: … / CC BY 4.0" />
          </Field>
        </div>
        {heroUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={heroUrl} alt="" className="h-32 w-full object-cover grayscale" onError={(e) => (e.currentTarget.style.display = "none")} />
        )}
      </section>

      <section className="space-y-4 rounded-lg border p-4">
        <h2 className="font-semibold">Sisältö</h2>
        <BlockEditor blocks={body} onChange={setBody} />
      </section>

      <section className="space-y-4 rounded-lg border p-4">
        <h2 className="font-semibold">Hakukoneet ja linkitys</h2>
        <Field label={`Hakukoneotsikko (${seoTitle.length}/60)`} hint="Jos tyhjä, käytetään otsikkoa.">
          <Input value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} />
        </Field>
        <Field label={`Kuvaus hakutuloksiin (${metaDesc.length}/155)`}>
          <Textarea value={metaDesc} onChange={(e) => setMetaDesc(e.target.value)} rows={2} />
        </Field>
        <Field label="Jatka tästä -linkit" hint="Toisten sivujen osoitteet, yksi per rivi, esim. 50-vuotissynttarit">
          <Textarea value={related} onChange={(e) => setRelated(e.target.value)} rows={3} />
        </Field>
      </section>

      {error && (
        <p className="rounded-md border border-destructive/40 bg-destructive/10 p-2 text-sm text-destructive">{error}</p>
      )}

      <div className="sticky bottom-0 flex flex-wrap items-center gap-3 border-t bg-background py-3">
        <span
          className={`rounded px-2 py-0.5 text-xs font-semibold ${
            status === "published" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
          }`}
        >
          {status === "published" ? "Julkaistu" : "Luonnos"}
        </span>
        <Button type="submit" variant="outline" disabled={pending}>
          {pending ? "Tallennetaan…" : "Tallenna"}
        </Button>
        {status === "draft" ? (
          <Button type="button" disabled={pending} onClick={() => save("published")}>
            Tallenna ja julkaise
          </Button>
        ) : (
          <Button type="button" variant="outline" disabled={pending} onClick={() => save("draft")}>
            Palauta luonnokseksi
          </Button>
        )}
        {initial && slug && (
          <a
            href={`${synttaritBetaUrl()}/${slug}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-sm text-blue-700 hover:underline"
          >
            Esikatsele betassa <ExternalLink className="h-3 w-3" />
          </a>
        )}
        {saved && !pending && <span className="text-sm text-green-700">Tallennettu</span>}
      </div>
    </form>
  );
}
