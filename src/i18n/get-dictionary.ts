import "server-only";
import type { Locale } from "./config";
import type { Dictionary } from "./types";

const dictionaries = {
  fr: () => import("./dictionaries/fr.json").then((m) => m.default),
  en: () => import("./dictionaries/en.json").then((m) => m.default),
} satisfies Record<Locale, () => Promise<Dictionary>>;

export const getDictionary = (locale: Locale): Promise<Dictionary> => dictionaries[locale]();
