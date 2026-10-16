import { SectionCard } from "@/components/section-card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Stats } from "@/domain/stats";
import type { Dictionary } from "@/i18n/types";
import type { Formatters } from "@/lib/format";

interface ProviderBreakdownProps {
  providers: Stats["providers"];
  dict: Dictionary;
  fmt: Formatters;
}

/** Diagramme en barres rendu en HTML (tableau + barres CSS) : lisible sans JavaScript et par les lecteurs d'écran. */
export function ProviderBreakdown({ providers, dict, fmt }: ProviderBreakdownProps) {
  const t = dict.providers;
  const max = Math.max(1, ...providers.map((p) => p.count));

  return (
    <SectionCard id="providers-title" title={t.title} subtitle={t.subtitle}>
      <Table>
        <TableHeader className="sr-only">
          <TableRow>
            <TableHead>{t.provider}</TableHead>
            <TableHead />
            <TableHead>{t.count}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="[&_tr]:border-0">
          {providers.map(({ provider, count }) => (
            <TableRow key={provider} className="hover:bg-transparent">
              <TableCell className="w-28 max-w-28 truncate py-1 pl-0 font-medium">{provider}</TableCell>
              <TableCell className="w-full py-1" aria-hidden="true">
                <div className="h-3.5 overflow-hidden rounded-full bg-brand-soft">
                  <div className="h-full rounded-full bg-brand" style={{ width: `${(count / max) * 100}%` }} />
                </div>
              </TableCell>
              <TableCell className="py-1 pr-0 text-right font-semibold tabular-nums">{fmt.int(count)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </SectionCard>
  );
}
