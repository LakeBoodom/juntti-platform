import Link from "next/link";

const TABS = [
  { key: "sankarit", href: "/synttarit", label: "Päivänsankarit" },
  { key: "sisallot", href: "/synttarit/sisallot", label: "Sisällöt" },
  { key: "onnittelut", href: "/synttarit/onnittelut", label: "Onnittelupankki" },
] as const;

export function SynttaritTabs({ active }: { active: (typeof TABS)[number]["key"] }) {
  return (
    <div className="flex gap-1 border-b">
      {TABS.map((t) => (
        <Link
          key={t.key}
          href={t.href}
          className={
            "border-b-2 px-4 py-2 text-sm font-medium transition-colors " +
            (t.key === active
              ? "border-foreground text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground")
          }
        >
          {t.label}
        </Link>
      ))}
    </div>
  );
}
