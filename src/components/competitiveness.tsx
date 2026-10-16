import { Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Stats } from "@/domain/stats";
import { interpolate } from "@/i18n/config";
import type { Dictionary } from "@/i18n/types";
import type { Formatters } from "@/lib/format";
import { cn } from "@/lib/utils";

interface CompetitivenessProps {
  competitiveness: Stats["competitiveness"];
  dict: Dictionary;
  fmt: Formatters;
}

/** Barres divergentes autour de 0 : à gauche moins cher que le marché, à droite plus cher. */
export function Competitiveness({ competitiveness, dict, fmt }: CompetitivenessProps) {
  const t = dict.competitiveness;
  const maxGap = Math.max(0.1, ...competitiveness.map((c) => Math.abs(c.medianGapPct)));
  // Arrondi au demi-point supérieur pour un message lisible (ex. « ±1,5 % »).
  const displayedMax = Math.ceil(maxGap * 2) / 2;

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <h2>{t.title}</h2>
        </CardTitle>
        <CardDescription>{t.subtitle}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {competitiveness.length > 0 && (
          <Alert>
            <Info aria-hidden="true" />
            <AlertDescription>
              {interpolate(t.insight, { max: fmt.pct(displayedMax) })}
            </AlertDescription>
          </Alert>
        )}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t.provider}</TableHead>
              <TableHead className="w-full">
                <span className="sr-only">{t.gap}</span>
              </TableHead>
              <TableHead className="text-right">{t.gap}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {competitiveness.map(({ provider, medianGapPct }) => {
              const width = (Math.abs(medianGapPct) / maxGap) * 50;
              const cheaper = medianGapPct < 0;
              return (
                <TableRow key={provider}>
                  <TableCell className="font-medium">{provider}</TableCell>
                  <TableCell aria-hidden="true">
                    <div className="relative h-2.5">
                      <div className="absolute inset-y-[-4px] left-1/2 w-px bg-border" />
                      <div
                        className={cn(
                          "absolute inset-y-0 rounded-full",
                          cheaper ? "bg-bar-cheaper" : "bg-bar-pricier",
                        )}
                        style={cheaper ? { right: "50%", width: `${width}%` } : { left: "50%", width: `${width}%` }}
                      />
                    </div>
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{fmt.signedPct(medianGapPct)}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        <p className="text-xs leading-relaxed text-muted-foreground">{t.whyNotPerGb}</p>
      </CardContent>
    </Card>
  );
}
