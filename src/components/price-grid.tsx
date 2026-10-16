import { SectionCard } from "@/components/section-card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Stats } from "@/domain/stats";
import { interpolate } from "@/i18n/config";
import type { Dictionary } from "@/i18n/types";
import type { Formatters } from "@/lib/format";

/** Rampe de la maquette (fond, texte) : le texte passe en blanc sur les teintes foncées pour garder le contraste. */
const RAMP = [
  ["#f0f9ff", "#0f172a"],
  ["#e0f2fe", "#0f172a"],
  ["#bae6fd", "#0f172a"],
  ["#7dd3fc", "#0f172a"],
  ["#38bdf8", "#0f172a"],
  ["#0284c7", "#ffffff"],
  ["#0369a1", "#ffffff"],
  ["#075985", "#ffffff"],
] as const;

const LEGEND = [RAMP[0], RAMP[2], RAMP[4], RAMP[5], RAMP[7]];

/** Échelle logarithmique : les prix vont de ~6 € à ~80 €, une échelle linéaire écraserait les petits forfaits. */
function rampIndex(price: number, min: number, max: number): number {
  if (max <= min) return Math.floor(RAMP.length / 2);
  const t = Math.log(price / min) / Math.log(max / min);
  return Math.min(RAMP.length - 1, Math.floor(t * RAMP.length));
}

interface PriceGridProps {
  grid: Stats["priceGrid"];
  dict: Dictionary;
  fmt: Formatters;
}

/** Carte de chaleur : la couleur suit le prix, et la valeur reste écrite dans chaque cellule. */
export function PriceGrid({ grid, dict, fmt }: PriceGridProps) {
  const t = dict.grid;
  const prices = grid.rows.flatMap((r) => r.medianPrices.filter((p): p is number => p !== null));
  const min = Math.min(...prices);
  const max = Math.max(...prices);

  const legend = (
    <div className="flex items-center gap-2 text-xs text-muted-foreground" aria-hidden="true">
      <span>{t.legendLow}</span>
      <span className="flex gap-0.5">
        {LEGEND.map(([bg]) => (
          <span key={bg} className="h-3 w-[22px] rounded-[3px]" style={{ backgroundColor: bg }} />
        ))}
      </span>
      <span>{t.legendHigh}</span>
    </div>
  );

  return (
    <SectionCard id="grid-title" title={t.title} action={legend} className="[&_[data-slot=card-header]]:items-center">
      <Table className="min-w-[560px] border-separate border-spacing-1.5 text-[15px]">
        <TableHeader className="[&_tr]:border-0">
          <TableRow className="hover:bg-transparent">
            <TableHead scope="col" className="text-[13px] font-medium text-muted-foreground">
              {t.corner}
            </TableHead>
            {grid.validities.map((days) => (
              <TableHead key={days} scope="col" className="text-center text-[13px] font-semibold">
                {interpolate(dict.common.days, { n: days })}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody className="[&_tr]:border-0">
          {grid.rows.map((row) => (
            <TableRow key={row.dataGb ?? "unlimited"} className="hover:bg-transparent">
              <TableHead scope="row" className="text-sm font-semibold text-foreground">
                {row.dataGb === null ? dict.common.unlimited : fmt.gb(row.dataGb)}
              </TableHead>
              {row.medianPrices.map((price, i) => {
                const [bg, fg] = price === null ? ["transparent", "inherit"] : RAMP[rampIndex(price, min, max)];
                return (
                  <TableCell
                    key={grid.validities[i]}
                    className="rounded-xl px-2.5 py-3.5 text-center font-semibold tabular-nums"
                    style={{ backgroundColor: bg, color: fg }}
                  >
                    {price === null ? dict.common.empty : fmt.eur(price)}
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </SectionCard>
  );
}
