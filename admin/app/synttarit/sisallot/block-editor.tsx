"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp, ChevronDown, ChevronRight, Plus, Trash2 } from "lucide-react";
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
import { BLOCK_TYPES, blockSummary, emptyBlock, type Block, type BlockType } from "@/lib/synttarit";

function F({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <Label className="text-xs">{label}</Label>
      {children}
    </div>
  );
}

/** Lohkokohtaiset kentät. `set` yhdistää muutoksen lohkoon. */
function BlockFields({ block, set }: { block: Block; set: (patch: Partial<Block>) => void }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const p = set as (patch: any) => void;
  switch (block.type) {
    case "heading":
      return (
        <F label="Väliotsikko">
          <Input value={block.text} onChange={(e) => p({ text: e.target.value })} />
        </F>
      );
    case "paragraph":
      return (
        <F label="Teksti">
          <Textarea value={block.text} onChange={(e) => p({ text: e.target.value })} rows={5} />
        </F>
      );
    case "tip":
      return (
        <>
          <F label="Otsikko (vapaaehtoinen)">
            <Input value={block.title ?? ""} onChange={(e) => p({ title: e.target.value })} />
          </F>
          <F label="Vinkki">
            <Textarea value={block.text} onChange={(e) => p({ text: e.target.value })} rows={3} />
          </F>
        </>
      );
    case "quote":
      return (
        <>
          <F label="Lainaus">
            <Textarea value={block.text} onChange={(e) => p({ text: e.target.value })} rows={3} />
          </F>
          <F label="Lähde (vapaaehtoinen)">
            <Input value={block.source ?? ""} onChange={(e) => p({ source: e.target.value })} />
          </F>
        </>
      );
    case "checklist":
      return (
        <>
          <F label="Otsikko (vapaaehtoinen)">
            <Input value={block.title ?? ""} onChange={(e) => p({ title: e.target.value })} />
          </F>
          <F label="Kohdat, yksi per rivi">
            <Textarea
              value={block.items.join("\n")}
              onChange={(e) => p({ items: e.target.value.split("\n") })}
              rows={5}
            />
          </F>
        </>
      );
    case "table": {
      const rows = block.rows;
      const cols = rows[0]?.length ?? 0;
      const setCell = (r: number, c: number, v: string) =>
        p({ rows: rows.map((row, i) => (i === r ? row.map((x, j) => (j === c ? v : x)) : row)) });
      return (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">Ensimmäinen rivi on otsikkorivi.</p>
          <div className="space-y-1 overflow-x-auto">
            {rows.map((row, r) => (
              <div key={r} className="flex gap-1">
                {row.map((cell, c) => (
                  <Input
                    key={c}
                    value={cell}
                    onChange={(e) => setCell(r, c, e.target.value)}
                    className={r === 0 ? "font-semibold" : ""}
                  />
                ))}
                {rows.length > 2 && (
                  <Button type="button" variant="ghost" size="sm" aria-label="Poista rivi"
                    onClick={() => p({ rows: rows.filter((_, i) => i !== r) })}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                )}
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => p({ rows: [...rows, Array(cols).fill("")] })}>
              + Rivi
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={() => p({ rows: rows.map((row) => [...row, ""]) })}>
              + Sarake
            </Button>
            {cols > 1 && (
              <Button type="button" variant="outline" size="sm" onClick={() => p({ rows: rows.map((row) => row.slice(0, -1)) })}>
                − Sarake
              </Button>
            )}
          </div>
        </div>
      );
    }
    case "tietoniekka":
      return (
        <>
          <F label="Otsikko">
            <Input value={block.title} onChange={(e) => p({ title: e.target.value })} placeholder="esim. Pelaa 1990-luvun visa" />
          </F>
          <F label="Teksti (vapaaehtoinen)">
            <Input value={block.text ?? ""} onChange={(e) => p({ text: e.target.value })} />
          </F>
          <F label="Linkki Tietoniekkaan">
            <Input type="url" value={block.url} onChange={(e) => p({ url: e.target.value })} placeholder="https://tietoniekka.fi/visa/…" />
          </F>
          <p className="text-xs text-muted-foreground">Sivulla näkyy automaattisesti &quot;Avautuu Tietoniekassa&quot;.</p>
        </>
      );
    case "gift_idea":
      return (
        <div className="grid grid-cols-2 gap-3">
          <F label="Numero">
            <Input type="number" min={1} value={block.number} onChange={(e) => p({ number: Number(e.target.value) || 1 })} />
          </F>
          <F label="Hintaluokka">
            <Input value={block.price_band ?? ""} onChange={(e) => p({ price_band: e.target.value })} placeholder="esim. 20–50 €" />
          </F>
          <div className="col-span-2">
            <F label="Lahjaidea *">
              <Input value={block.title} onChange={(e) => p({ title: e.target.value })} placeholder="esim. Vinyylilevysoitin" />
            </F>
          </div>
          <div className="col-span-2">
            <F label="Kenelle">
              <Input value={block.for_whom ?? ""} onChange={(e) => p({ for_whom: e.target.value })} />
            </F>
          </div>
          <div className="col-span-2">
            <F label="Miksi tämä">
              <Textarea value={block.why ?? ""} onChange={(e) => p({ why: e.target.value })} rows={3} />
            </F>
          </div>
          <div className="col-span-2">
            <F label="Tee siitä henkilökohtainen">
              <Textarea value={block.make_it_yours ?? ""} onChange={(e) => p({ make_it_yours: e.target.value })} rows={2} />
            </F>
          </div>
          <div className="col-span-2">
            <F label="Kuvan URL">
              <Input type="url" value={block.image_url ?? ""} onChange={(e) => p({ image_url: e.target.value })} />
            </F>
          </div>
          <F label="Kumppani">
            <Input value={block.partner ?? ""} onChange={(e) => p({ partner: e.target.value })} />
          </F>
          <F label="Kumppanilinkki">
            <Input type="url" value={block.partner_url ?? ""} onChange={(e) => p({ partner_url: e.target.value })} />
          </F>
          <p className="col-span-2 text-xs text-muted-foreground">Kumppanitiedot tallentuvat, mutta ne eivät näy betassa.</p>
        </div>
      );
    case "ad":
      return <p className="text-sm text-muted-foreground">Mainospaikka. Näkyy sivulla vasta, kun mainokset kytketään päälle.</p>;
  }
}

export function BlockEditor({ blocks, onChange }: { blocks: Block[]; onChange: (b: Block[]) => void }) {
  const [open, setOpen] = useState<number | null>(null);
  const [newType, setNewType] = useState<BlockType>("paragraph");

  const label = (t: BlockType) => BLOCK_TYPES.find((x) => x.value === t)?.label ?? t;

  function move(i: number, dir: -1 | 1) {
    const j = i + dir;
    if (j < 0 || j >= blocks.length) return;
    const next = [...blocks];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
    if (open === i) setOpen(j);
    else if (open === j) setOpen(i);
  }

  function remove(i: number) {
    if (!confirm(`Poistetaanko lohko "${label(blocks[i].type)}"?`)) return;
    onChange(blocks.filter((_, k) => k !== i));
    setOpen(null);
  }

  function add() {
    onChange([...blocks, emptyBlock(newType, blocks)]);
    setOpen(blocks.length);
  }

  return (
    <div className="space-y-2">
      {blocks.length === 0 && (
        <p className="rounded-md border border-dashed p-4 text-center text-sm text-muted-foreground">
          Ei vielä lohkoja. Lisää ensimmäinen alta.
        </p>
      )}
      {blocks.map((b, i) => (
        <div key={i} className="rounded-md border">
          <div className="flex items-center gap-2 px-3 py-2">
            <button
              type="button"
              className="flex min-w-0 flex-1 items-center gap-2 text-left"
              onClick={() => setOpen(open === i ? null : i)}
            >
              {open === i ? <ChevronDown className="h-4 w-4 shrink-0" /> : <ChevronRight className="h-4 w-4 shrink-0" />}
              <span className="shrink-0 rounded bg-muted px-1.5 py-0.5 text-xs font-medium">{label(b.type)}</span>
              <span className="truncate text-sm text-muted-foreground">{blockSummary(b) || "(tyhjä)"}</span>
            </button>
            <Button type="button" variant="ghost" size="sm" aria-label="Siirrä ylös" disabled={i === 0} onClick={() => move(i, -1)}>
              <ArrowUp className="h-4 w-4" />
            </Button>
            <Button type="button" variant="ghost" size="sm" aria-label="Siirrä alas" disabled={i === blocks.length - 1} onClick={() => move(i, 1)}>
              <ArrowDown className="h-4 w-4" />
            </Button>
            <Button type="button" variant="ghost" size="sm" aria-label="Poista lohko" onClick={() => remove(i)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
          {open === i && (
            <div className="space-y-3 border-t p-3">
              <BlockFields
                block={b}
                set={(patch) => onChange(blocks.map((x, k) => (k === i ? ({ ...x, ...patch } as Block) : x)))}
              />
            </div>
          )}
        </div>
      ))}

      <div className="flex items-center gap-2 pt-2">
        <div className="w-56">
          <Select value={newType} onValueChange={(v) => setNewType(v as BlockType)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {BLOCK_TYPES.map((t) => (
                <SelectItem key={t.value} value={t.value}>
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button type="button" variant="outline" onClick={add}>
          <Plus className="mr-1 h-4 w-4" /> Lisää lohko
        </Button>
      </div>
    </div>
  );
}
