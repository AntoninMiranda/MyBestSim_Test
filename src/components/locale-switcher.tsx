import Link from "next/link";
import { Button } from "@/components/ui/button";
import { locales, type Locale } from "@/i18n/config";

interface LocaleSwitcherProps {
  current: Locale;
  label: string;
}

export function LocaleSwitcher({ current, label }: LocaleSwitcherProps) {
  return (
    <nav aria-label={label} className="flex gap-1">
      {locales.map((locale) => (
        <Button key={locale} asChild size="sm" variant={locale === current ? "secondary" : "ghost"}>
          <Link href={`/${locale}`} hrefLang={locale} lang={locale} aria-current={locale === current ? "page" : undefined}>
            {locale.toUpperCase()}
          </Link>
        </Button>
      ))}
    </nav>
  );
}
