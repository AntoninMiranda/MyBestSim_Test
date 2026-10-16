import type { LucideIcon } from "lucide-react";
import { ArrowLeftRight, ArrowUpRight, CardSim, Euro, Wifi } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { Stats } from "@/domain/stats";
import { interpolate } from "@/i18n/config";
import type { Dictionary } from "@/i18n/types";
import type { Formatters } from "@/lib/format";
import { cn } from "@/lib/utils";

const TONES = {
  brand: "bg-brand-soft text-primary",
  warning: "bg-warning-soft text-warning",
  success: "bg-success-soft text-success",
} as const;

interface KpiCardProps {
  icon: LucideIcon;
  tone: keyof typeof TONES;
  label: string;
  value: string;
  hint: string;
  compact?: boolean;
}

function KpiCard({ icon: Icon, tone, label, value, hint, compact }: KpiCardProps) {
  return (
    <Card className="rounded-[20px] shadow-[0_14px_40px_rgb(15_23_42/6%)] ring-border [--card-spacing:--spacing(5.5)]">
      <CardContent className="flex flex-col gap-2">
        <span className={cn("flex size-10 items-center justify-center rounded-[12px]", TONES[tone])}>
          <Icon className="size-5" aria-hidden="true" />
        </span>
        <span className="text-sm text-muted-foreground">{label}</span>
        <span
          className={cn(
            "font-bold tracking-tight tabular-nums",
            compact ? "text-[28px] leading-tight" : "text-[34px] leading-none",
          )}
        >
          {value}
        </span>
        <span className="text-[13px] leading-normal text-subtle-foreground">{hint}</span>
      </CardContent>
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
    <section aria-labelledby="kpi-title" className="flex flex-col gap-4">
      <h2 id="kpi-title" className="text-[22px] font-semibold">
        {t.sectionTitle}
      </h2>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(210px,1fr))] gap-4">
        <KpiCard icon={CardSim} tone="brand" label={t.total.label} value={fmt.int(stats.totalProducts)} hint={t.total.hint} />
        <KpiCard
          icon={ArrowUpRight}
          tone="warning"
          label={t.above100.label}
          value={fmt.int(stats.productsAbove100)}
          hint={interpolate(t.above100.hint, { pct: fmt.pct(share) })}
        />
        <KpiCard
          icon={ArrowLeftRight}
          tone="brand"
          compact
          label={t.priceRange.label}
          value={
            stats.priceMin && stats.priceMax
              ? `${fmt.eur(stats.priceMin.priceEur)} → ${fmt.eur(stats.priceMax.priceEur)}`
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
          icon={Wifi}
          tone="success"
          label={t.meanData.label}
          value={stats.meanDataGb === null ? empty : fmt.gb(stats.meanDataGb)}
          hint={interpolate(t.meanData.hint, {
            limited: fmt.int(stats.limitedCount),
            unlimited: fmt.int(stats.unlimitedCount),
          })}
        />
        <KpiCard
          icon={Euro}
          tone="brand"
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
