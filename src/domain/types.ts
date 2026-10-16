export interface Product {
  sku: string;
  provider: string;
  productName: string;
  countryCode: string;
  countryName: string;
  /** `null` = forfait illimité (data_gb vide, data_display "Illimité"). */
  dataGb: number | null;
  validityDays: number;
  priceEur: number;
  network: string;
  topUp: boolean;
}

export const REJECT_REASONS = [
  "MISSING_COLUMNS",
  "MISSING_SKU",
  "MISSING_PROVIDER",
  "MISSING_COUNTRY",
  "INVALID_PRICE",
  "NON_EUR_CURRENCY",
  "INVALID_DATA",
  "INVALID_VALIDITY",
  "DUPLICATE_SKU",
] as const;

export type RejectReason = (typeof REJECT_REASONS)[number];

export interface RejectedRow {
  file: string;
  /** Numéro de ligne (l'en-tête est la ligne 1 ; les lignes vides ne sont pas comptées). */
  line: number;
  reason: RejectReason;
}

export interface ParseResult {
  products: Product[];
  rejected: RejectedRow[];
}

export interface FileReport {
  file: string;
  valid: number;
  rejected: number;
  providers: string[];
}

export interface ImportReport {
  files: FileReport[];
  rejected: RejectedRow[];
}
