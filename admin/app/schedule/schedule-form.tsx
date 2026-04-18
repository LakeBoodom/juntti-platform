"use client";

import { useState, useTransition } from "react";
import { Calendar, Eraser } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { scheduleRange, clearScheduleRange } from "./actions";

export type QuizOption = { id: string; title: string; category: string };

function toParts(iso: string): { day: string; month: string; year: string } {
  if (!iso || !/^\d{4}-\d{2}-\d{2}$/.test(iso))
    return { day: "", month: "", year: "" };
  const [y, m, d] = iso.split("-");
  return { day: String(parseInt(d)), month: String(parseInt(m)), year: y };
}

function toIso(day: string, month: string, year: string): string {
  if (!day || !month || !year) return "";
  return `${year.padStart(4, "0")}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
}

function DateFields({
  label,
  day,
  month,
  year,
  onDay,
  onMonth,
  onYear,
}: {
  label: string;
  day: string;
  month: string;
  year: string;
  onDay: (v: string) => void;
  onMonth: (v: string) => void;
  onYear: (v: string) => void;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <div className="grid grid-cols-3 gap-2">
        <Input
          type="number"
          min={1}
          max={31}
          value={day}
          onChange={(e) => onDay(e.target.value)}
          placeholder="Päivä"
          required
        />
        <Input
          type="number"
          min={1}
          max={12}
          value={month}
          onChange={(e) => onMonth(e.target.value)}
          placeholder="Kuukausi"
          required
        />
        <Input
          type="number"
          min={2026}
          max={2030}
          value={year}
          onChange={(e) => onYear(e.target.value)}
          placeholder="Vuosi"
          required
        />
      </div>
    </div>
  );
}

export function ScheduleForm({ quizzes }: { quizzes: QuizOption[] }) {
  const today = new Date().toISOString().slice(0, 10);
  const start = toParts(today);
  const [platform, setPlatform] = useState<"juntti" | "tietovisa">("juntti");
  const [startDay, setStartDay] = useState(start.day);
  const [startMonth, setStartMonth] = useState(start.month);
  const [startYear, setStartYear] = useState(start.year);
  const [endDay, setEndDay] = useState(start.day);
  const [endMonth, setEndMonth] = useState(start.month);
  const [endYear, setEndYear] = useState(start.year);
  const [quizId, setQuizId] = useState<string>("");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    const startDate = toIso(startDay, startMonth, startYear);
    const endDate = toIso(endDay, endMonth, endYear);
    startTransition(async () => {
      const res = await scheduleRange({
        platform,
        startDate,
        endDate,
        quizId,
      });
      if (!res.ok) setError(res.error);
      else setSuccess(`Ajastettu ${res.count} päivää`);
    });
  }

  function clear() {
    setError(null);
    setSuccess(null);
    const startDate = toIso(startDay, startMonth, startYear);
    const endDate = toIso(endDay, endMonth, endYear);
    startTransition(async () => {
      const res = await clearScheduleRange({ platform, startDate, endDate });
      if (!res.ok) setError(res.error);
      else setSuccess(`Tyhjennetty ${res.deleted} riviä`);
    });
  }

  return (
    <form onSubmit={submit} className="space-y-4 rounded-md border p-4">
      <div className="space-y-1.5">
        <Label>Alusta</Label>
        <Select value={platform} onValueChange={(v: any) => setPlatform(v)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="juntti">juntti.com</SelectItem>
            <SelectItem value="tietovisa">tietovisa.fi</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <DateFields
          label="Alkupäivä"
          day={startDay}
          month={startMonth}
          year={startYear}
          onDay={setStartDay}
          onMonth={setStartMonth}
          onYear={setStartYear}
        />
        <DateFields
          label="Loppupäivä (inclusive)"
          day={endDay}
          month={endMonth}
          year={endYear}
          onDay={setEndDay}
          onMonth={setEndMonth}
          onYear={setEndYear}
        />
      </div>

      <div className="space-y-1.5">
        <Label>Visa</Label>
        <Select value={quizId} onValueChange={setQuizId}>
          <SelectTrigger>
            <SelectValue placeholder="Valitse visa" />
          </SelectTrigger>
          <SelectContent>
            {quizzes.length === 0 && (
              <div className="px-2 py-2 text-sm text-muted-foreground">
                Ei julkaistuja visoja — julkaise ensin vähintään yksi.
              </div>
            )}
            {quizzes.map((q) => (
              <SelectItem key={q.id} value={q.id}>
                {q.title}
                <span className="ml-2 text-xs text-muted-foreground">
                  {q.category}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {error && (
        <p className="rounded-md border border-destructive/40 bg-destructive/10 p-2 text-sm text-destructive">
          {error}
        </p>
      )}
      {success && (
        <p className="rounded-md border border-green-600/30 bg-green-600/10 p-2 text-sm text-green-700">
          {success}
        </p>
      )}

      <div className="flex items-center gap-2">
        <Button type="submit" disabled={pending || !quizId}>
          <Calendar /> Ajasta ajanjakso
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={clear}
          disabled={pending}
          title="Poista tältä alustalta kaikki ajastukset tämän ajanjakson sisältä"
        >
          <Eraser /> Tyhjennä ajanjakso
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        Ajastus korvaa aiemmat rivit jos päiville on jo ohjelmoitu visa. Tyhjennys
        poistaa kaikki rivit tältä alustalta ajanjakson sisältä.
      </p>
    </form>
  );
}
