"use client";

import { useState } from "react";
import { Competitiveness } from "@/components/competitiveness";
import { ImportPanel } from "@/components/import-panel";
import { KpiCards } from "@/components/kpi-cards";
import { PriceGrid } from "@/components/price-grid";
import { ProviderBreakdown } from "@/components/provider-breakdown";
import { QualityPanel } from "@/components/quality-panel";
import { parseFiles } from "@/domain/parse";
import { computeStats, type Stats } from "@/domain/stats";
import type { ImportReport } from "@/domain/types";
import { interpolate, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/types";
import { MAX_FILE_SIZE_MB, readUploadedFiles } from "@/infrastructure/read-uploaded-files";
import { getFormatters } from "@/lib/format";

interface DashboardClientProps {
  initialStats: Stats;
  initialReport: ImportReport;
  dict: Dictionary;
  locale: Locale;
}

interface ImportedState {
  stats: Stats;
  report: ImportReport;
  providerCount: number;
}

/**
 * Seul composant avec l'état du catalogue. Le premier affichage utilise les statistiques des fichiers
 * d'exemple, calculées au build ; un import remplace ce jeu de données par les fichiers déposés.
 */
export function DashboardClient({ initialStats, initialReport, dict, locale }: DashboardClientProps) {
  const [imported, setImported] = useState<ImportedState | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const fmt = getFormatters(locale);
  const t = dict.import;
  const stats = imported?.stats ?? initialStats;

  async function handleFiles(fileList: File[]) {
    setLoading(true);
    setErrors([]);
    try {
      const upload = await readUploadedFiles(fileList);
      setErrors(upload.errors.map((e) => interpolate(t.errors[e.kind], { file: e.file, max: MAX_FILE_SIZE_MB })));
      if (upload.files.length === 0) return;

      // Les fichiers importés remplacent tout le jeu de données : le dashboard analyse uniquement l'import.
      const { products, report } = parseFiles(upload.files);
      const stats = computeStats(products);
      setImported({ stats, report, providerCount: stats.providers.length });
    } finally {
      setLoading(false);
    }
  }

  const sourceLabel = imported
    ? interpolate(t.sourceImported, {
        files: fmt.int(imported.report.files.length),
        providers: fmt.int(imported.providerCount),
      })
    : t.sourceSample;

  return (
    <div className="flex flex-col gap-8">
      <KpiCards stats={stats} dict={dict} fmt={fmt} />

      <div className="grid gap-6 lg:grid-cols-2">
        <ProviderBreakdown providers={stats.providers} dict={dict} fmt={fmt} />
        <Competitiveness competitiveness={stats.competitiveness} dict={dict} fmt={fmt} />
      </div>

      <PriceGrid grid={stats.priceGrid} dict={dict} fmt={fmt} />

      <div className="grid gap-6 lg:grid-cols-2">
        <div id="import" className="flex scroll-mt-6 *:flex-1">
          <ImportPanel
            dict={dict}
            loading={loading}
            sourceLabel={sourceLabel}
            errors={errors}
            canReset={imported !== null}
            onFiles={handleFiles}
            onReset={() => {
              setImported(null);
              setErrors([]);
            }}
          />
        </div>
        <div id="quality" className="flex scroll-mt-6 *:flex-1">
          <QualityPanel report={imported?.report ?? initialReport} dict={dict} fmt={fmt} />
        </div>
      </div>
    </div>
  );
}
