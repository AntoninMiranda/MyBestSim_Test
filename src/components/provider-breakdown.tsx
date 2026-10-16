import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
              <TableHead>{t.provider}</TableHead>
              <TableHead className="w-full">
                <span className="sr-only">{t.count}</span>
              </TableHead>
              <TableHead className="text-right">{t.count}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {providers.map(({ provider, count }) => (
              <TableRow key={provider}>
                <TableCell className="font-medium">{provider}</TableCell>
                <TableCell aria-hidden="true">
                  <div className="h-2.5 rounded-full bg-bar" style={{ width: `${(count / max) * 100}%` }} />
                </TableCell>
                <TableCell className="text-right tabular-nums">{fmt.int(count)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
