import Papa from "papaparse";
import type { ImportReport, ParseResult, Product, RejectReason, RejectedRow } from "./types";

export const REQUIRED_COLUMNS = [
  "sku",
  "provider",
  "product_name",
  "country_code",
  "country_name",
  "data_gb",
  "data_display",
  "validity_days",
  "price",
  "currency",
  "network",
  "top_up",
] as const;

type Column = (typeof REQUIRED_COLUMNS)[number];
type RawRow = Record<Column, string>;

const UNLIMITED_LABELS = new Set(["illimité", "illimite", "unlimited"]);
const TRUE_LABELS = new Set(["oui", "yes", "true", "1"]);
const DECIMAL = /^\d+(\.\d+)?$/;
const INTEGER = /^\d+$/;

/** Accepte "12.5" et "12,5" (export Excel FR). Renvoie null si ce n'est pas un nombre décimal positif ou nul. */
function parseDecimal(value: string): number | null {
  const normalized = value.replace(",", ".");
  return DECIMAL.test(normalized) ? Number(normalized) : null;
}

function toProduct(raw: RawRow): Product | RejectReason {
  if (!raw.sku) return "MISSING_SKU";
  if (!raw.provider) return "MISSING_PROVIDER";
  if (!raw.country_code) return "MISSING_COUNTRY";

  const price = parseDecimal(raw.price);
  if (price === null || price <= 0) return "INVALID_PRICE";
  if (raw.currency.toUpperCase() !== "EUR") return "NON_EUR_CURRENCY";

  let dataGb: number | null;
  if (raw.data_gb === "") {
    if (!UNLIMITED_LABELS.has(raw.data_display.toLowerCase())) return "INVALID_DATA";
    dataGb = null;
  } else {
    dataGb = parseDecimal(raw.data_gb);
    if (dataGb === null || dataGb <= 0) return "INVALID_DATA";
  }

  if (!INTEGER.test(raw.validity_days) || Number(raw.validity_days) <= 0) return "INVALID_VALIDITY";

  return {
    sku: raw.sku,
    provider: raw.provider,
    productName: raw.product_name,
    countryCode: raw.country_code.toUpperCase(),
    countryName: raw.country_name,
    dataGb,
    validityDays: Number(raw.validity_days),
    priceEur: price,
    network: raw.network,
    topUp: TRUE_LABELS.has(raw.top_up.toLowerCase()),
  };
}

/**
 * Parse un fichier CSV fournisseur. Toutes les valeurs sont lues comme du texte
 * (pas de typage automatique : "NA" = Amérique du Nord, pas une valeur manquante),
 * puis validées une par une. Une ligne invalide est rejetée avec un motif, jamais levée en exception.
 */
export function parseCsv(text: string, fileName: string, seenSkus = new Set<string>()): ParseResult {
  const { data, meta } = Papa.parse<Record<string, string>>(text.replace(/^﻿/, ""), {
    header: true,
    skipEmptyLines: "greedy",
    dynamicTyping: false,
    transformHeader: (h) => h.trim().toLowerCase(),
    transform: (v) => v.trim(),
  });

  const columns = new Set(meta.fields ?? []);
  if (!REQUIRED_COLUMNS.every((c) => columns.has(c))) {
    return { products: [], rejected: [{ file: fileName, line: 1, reason: "MISSING_COLUMNS" }] };
  }

  const products: Product[] = [];
  const rejected: RejectedRow[] = [];

  data.forEach((raw, index) => {
    const line = index + 2;
    // Une ligne tronquée n'a pas toutes les clés : on les complète par "" pour la rejeter proprement.
    const row = Object.fromEntries(REQUIRED_COLUMNS.map((c) => [c, raw[c] ?? ""])) as RawRow;
    const result = toProduct(row);
    if (typeof result === "string") {
      rejected.push({ file: fileName, line, reason: result });
    } else if (seenSkus.has(result.sku)) {
      rejected.push({ file: fileName, line, reason: "DUPLICATE_SKU" });
    } else {
      seenSkus.add(result.sku);
      products.push(result);
    }
  });

  return { products, rejected };
}

export interface CsvFile {
  name: string;
  text: string;
}

/** Parse un lot de fichiers (un par fournisseur) ; un SKU déjà vu dans un fichier précédent est rejeté. */
export function parseFiles(files: CsvFile[]): { products: Product[]; report: ImportReport } {
  const seenSkus = new Set<string>();
  const products: Product[] = [];
  const report: ImportReport = { files: [], rejected: [] };

  for (const file of files) {
    const result = parseCsv(file.text, file.name, seenSkus);
    products.push(...result.products);
    report.rejected.push(...result.rejected);
    report.files.push({
      file: file.name,
      valid: result.products.length,
      rejected: result.rejected.length,
      providers: [...new Set(result.products.map((p) => p.provider))],
    });
  }

  return { products, report };
}
