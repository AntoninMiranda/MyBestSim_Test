import type { LucideIcon } from "lucide-react";
import { ArrowLeftRight, ArrowUpRight, CardSim, Euro, Wifi } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { Stats } from "@/domain/stats";
import { interpolate } from "@/i18n/config";
import type { Dictionary } from "@/i18n/types";
import type { Formatters } from "@/lib/format";
import { cn } from "@/lib/utils";

const TONES = {
  blue: "border-blue-line bg-blue-soft text-primary",
  danger: "border-danger-line bg-danger-soft text-danger",
  success: "border-success-line bg-success-soft text-success",
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
    <Card
      className={cn(
        "rounded-[12px] border border-border shadow-[0_1px_3px_rgb(0_0_0/5%)] ring-0 [--card-spacing:--spacing(5)]",
        "transition-[transform,border-color] duration-300 hover:border-bar motion-safe:hover:-translate-y-1",
      )}
    >
      <CardContent className="flex flex-col gap-2">
        <span className={cn("flex size-10 items-center justify-center rounded-[8px] border", TONES[tone])}>
          <Icon className="size-5" aria-hidden="true" />
        </span>
        <span className="text-sm font-semibold text-muted-foreground">{label}</span>
        <span
          className={cn(
            "font-extrabold tracking-tight text-navy tabular-nums",
            compact ? "text-[28px] leading-tight" : "text-[34px] leading-none",
          )}
        >
          {value}
        </span>
        <span className="text-[13px] leading-normal text-muted-foreground">{hint}</span>
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
      <h2 id="kpi-title" className="text-[22px] font-extrabold text-navy">
        {t.sectionTitle}
      </h2>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(210px,1fr))] gap-4">
        <KpiCard icon={CardSim} tone="blue" label={t.total.label} value={fmt.int(stats.totalProducts)} hint={t.total.hint} />
        <KpiCard
          icon={ArrowUpRight}
          tone="danger"
          label={t.above100.label}
          value={fmt.int(stats.productsAbove100)}
          hint={interpolate(t.above100.hint, { pct: fmt.pct(share) })}
        />
        <KpiCard
          icon={ArrowLeftRight}
          tone="blue"
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
          tone="blue"
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
