import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { ImportReport } from "@/domain/types";
import { interpolate } from "@/i18n/config";
import type { Dictionary } from "@/i18n/types";
import type { Formatters } from "@/lib/format";

const MAX_LISTED_REJECTS = 20;

interface QualityPanelProps {
  report: ImportReport;
  source: "sample" | "imported";
  dict: Dictionary;
  fmt: Formatters;
}

export function QualityPanel({ report, source, dict, fmt }: QualityPanelProps) {
  const t = dict.quality;
  const valid = report.files.reduce((sum, f) => sum + f.valid, 0);
  const rejects = report.rejected;

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <h2>{t.title}</h2>
        </CardTitle>
        <CardDescription>{source === "sample" ? t.sourceSample : t.sourceImported}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 text-sm">
        <p>
          {interpolate(t.summary, {
            files: fmt.int(report.files.length),
            valid: fmt.int(valid),
            rejected: fmt.int(rejects.length),
          })}
        </p>

        {rejects.length === 0 ? (
          <p className="text-muted-foreground">{t.noRejects}</p>
        ) : (
          <div>
            <h3 className="mb-2 font-medium">{t.rejectsTitle}</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t.file}</TableHead>
                  <TableHead>{t.line}</TableHead>
                  <TableHead>{t.reason}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rejects.slice(0, MAX_LISTED_REJECTS).map((r, i) => (
                  <TableRow key={`${r.file}:${r.line}:${i}`}>
                    <TableCell>{r.file}</TableCell>
                    <TableCell className="tabular-nums">{r.line}</TableCell>
                    <TableCell>
                      <Badge variant="destructive">{t.reasons[r.reason]}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {rejects.length > MAX_LISTED_REJECTS && (
              <p className="mt-2 text-muted-foreground">
                {interpolate(t.more, { n: fmt.int(rejects.length - MAX_LISTED_REJECTS) })}
              </p>
            )}
          </div>
        )}

        <details className="group">
          <summary className="cursor-pointer font-medium">
            {interpolate(t.filesDetail, { n: fmt.int(report.files.length) })}
          </summary>
          <Table className="mt-2">
            <TableHeader>
              <TableRow>
                <TableHead>{t.file}</TableHead>
                <TableHead className="text-right">{t.valid}</TableHead>
                <TableHead className="text-right">{t.rejected}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {report.files.map((f, i) => (
                <TableRow key={`${i}:${f.file}`}>
                  <TableCell>{f.file}</TableCell>
                  <TableCell className="text-right tabular-nums">{fmt.int(f.valid)}</TableCell>
                  <TableCell className="text-right tabular-nums">{fmt.int(f.rejected)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </details>
      </CardContent>
    </Card>
  );
}
