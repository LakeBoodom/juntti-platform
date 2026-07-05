"use client";

import { useMemo, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { approvePost, deletePost, updatePostCopy } from "./actions";

export type SocialPostRow = {
  id: string;
  site_id: string;
  platform: "facebook" | "instagram" | "linkedin";
  source_type: "quiz" | "celebrity" | "countdown" | "general";
  source_id: string | null;
  target_date: string;
  template_id: string | null;
  copy_text: string;
  image_url: string | null;
  status: "draft" | "ready" | "scheduled" | "posted" | "failed";
  scheduled_at: string | null;
  posted_at: string | null;
  external_post_id: string | null;
  error_message: string | null;
  created_at: string;
};

const STATUS_TABS: { key: SocialPostRow["status"]; label: string }[] = [
  { key: "draft", label: "Luonnos" },
  { key: "ready", label: "Valmis" },
  { key: "scheduled", label: "Ajastettu" },
  { key: "posted", label: "Julkaistu" },
  { key: "failed", label: "Epäonnistui" },
];

const PLATFORM_LABELS: Record<SocialPostRow["platform"], string> = {
  facebook: "Facebook",
  instagram: "Instagram",
  linkedin: "LinkedIn",
};

const SOURCE_TYPE_LABELS: Record<SocialPostRow["source_type"], string> = {
  quiz: "Visa",
  celebrity: "Synttäri",
  countdown: "Tapahtuma",
  general: "Yleinen",
};

function toDatetimeLocal(iso: string | null, fallbackDate: string): string {
  const d = iso ? new Date(iso) : new Date(`${fallbackDate}T10:00:00`);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours(),
  )}:${pad(d.getMinutes())}`;
}

function PostCard({
  post,
  sourceLabel,
}: {
  post: SocialPostRow;
  sourceLabel: string;
}) {
  const [copyText, setCopyText] = useState(post.copy_text);
  const [scheduledAt, setScheduledAt] = useState(
    toDatetimeLocal(post.scheduled_at, post.target_date),
  );
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [savedMsg, setSavedMsg] = useState<string | null>(null);
  const [delOpen, setDelOpen] = useState(false);

  const dirty = copyText !== post.copy_text;

  function saveCopy() {
    setError(null);
    setSavedMsg(null);
    startTransition(async () => {
      const res = await updatePostCopy(post.id, copyText);
      if (!res.ok) setError(res.error);
      else setSavedMsg("Tallennettu");
    });
  }

  function approve() {
    setError(null);
    startTransition(async () => {
      const res = await approvePost(post.id, scheduledAt, copyText);
      if (!res.ok) setError(res.error);
    });
  }

  function doDelete() {
    startTransition(async () => {
      const res = await deletePost(post.id);
      if (!res.ok) setError(res.error);
      else setDelOpen(false);
    });
  }

  const [y, m, d] = post.target_date.split("-");

  return (
    <div className="flex gap-4 rounded-lg border p-4">
      {/* Kuvan esikatselu */}
      <div className="h-24 w-24 shrink-0 overflow-hidden rounded-md bg-muted">
        {post.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.image_url}
            alt=""
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
            Ei kuvaa
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1 space-y-2">
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <span className="rounded bg-muted px-1.5 py-0.5 font-medium">
            {PLATFORM_LABELS[post.platform]}
          </span>
          <span>{SOURCE_TYPE_LABELS[post.source_type]}</span>
          {sourceLabel && <span className="font-medium text-foreground">{sourceLabel}</span>}
          <span>
            · kohdepäivä {d}.{m}.{y}
          </span>
          {post.status === "failed" && post.error_message && (
            <span className="text-destructive">Virhe: {post.error_message}</span>
          )}
        </div>

        <Textarea
          value={copyText}
          onChange={(e) => {
            setCopyText(e.target.value);
            setSavedMsg(null);
          }}
          rows={2}
          className="text-sm"
        />

        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            className="h-7 px-3 text-xs"
            onClick={saveCopy}
            disabled={pending || !dirty}
          >
            Tallenna teksti
          </Button>

          <label className="ml-2 text-xs text-muted-foreground">Julkaisuaika:</label>
          <Input
            type="datetime-local"
            value={scheduledAt}
            onChange={(e) => setScheduledAt(e.target.value)}
            className="h-7 w-[200px] text-xs"
          />

          {(post.status === "draft" || post.status === "ready") && (
            <Button
              size="sm"
              className="h-7 px-3 text-xs"
              onClick={approve}
              disabled={pending}
            >
              Hyväksy
            </Button>
          )}

          <Button
            size="sm"
            variant="ghost"
            className="h-7 px-3 text-xs text-destructive"
            onClick={() => setDelOpen(true)}
            disabled={pending}
          >
            Poista
          </Button>

          {savedMsg && <span className="text-xs text-green-600">{savedMsg}</span>}
        </div>

        {error && (
          <p className="rounded-md border border-destructive/40 bg-destructive/10 p-2 text-xs text-destructive">
            {error}
          </p>
        )}
      </div>

      <Dialog open={delOpen} onOpenChange={setDelOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Poistetaanko postaus?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">Tätä ei voi perua.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDelOpen(false)}>
              Peruuta
            </Button>
            <Button variant="destructive" onClick={doDelete} disabled={pending}>
              {pending ? "Poistetaan…" : "Poista"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export function PostList({
  posts,
  sourceLabels,
}: {
  posts: SocialPostRow[];
  sourceLabels: Map<string, string>;
}) {
  const [activeTab, setActiveTab] = useState<SocialPostRow["status"]>("draft");

  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const t of STATUS_TABS) c[t.key] = 0;
    for (const p of posts) c[p.status] = (c[p.status] ?? 0) + 1;
    return c;
  }, [posts]);

  const filtered = useMemo(
    () =>
      posts
        .filter((p) => p.status === activeTab)
        .sort((a, b) => (a.target_date < b.target_date ? 1 : -1)),
    [posts, activeTab],
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 border-b pb-2">
        {STATUS_TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={
              activeTab === t.key
                ? "rounded-md bg-foreground px-3 py-1.5 text-sm font-medium text-background"
                : "rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted"
            }
          >
            {t.label} ({counts[t.key] ?? 0})
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
          Ei postauksia tässä tilassa.
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((p) => (
            <PostCard
              key={p.id}
              post={p}
              sourceLabel={
                p.source_id
                  ? sourceLabels.get(`${p.source_type}:${p.source_id}`) ?? ""
                  : ""
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
