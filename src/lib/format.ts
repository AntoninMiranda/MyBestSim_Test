import { intlLocales, type Locale } from "@/i18n/config";

export interface Formatters {
  eur: (value: number) => string;
  int: (value: number) => string;
  gb: (value: number) => string;
  pct: (value: number) => string;
  /** Pourcentage avec signe explicite (+1,3 % / −0,5 %), pour les écarts. */
  signedPct: (value: number) => string;
}

const cache = new Map<Locale, Formatters>();

/** Formatters `Intl` mis en cache par langue (la locale est fixe : même rendu serveur et client). */
export function getFormatters(locale: Locale): Formatters {
  const cached = cache.get(locale);
  if (cached) return cached;

  const intl = intlLocales[locale];
  const eur = new Intl.NumberFormat(intl, { style: "currency", currency: "EUR" });
  const int = new Intl.NumberFormat(intl);
  const gb = new Intl.NumberFormat(intl, { style: "unit", unit: "gigabyte", maximumFractionDigits: 2 });
  const pct = new Intl.NumberFormat(intl, { style: "percent", maximumFractionDigits: 1 });
  const signedPct = new Intl.NumberFormat(intl, {
    style: "percent",
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
    signDisplay: "exceptZero",
  });

  const formatters: Formatters = {
    eur: (v) => eur.format(v),
    int: (v) => int.format(v),
    gb: (v) => gb.format(v),
    pct: (v) => pct.format(v / 100),
    signedPct: (v) => signedPct.format(v / 100),
  };
  cache.set(locale, formatters);
  return formatters;
}
