"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { isLocale, locales, type Locale } from "@/i18n/config";

interface LocaleSwitcherProps {
  current: Locale;
  label: string;
  names: Record<Locale, string>;
}

export function LocaleSwitcher({ current, label, names }: LocaleSwitcherProps) {
  return (
    <div className="flex items-center gap-2.5">
      <span id="locale-label" className="text-[13px] font-semibold text-muted-foreground">
        {label}
      </span>
      <Select
        value={current}
        // Navigation complète : chaque langue est une page statique distincte. Une navigation client
        // garderait l'autre langue cachée dans le DOM (Cache Components), avec des id en double.
        // eslint-disable-next-line @next/next/no-location-assign-relative-destination
        onValueChange={(value) => isLocale(value) && window.location.assign(`/${value}`)}
      >
        <SelectTrigger
          aria-labelledby="locale-label locale-value"
          className="min-h-11 rounded-[10px] border-border bg-background px-3.5 font-semibold text-navy"
        >
          <SelectValue id="locale-value" />
        </SelectTrigger>
        <SelectContent>
          {locales.map((locale) => (
            <SelectItem key={locale} value={locale} lang={locale}>
              {names[locale]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
