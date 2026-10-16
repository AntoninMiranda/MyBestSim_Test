import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { Stats } from "@/domain/stats";
import { interpolate } from "@/i18n/config";
import type { Dictionary } from "@/i18n/types";
import type { Formatters } from "@/lib/format";

interface KpiCardProps {
  label: string;
  value: string;
  hint: string;
}

function KpiCard({ label, value, hint }: KpiCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardDescription>{label}</CardDescription>
        <CardTitle className="text-2xl font-semibold tabular-nums sm:text-3xl">{value}</CardTitle>
      </CardHeader>
      <CardContent className="text-xs leading-relaxed text-muted-foreground">{hint}</CardContent>
    </Card>
  );
}

interface KpiCardsProps {
  stats: Stats;
  dict: Dictionary;
  fmt: Formatters;
}

export function KpiCards({ stats, dict, fmt }: KpiCardsProps) {
  const t = dict.kpi;
  const empty = dict.common.empty;
  const share = stats.totalProducts ? (stats.productsAbove100 / stats.totalProducts) * 100 : 0;

  return (
    <section aria-labelledby="kpi-title">
      <h2 id="kpi-title" className="sr-only">
        {t.sectionTitle}
      </h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <KpiCard label={t.total.label} value={fmt.int(stats.totalProducts)} hint={t.total.hint} />
        <KpiCard
          label={t.above100.label}
          value={fmt.int(stats.productsAbove100)}
          hint={interpolate(t.above100.hint, { pct: fmt.pct(share) })}
        />
        <KpiCard
          label={t.priceRange.label}
          value={
            stats.priceMin && stats.priceMax
              ? `${fmt.eur(stats.priceMin.priceEur)} – ${fmt.eur(stats.priceMax.priceEur)}`
              : empty
          }
          hint={
            stats.priceMax
              ? interpolate(t.priceRange.hint, {
                  product: stats.priceMax.productName,
                  provider: stats.priceMax.provider,
                })
              : empty
          }
        />
        <KpiCard
          label={t.meanData.label}
          value={stats.meanDataGb === null ? empty : fmt.gb(stats.meanDataGb)}
          hint={interpolate(t.meanData.hint, {
            limited: fmt.int(stats.limitedCount),
            unlimited: fmt.int(stats.unlimitedCount),
          })}
        />
        <KpiCard
          label={t.meanPrice.label}
          value={stats.meanPriceEur === null ? empty : fmt.eur(stats.meanPriceEur)}
          hint={interpolate(t.meanPrice.hint, {
            median: stats.medianPriceEur === null ? empty : fmt.eur(stats.medianPriceEur),
          })}
        />
      </div>
    </section>
  );
}
