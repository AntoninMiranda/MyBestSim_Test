import type fr from "./dictionaries/fr.json";

/** Le français fait référence : une clé manquante dans une autre langue fait échouer le typecheck. */
export type Dictionary = typeof fr;
