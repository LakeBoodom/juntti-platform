"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { TableHead } from "@/components/ui/table";

/**
 * Klikattava taulukon otsikko joka muuttaa URL:in ?sort=col&dir=asc|desc.
 * Server-component lukee searchParams ja järjestää datan vastaavasti.
 */
export function SortableHeader({
  children,
  column,
  className,
}: {
  children: React.ReactNode;
  column: string;
  className?: string;
}) {
  const params = useSearchParams();
  const currentSort = params.get("sort");
  const currentDir = params.get("dir") ?? "asc";
  const isActive = currentSort === column;
  const nextDir = isActive && currentDir === "asc" ? "desc" : "asc";

  // Säilytä muut paramit
  const next = new URLSearchParams(params.toString());
  next.set("sort", column);
  next.set("dir", nextDir);

  return (
    <TableHead className={className}>
      <Link
        href={`?${next.toString()}`}
        className="inline-flex items-center gap-1 hover:text-foreground"
        scroll={false}
      >
        {children}
        {isActive ? (
          currentDir === "asc" ? (
            <ArrowUp className="h-3 w-3" />
          ) : (
            <ArrowDown className="h-3 w-3" />
          )
        ) : (
          <ArrowUpDown className="h-3 w-3 opacity-40" />
        )}
      </Link>
    </TableHead>
  );
}
