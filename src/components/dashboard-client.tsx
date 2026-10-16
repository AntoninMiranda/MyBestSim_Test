"use client";

import { useRef, useState } from "react";
import { Upload, RotateCcw } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Competitiveness } from "@/components/competitiveness";
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
 * Seul composant avec de l'état. Le premier affichage utilise les statistiques calculées au build ;
 * les lignes brutes ne sont chargées qu'au premier import, pour fusionner avec les fichiers déposés.
 */
export function DashboardClient({ initialStats, initialReport, sampleFileNames, dict, locale }: DashboardClientProps) {
  const [imported, setImported] = useState<ImportedState | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const fmt = getFormatters(locale);
  const t = dict.import;
  const stats = imported?.stats ?? initialStats;

  async function handleFiles(fileList: FileList | null) {
    if (!fileList?.length) return;
    setLoading(true);
    setErrors([]);
    try {
      const upload = await readUploadedFiles(fileList);
      const messages = upload.errors.map((e) =>
        interpolate(t.errors[e.kind], { file: e.file, max: MAX_FILE_SIZE_MB }),
      );
      setErrors(messages);
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
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <p className="text-sm text-muted-foreground">
        {interpolate(dict.header.summary, {
          products: fmt.int(stats.totalProducts),
          providers: fmt.int(stats.providers.length),
          countries: fmt.int(stats.destinations.countries),
          regions: fmt.int(stats.destinations.regions),
        })}
      </p>

      <KpiCards stats={stats} dict={dict} fmt={fmt} />

      <div className="grid gap-6 lg:grid-cols-2">
        <ProviderBreakdown providers={stats.providers} dict={dict} fmt={fmt} />
        <Competitiveness competitiveness={stats.competitiveness} dict={dict} fmt={fmt} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <PriceGrid grid={stats.priceGrid} dict={dict} fmt={fmt} />

        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>
                <h2>{t.title}</h2>
              </CardTitle>
              <CardDescription>{t.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <div className="flex flex-wrap gap-2">
                <input
                  ref={inputRef}
                  id="csv-upload"
                  type="file"
                  accept=".csv,text/csv"
                  multiple
                  className="peer sr-only"
                  onChange={(e) => handleFiles(e.target.files)}
                  disabled={loading}
                />
                <Button asChild>
                  <label
                    htmlFor="csv-upload"
                    aria-disabled={loading}
                    className="cursor-pointer peer-focus-visible:ring-3 peer-focus-visible:ring-ring/50 peer-disabled:pointer-events-none peer-disabled:opacity-50"
                  >
                    <Upload aria-hidden="true" />
                    {loading ? t.loading : t.choose}
                  </label>
                </Button>
                {imported && (
                  <Button variant="outline" onClick={() => setImported(null)} disabled={loading}>
                    <RotateCcw aria-hidden="true" />
                    {t.reset}
                  </Button>
                )}
              </div>
              <div aria-live="polite" className="flex flex-col gap-2">
                {imported && (
                  <p className="text-sm">
                    {interpolate(t.imported, {
                      files: fmt.int(imported.report.files.length),
                      providers: imported.updatedProviders.join(", ") || dict.common.empty,
                    })}
                  </p>
                )}
                {errors.map((message, i) => (
                  <Alert key={`${i}:${message}`} variant="destructive">
                    <AlertDescription>{message}</AlertDescription>
                  </Alert>
                ))}
              </div>
            </CardContent>
          </Card>

          <QualityPanel
            report={imported?.report ?? initialReport}
            source={imported ? "imported" : "sample"}
            dict={dict}
            fmt={fmt}
          />
        </div>
      </div>
    </div>
  );
}
