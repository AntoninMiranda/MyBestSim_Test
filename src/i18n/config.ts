export const locales = ["fr", "en"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "fr";

/** Locale `Intl` utilisée pour formater nombres et prix dans chaque langue. */
export const intlLocales: Record<Locale, string> = {
  fr: "fr-FR",
  en: "en-GB",
};

export const isLocale = (value: string): value is Locale =>
  (locales as readonly string[]).includes(value);

/** Choisit la langue à partir de l'en-tête Accept-Language (ex. "en-US,en;q=0.9,fr;q=0.8"). */
export function pickLocale(acceptLanguage: string | null): Locale {
  if (!acceptLanguage) return defaultLocale;
  const ranked = acceptLanguage
    .split(",")
    .map((part) => {
      const [tag, ...params] = part.trim().split(";");
      const q = params.find((p) => p.trim().startsWith("q="));
      return { lang: tag.split("-")[0].toLowerCase(), q: q ? Number(q.trim().slice(2)) : 1 };
    })
    // q=0 signifie « refusé » ; un q illisible (NaN) est ignoré.
    .filter((r) => r.q > 0)
    .sort((a, b) => b.q - a.q);
  return ranked.find((r) => isLocale(r.lang))?.lang as Locale | undefined ?? defaultLocale;
}

/** Remplace les {placeholders} d'un texte traduit. */
export function interpolate(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in values ? String(values[key]) : match,
  );
}
