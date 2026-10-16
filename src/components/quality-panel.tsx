"use client";

import { useState } from "react";
import { CircleCheck, TriangleAlert } from "lucide-react";
import { SectionCard } from "@/components/section-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { ImportReport } from "@/domain/types";
import { interpolate } from "@/i18n/config";
import type { Dictionary } from "@/i18n/types";
import type { Formatters } from "@/lib/format";

const VISIBLE_FILES = 5;
const MAX_LISTED_REJECTS = 20;
const HEAD = "px-4 text-xs uppercase tracking-wide text-muted-foreground";

interface QualityPanelProps {
  report: ImportReport;
  dict: Dictionary;
  fmt: Formatters;
}

function Tile({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col gap-0.5 rounded-[16px] bg-secondary p-4">
      <span className="text-[26px] font-bold tabular-nums">{value}</span>
      <span className="text-[13px] text-muted-foreground">{label}</span>
    </div>
  );
}

export function QualityPanel({ report, dict, fmt }: QualityPanelProps) {
  const t = dict.quality;
  const [showAll, setShowAll] = useState(false);
  const valid = report.files.reduce((sum, f) => sum + f.valid, 0);
  const rejects = report.rejected;
  const files = showAll ? report.files : report.files.slice(0, VISIBLE_FILES);

  const status =
    rejects.length === 0 ? (
      <Badge className="h-auto gap-1.5 rounded-full bg-success-soft px-3 py-1.5 text-[13px] font-semibold text-success">
        <CircleCheck aria-hidden="true" />
        {t.statusOk}
      </Badge>
    ) : (
      <Badge className="h-auto gap-1.5 rounded-full bg-warning-soft px-3 py-1.5 text-[13px] font-semibold text-warning">
        <TriangleAlert aria-hidden="true" />
        {interpolate(t.statusWarn, { n: fmt.int(rejects.length) })}
      </Badge>
    );

  return (
    <SectionCard id="quality-title" title={t.title} action={status} className="scroll-mt-6">
      <div className="grid grid-cols-3 gap-3">
        <Tile value={fmt.int(report.files.length)} label={t.filesRead} />
        <Tile value={fmt.int(valid)} label={t.validRows} />
        <Tile value={fmt.int(rejects.length)} label={t.rejectedRows} />
      </div>

      {rejects.length > 0 && (
        <div className="flex flex-col gap-2">
          <h3 className="text-sm font-semibold">{t.rejectsTitle}</h3>
          <div className="overflow-hidden rounded-[16px] border border-brand-line">
            <Table>
              <TableHeader className="bg-secondary">
                <TableRow className="hover:bg-transparent">
                  <TableHead className={HEAD}>{t.file}</TableHead>
                  <TableHead className={HEAD}>{t.line}</TableHead>
                  <TableHead className={HEAD}>{t.reason}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rejects.slice(0, MAX_LISTED_REJECTS).map((r, i) => (
                  <TableRow key={`${i}:${r.file}:${r.line}`} className="border-brand-soft hover:bg-transparent">
                    <TableCell className="px-4">{r.file}</TableCell>
                    <TableCell className="px-4 tabular-nums">{r.line}</TableCell>
                    <TableCell className="px-4">
                      <Badge variant="destructive">{t.reasons[r.reason]}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {rejects.length > MAX_LISTED_REJECTS && (
            <p className="text-sm text-muted-foreground">
              {interpolate(t.more, { n: fmt.int(rejects.length - MAX_LISTED_REJECTS) })}
            </p>
          )}
        </div>
      )}

      <div className="overflow-hidden rounded-[16px] border border-brand-line">
        <Table id="quality-files">
          <TableHeader className="bg-secondary">
            <TableRow className="hover:bg-transparent">
              <TableHead className={HEAD}>{t.file}</TableHead>
              <TableHead className={`${HEAD} text-right`}>{t.valid}</TableHead>
              <TableHead className={`${HEAD} text-right`}>{t.rejected}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {files.map((f, i) => (
              <TableRow key={`${i}:${f.file}`} className="border-brand-soft hover:bg-transparent">
                <TableCell className="px-4 font-medium">{f.file}</TableCell>
                <TableCell className="px-4 text-right tabular-nums">{fmt.int(f.valid)}</TableCell>
                <TableCell className="px-4 text-right text-subtle-foreground tabular-nums">{fmt.int(f.rejected)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {report.files.length > VISIBLE_FILES && (
          <div className="border-t border-brand-soft px-2 py-1">
            <Button
              variant="link"
              className="font-semibold"
              aria-expanded={showAll}
              aria-controls="quality-files"
              onClick={() => setShowAll((v) => !v)}
            >
              {showAll ? t.showLess : interpolate(t.showAll, { n: fmt.int(report.files.length) })}
            </Button>
          </div>
        )}
      </div>
    </SectionCard>
  );
}
