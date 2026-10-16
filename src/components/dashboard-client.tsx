"use client";

import { useState } from "react";
import { Competitiveness } from "@/components/competitiveness";
import { ImportPanel } from "@/components/import-panel";
import { KpiCards } from "@/components/kpi-cards";
import { PriceGrid } from "@/components/price-grid";
import { ProviderBreakdown } from "@/components/provider-breakdown";
import { QualityPanel } from "@/components/quality-panel";
import { mergeByProvider } from "@/domain/merge";
import { parseFiles } from "@/domain/parse";
import { computeStats, type Stats } from "@/domain/stats";
import type { ImportReport, Product } from "@/domain/types";
import { interpolate, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/types";
import {
  fetchSampleFiles,
  MAX_FILE_SIZE_MB,
  readUploadedFiles,
} from "@/infrastructure/read-uploaded-files";
import { getFormatters } from "@/lib/format";

interface DashboardClientProps {
  initialStats: Stats;
  initialReport: ImportReport;
  sampleFileNames: string[];
  dict: Dictionary;
  locale: Locale;
}

interface ImportedState {
  products: Product[];
  stats: Stats;
  report: ImportReport;
  updatedProviders: string[];
}

/**
 * Seul composant avec l'état du catalogue. Le premier affichage utilise les statistiques calculées au build ;
 * les lignes brutes ne sont chargées qu'au premier import, pour fusionner avec les fichiers déposés.
 */
export function DashboardClient({ initialStats, initialReport, sampleFileNames, dict, locale }: DashboardClientProps) {
  const [imported, setImported] = useState<ImportedState | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const fmt = getFormatters(locale);
  const t = dict.import;
  const stats = imported?.stats ?? initialStats;

  async function handleFiles(fileList: FileList) {
    setLoading(true);
    setErrors([]);
    try {
      const upload = await readUploadedFiles(fileList);
      setErrors(upload.errors.map((e) => interpolate(t.errors[e.kind], { file: e.file, max: MAX_FILE_SIZE_MB })));
      if (upload.files.length === 0) return;

      let base = imported?.products;
      if (!base) {
        try {
          base = parseFiles(await fetchSampleFiles(sampleFileNames)).products;
        } catch {
          setErrors((prev) => [...prev, t.errors.sampleFailed]);
          return;
        }
      }
      const { products: importedProducts, report } = parseFiles(upload.files);
      const products = mergeByProvider(base, importedProducts);
      setImported({
        products,
        stats: computeStats(products),
        report,
        updatedProviders: [...new Set(importedProducts.map((p) => p.provider))],
      });
    } finally {
      setLoading(false);
    }
  }

  const sourceLabel = imported
    ? interpolate(t.sourceImported, {
        files: fmt.int(imported.report.files.length),
        providers: imported.updatedProviders.join(", ") || dict.common.empty,
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
        <div id="quality" className="flex scroll-mt-6 *:flex-1">
          <QualityPanel report={imported?.report ?? initialReport} dict={dict} fmt={fmt} />
        </div>
      </div>
    </div>
  );
}
