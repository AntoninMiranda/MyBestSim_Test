import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Stats } from "@/domain/stats";
import { interpolate } from "@/i18n/config";
import type { Dictionary } from "@/i18n/types";
import type { Formatters } from "@/lib/format";

/** Rampe de bleus du design system (fond, texte) : le texte passe en clair sur les teintes foncées pour garder le contraste. */
const RAMP = [
  ["#EFF6FF", "#1E3A8A"],
  ["#DBEAFE", "#1E3A8A"],
  ["#BFDBFE", "#1E3A8A"],
  ["#93C5FD", "#1E3A8A"],
  ["#4589FF", "#0F1E4D"],
  ["#1E40AF", "#ffffff"],
  ["#1E3A8A", "#ffffff"],
  ["#172554", "#ffffff"],
] as const;

const LEGEND = ["#EFF6FF", "#BFDBFE", "#4589FF", "#1E40AF", "#172554"];

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

  return (
    <section aria-labelledby="grid-title" className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h2 id="grid-title" className="text-xl font-extrabold text-navy">
          {t.title}
        </h2>
        <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground" aria-hidden="true">
          <span>{t.legendLow}</span>
          <span className="flex gap-0.5">
            {LEGEND.map((bg, i) => (
              <span
                key={bg}
                className={i === 0 ? "h-3 w-[22px] rounded-[3px] border border-blue-line" : "h-3 w-[22px] rounded-[3px]"}
                style={{ backgroundColor: bg }}
              />
            ))}
          </span>
          <span>{t.legendHigh}</span>
        </div>
      </div>

      <div className="overflow-hidden rounded-[8px] bg-background shadow-[0_2px_8px_rgb(0_0_0/10%)]">
        <Table className="min-w-[560px] text-[15px]">
          <TableHeader className="bg-navy-gradient [&_tr]:border-0">
            <TableRow className="hover:bg-transparent">
              <TableHead scope="col" className="h-auto px-[18px] py-3.5 text-[13px] font-bold text-white">
                {t.corner}
              </TableHead>
              {grid.validities.map((days) => (
                <TableHead key={days} scope="col" className="h-auto px-[18px] py-3.5 text-center text-[13px] font-bold text-white">
                  {interpolate(dict.common.days, { n: days })}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {grid.rows.map((row) => (
              <TableRow key={row.dataGb ?? "unlimited"} className="border-border hover:bg-secondary">
                <TableHead scope="row" className="px-[18px] py-2 text-sm font-bold text-navy">
                  {row.dataGb === null ? dict.common.unlimited : fmt.gb(row.dataGb)}
                </TableHead>
                {row.medianPrices.map((price, i) => {
                  const [bg, fg] = price === null ? ["transparent", "inherit"] : RAMP[rampIndex(price, min, max)];
                  return (
                    <TableCell key={grid.validities[i]} className="px-2 py-1.5">
                      <span
                        className="block rounded-[8px] p-2.5 text-center font-bold tabular-nums"
                        style={{ backgroundColor: bg, color: fg }}
                      >
                        {price === null ? dict.common.empty : fmt.eur(price)}
                      </span>
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </section>
  );
}
