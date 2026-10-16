import { Info } from "lucide-react";
import { SectionCard } from "@/components/section-card";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
    <SectionCard id="competitiveness-title" title={t.title} subtitle={t.subtitle}>
      <ul className="flex gap-[18px] text-[13px] text-muted-foreground" aria-hidden="true">
        <li className="inline-flex items-center gap-1.5">
          <span className="size-3 rounded-sm bg-cheaper" />
          {t.legendCheaper}
        </li>
        <li className="inline-flex items-center gap-1.5">
          <span className="size-3 rounded-sm bg-pricier" />
          {t.legendPricier}
        </li>
      </ul>

      <Table>
        <TableHeader className="sr-only">
          <TableRow>
            <TableHead>{t.provider}</TableHead>
            <TableHead />
            <TableHead>{t.gap}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="[&_tr]:border-0">
          {competitiveness.map(({ provider, medianGapPct }) => {
            const width = Math.max((Math.abs(medianGapPct) / maxGap) * 50, 0.6);
            const cheaper = medianGapPct < 0;
            return (
              <TableRow key={provider} className="hover:bg-transparent">
                <TableCell className="w-28 max-w-28 truncate py-1 pl-0 font-medium">{provider}</TableCell>
                <TableCell className="w-full py-1" aria-hidden="true">
                  <div className="relative h-3.5 rounded bg-secondary">
                    <div className="absolute -inset-y-[3px] left-1/2 w-px bg-slate-400" />
                    <div
                      className={cn("absolute inset-y-0 rounded", cheaper ? "bg-cheaper" : "bg-pricier")}
                      style={{ left: `${cheaper ? 50 - width : 50}%`, width: `${width}%` }}
                    />
                  </div>
                </TableCell>
                <TableCell className="py-1 pr-0 text-right font-semibold tabular-nums">
                  {fmt.signedPct(medianGapPct)}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {competitiveness.length > 0 && (
        <Alert className="mt-auto rounded-2xl border-0 bg-success-soft px-[18px] py-4 text-success-foreground">
          <Info className="text-success" aria-hidden="true" />
          <AlertDescription className="text-sm leading-relaxed text-success-foreground">
            <p>
              <strong>{interpolate(t.insightStrong, { max: fmt.pct(displayedMax) })}</strong> {t.insight}
            </p>
          </AlertDescription>
        </Alert>
      )}
    </SectionCard>
  );
}
