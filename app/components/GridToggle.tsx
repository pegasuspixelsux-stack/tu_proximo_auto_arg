"use client";

import { Columns2, Square } from "lucide-react";
import { useEffect, useState } from "react";

export type GridCols = 1 | 2;

const STORAGE_KEY = "grid-columns";

/** Mobile grid density: 1 column by default, remembered across visits. */
export function useGridCols(): [GridCols, (cols: GridCols) => void] {
  const [cols, setCols] = useState<GridCols>(1);

  useEffect(() => {
    try {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- reads the saved choice once after hydration
      if (localStorage.getItem(STORAGE_KEY) === "2") setCols(2);
    } catch {}
  }, []);

  function choose(next: GridCols) {
    setCols(next);
    try {
      localStorage.setItem(STORAGE_KEY, String(next));
    } catch {}
  }

  return [cols, choose];
}

const OPTIONS = [
  { cols: 1, label: "Una columna", Icon: Square },
  { cols: 2, label: "Dos columnas", Icon: Columns2 },
] as const;

/** Segmented 1 / 2 column switch; only shown below the sm breakpoint. Sits in the search row. */
export default function GridToggle({
  cols,
  onChange,
}: {
  cols: GridCols;
  onChange: (cols: GridCols) => void;
}) {
  return (
    <div
      role="group"
      aria-label="Columnas de la grilla"
      data-testid="grid-toggle"
      className="flex h-12 shrink-0 items-center sm:hidden"
    >
      <div className="inline-flex rounded-full border border-line p-0.5">
        {OPTIONS.map(({ cols: value, label, Icon }) => (
          <button
            key={value}
            type="button"
            aria-label={label}
            aria-pressed={cols === value}
            data-testid={`grid-${value}`}
            onClick={() => onChange(value)}
            className={`flex h-9 w-11 items-center justify-center rounded-full transition-[background-color,color,transform] duration-150 active:scale-95 ${
              cols === value ? "bg-inverse text-on-inverse" : "text-muted hover:text-fg"
            }`}
          >
            <Icon className="h-4 w-4" strokeWidth={1.75} aria-hidden />
          </button>
        ))}
      </div>
    </div>
  );
}
