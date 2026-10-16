import type { Product } from "./types";

/** Comparaison tolérante à la casse et aux espaces ("airalo " = "Airalo"). */
const providerKey = (p: Product) => p.provider.trim().toLowerCase();

/**
 * Un fichier = le catalogue complet d'un fournisseur pour la journée :
 * les fournisseurs présents dans l'import remplacent leurs anciens produits, les autres sont conservés.
 */
export function mergeByProvider(base: Product[], imported: Product[]): Product[] {
  const importedProviders = new Set(imported.map(providerKey));
  return [...base.filter((p) => !importedProviders.has(providerKey(p))), ...imported];
}
