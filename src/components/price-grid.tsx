import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Stats } from "@/domain/stats";
import { interpolate } from "@/i18n/config";
import type { Dictionary } from "@/i18n/types";
import type { Formatters } from "@/lib/format";

interface PriceGridProps {
  grid: Stats["priceGrid"];
  dict: Dictionary;
  fmt: Formatters;
}

/** Carte de chaleur : l'intensité suit le prix, et la valeur reste écrite dans chaque cellule. */
export function PriceGrid({ grid, dict, fmt }: PriceGridProps) {
  const t = dict.grid;
  const prices = grid.rows.flatMap((r) => r.medianPrices.filter((p): p is number => p !== null));
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const intensity = (price: number) => (max === min ? 50 : 10 + ((price - min) / (max - min)) * 60);

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <h2>{t.title}</h2>
        </CardTitle>
        <CardDescription>{t.subtitle}</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead scope="col">{t.data}</TableHead>
              {grid.validities.map((days) => (
                <TableHead key={days} scope="col" className="text-right">
                  {interpolate(dict.common.days, { n: days })}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {grid.rows.map((row) => (
              <TableRow key={row.dataGb ?? "unlimited"} className="hover:bg-transparent">
                <TableHead scope="row" className="font-medium text-foreground">
                  {row.dataGb === null ? dict.common.unlimited : fmt.gb(row.dataGb)}
                </TableHead>
                {row.medianPrices.map((price, i) => (
                  <TableCell
                    key={grid.validities[i]}
                    className="text-right font-medium tabular-nums"
                    style={
                      price === null
                        ? undefined
                        : { backgroundColor: `color-mix(in oklch, var(--bar) ${intensity(price)}%, transparent)` }
                    }
                  >
                    {price === null ? dict.common.empty : fmt.eur(price)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
