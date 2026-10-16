import type { Product } from "./types";

/** Codes de zones présents dans les fichiers : ce ne sont pas des pays (NA = Amérique du Nord, pas la Namibie). */
export const REGION_CODES = new Set(["EU", "AS", "NA", "WW"]);

export const PRICE_THRESHOLD_EUR = 100;

export interface PricePoint {
  priceEur: number;
  provider: string;
  productName: string;
}

export interface ProviderCount {
  provider: string;
  count: number;
}

export interface ProviderCompetitiveness {
  provider: string;
  /** Écart médian (en %) entre le prix du fournisseur et la médiane du marché pour le même forfait (data × durée). */
  medianGapPct: number;
}

export interface PriceGridRow {
  /** `null` = illimité. */
  dataGb: number | null;
  /** Prix médian par durée, dans l'ordre de `validities` ; `null` si aucun produit. */
  medianPrices: (number | null)[];
}

export interface Stats {
  totalProducts: number;
  productsAbove100: number;
  priceMin: PricePoint | null;
  priceMax: PricePoint | null;
  meanPriceEur: number | null;
  medianPriceEur: number | null;
  meanDataGb: number | null;
  limitedCount: number;
  unlimitedCount: number;
  destinations: { countries: number; regions: number };
  providers: ProviderCount[];
  competitiveness: ProviderCompetitiveness[];
  priceGrid: { validities: number[]; rows: PriceGridRow[] };
}

export function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

const mean = (values: number[]) => values.reduce((sum, v) => sum + v, 0) / values.length;

const toPricePoint = (p: Product): PricePoint => ({
  priceEur: p.priceEur,
  provider: p.provider,
  productName: p.productName,
});

/** Clé d'un forfait équivalent : même quantité de data et même durée. */
const planKey = (p: Product) => `${p.dataGb ?? "unlimited"}|${p.validityDays}`;

function groupBy<K>(products: Product[], key: (p: Product) => K): Map<K, Product[]> {
  const groups = new Map<K, Product[]>();
  for (const p of products) {
    const k = key(p);
    const group = groups.get(k);
    if (group) group.push(p);
    else groups.set(k, [p]);
  }
  return groups;
}

function providerBreakdown(products: Product[]): ProviderCount[] {
  return [...groupBy(products, (p) => p.provider)]
    .map(([provider, items]) => ({ provider, count: items.length }))
    .sort((a, b) => b.count - a.count || a.provider.localeCompare(b.provider));
}

function competitivenessIndex(products: Product[]): ProviderCompetitiveness[] {
  const marketMedian = new Map(
    [...groupBy(products, planKey)].map(([key, items]) => [key, median(items.map((p) => p.priceEur))]),
  );
  return [...groupBy(products, (p) => p.provider)]
    .map(([provider, items]) => ({
      provider,
      medianGapPct: median(items.map((p) => (p.priceEur / marketMedian.get(planKey(p))! - 1) * 100)),
    }))
    .sort((a, b) => a.medianGapPct - b.medianGapPct);
}

function priceGrid(products: Product[]): Stats["priceGrid"] {
  const validities = [...new Set(products.map((p) => p.validityDays))].sort((a, b) => a - b);
  // Les illimités (null) en dernier, les autres par quantité croissante.
  const dataTiers = [...new Set(products.map((p) => p.dataGb))].sort(
    (a, b) => (a ?? Infinity) - (b ?? Infinity),
  );
  const byPlan = groupBy(products, planKey);
  const rows = dataTiers.map((dataGb) => ({
    dataGb,
    medianPrices: validities.map((validityDays) => {
      const items = byPlan.get(`${dataGb ?? "unlimited"}|${validityDays}`);
      return items ? median(items.map((p) => p.priceEur)) : null;
    }),
  }));
  return { validities, rows };
}

export function computeStats(products: Product[]): Stats {
  const prices = products.map((p) => p.priceEur);
  const limitedData = products.flatMap((p) => (p.dataGb === null ? [] : [p.dataGb]));
  const byPrice = [...products].sort((a, b) => a.priceEur - b.priceEur);
  const destinationCodes = new Set(products.map((p) => p.countryCode));
  const regions = [...destinationCodes].filter((c) => REGION_CODES.has(c)).length;

  return {
    totalProducts: products.length,
    productsAbove100: prices.filter((price) => price > PRICE_THRESHOLD_EUR).length,
    priceMin: byPrice.length ? toPricePoint(byPrice[0]) : null,
    priceMax: byPrice.length ? toPricePoint(byPrice[byPrice.length - 1]) : null,
    meanPriceEur: prices.length ? mean(prices) : null,
    medianPriceEur: prices.length ? median(prices) : null,
    meanDataGb: limitedData.length ? mean(limitedData) : null,
    limitedCount: limitedData.length,
    unlimitedCount: products.length - limitedData.length,
    destinations: { countries: destinationCodes.size - regions, regions },
    providers: providerBreakdown(products),
    competitiveness: competitivenessIndex(products),
    priceGrid: priceGrid(products),
  };
}
