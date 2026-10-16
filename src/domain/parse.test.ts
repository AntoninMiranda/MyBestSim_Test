import { describe, expect, it } from "vitest";
import { parseCsv, parseFiles } from "./parse";

const HEADER =
  "sku,provider,product_name,country_code,country_name,data_gb,data_display,validity_days,price,currency,network,top_up";

const row = (overrides: Partial<Record<string, string>> = {}) => {
  const base: Record<string, string> = {
    sku: "x-1",
    provider: "Prov",
    product_name: "eSIM France 5 Go 7 jours",
    country_code: "FR",
    country_name: "France",
    data_gb: "5",
    data_display: "5 Go",
    validity_days: "7",
    price: "12.5",
    currency: "EUR",
    network: "4G",
    top_up: "oui",
  };
  return Object.values({ ...base, ...overrides }).join(",");
};

const csv = (...rows: string[]) => [HEADER, ...rows].join("\n");

describe("parseCsv", () => {
  it("parse une ligne valide", () => {
    const { products, rejected } = parseCsv(csv(row()), "prov.csv");
    expect(rejected).toEqual([]);
    expect(products).toEqual([
      {
        sku: "x-1",
        provider: "Prov",
        productName: "eSIM France 5 Go 7 jours",
        countryCode: "FR",
        countryName: "France",
        dataGb: 5,
        validityDays: 7,
        priceEur: 12.5,
        network: "4G",
        topUp: true,
      },
    ]);
  });

  it("représente un forfait illimité par dataGb = null", () => {
    const { products } = parseCsv(csv(row({ data_gb: "", data_display: "Illimité" })), "f.csv");
    expect(products[0].dataGb).toBeNull();
  });

  it("garde le code NA (Amérique du Nord) au lieu de le traiter comme valeur manquante", () => {
    const { products } = parseCsv(
      csv(row({ country_code: "NA", country_name: "Amérique du Nord" })),
      "f.csv",
    );
    expect(products[0].countryCode).toBe("NA");
  });

  it("accepte le séparateur ; et la virgule décimale (export Excel FR)", () => {
    const text = csv(row({ price: '"12,5"' })).replaceAll(",", ";").replace('"12;5"', "12,5");
    const { products, rejected } = parseCsv(text, "f.csv");
    expect(rejected).toEqual([]);
    expect(products[0].priceEur).toBe(12.5);
  });

  it("gère le BOM UTF-8 et les fins de ligne CRLF", () => {
    const text = "﻿" + csv(row(), row({ sku: "x-2" })).replaceAll("\n", "\r\n");
    const { products } = parseCsv(text, "f.csv");
    expect(products.map((p) => p.sku)).toEqual(["x-1", "x-2"]);
  });

  it("ignore les lignes vides et les espaces autour des valeurs", () => {
    const { products } = parseCsv(csv(row({ provider: " Prov " }), ""), "f.csv");
    expect(products).toHaveLength(1);
    expect(products[0].provider).toBe("Prov");
  });

  it("rejette tout le fichier si une colonne obligatoire manque", () => {
    const text = "sku,provider,price\nx-1,Prov,10";
    const { products, rejected } = parseCsv(text, "f.csv");
    expect(products).toEqual([]);
    expect(rejected).toEqual([{ file: "f.csv", line: 1, reason: "MISSING_COLUMNS" }]);
  });

  it.each([
    [{ price: "" }, "INVALID_PRICE"],
    [{ price: "abc" }, "INVALID_PRICE"],
    [{ price: "-3" }, "INVALID_PRICE"],
    [{ price: "0" }, "INVALID_PRICE"],
    [{ currency: "USD" }, "NON_EUR_CURRENCY"],
    [{ data_gb: "", data_display: "5 Go" }, "INVALID_DATA"],
    [{ data_gb: "-1" }, "INVALID_DATA"],
    [{ validity_days: "0" }, "INVALID_VALIDITY"],
    [{ sku: "" }, "MISSING_SKU"],
    [{ provider: "" }, "MISSING_PROVIDER"],
    [{ country_code: "" }, "MISSING_COUNTRY"],
  ] as const)("rejette %o avec le motif %s", (overrides, reason) => {
    const { products, rejected } = parseCsv(csv(row(overrides)), "f.csv");
    expect(products).toEqual([]);
    expect(rejected).toEqual([{ file: "f.csv", line: 2, reason }]);
  });

  it("rejette un SKU en double dans le même fichier et garde la première occurrence", () => {
    const { products, rejected } = parseCsv(csv(row(), row({ price: "99" })), "f.csv");
    expect(products).toHaveLength(1);
    expect(products[0].priceEur).toBe(12.5);
    expect(rejected).toEqual([{ file: "f.csv", line: 3, reason: "DUPLICATE_SKU" }]);
  });

  it("rejette une ligne tronquée au lieu de planter", () => {
    const { products, rejected } = parseCsv(csv("x-9,Prov,eSIM", row()), "f.csv");
    expect(products.map((p) => p.sku)).toEqual(["x-1"]);
    expect(rejected).toEqual([{ file: "f.csv", line: 2, reason: "MISSING_COUNTRY" }]);
  });

  it("accepte la devise en minuscules", () => {
    const { rejected } = parseCsv(csv(row({ currency: "eur" })), "f.csv");
    expect(rejected).toEqual([]);
  });
});

describe("parseFiles", () => {
  it("agrège plusieurs fichiers et produit un rapport par fichier", () => {
    const { products, report } = parseFiles([
      { name: "a.csv", text: csv(row({ sku: "a-1", provider: "A" }), row({ sku: "a-2", currency: "USD" })) },
      { name: "b.csv", text: csv(row({ sku: "b-1", provider: "B" })) },
    ]);
    expect(products.map((p) => p.sku)).toEqual(["a-1", "b-1"]);
    expect(report.files).toEqual([
      { file: "a.csv", valid: 1, rejected: 1, providers: ["A"] },
      { file: "b.csv", valid: 1, rejected: 0, providers: ["B"] },
    ]);
    expect(report.rejected).toEqual([{ file: "a.csv", line: 3, reason: "NON_EUR_CURRENCY" }]);
  });

  it("rejette un SKU déjà vu dans un autre fichier", () => {
    const { products, report } = parseFiles([
      { name: "a.csv", text: csv(row()) },
      { name: "b.csv", text: csv(row()) },
    ]);
    expect(products).toHaveLength(1);
    expect(report.rejected).toEqual([{ file: "b.csv", line: 2, reason: "DUPLICATE_SKU" }]);
  });
});
