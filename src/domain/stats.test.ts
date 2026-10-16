import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { parseFiles } from "./parse";
import { computeStats, median } from "./stats";
import type { Product } from "./types";

const product = (overrides: Partial<Product>): Product => ({
  sku: "s",
  provider: "P",
  productName: "eSIM",
  countryCode: "FR",
  countryName: "France",
  dataGb: 5,
  validityDays: 7,
  priceEur: 10,
  network: "4G",
  topUp: true,
  ...overrides,
});

describe("median", () => {
  it("gère les tailles paires et impaires", () => {
    expect(median([3, 1, 2])).toBe(2);
    expect(median([4, 1, 3, 2])).toBe(2.5);
  });
});

describe("computeStats", () => {
  it("renvoie des valeurs vides sans planter quand il n'y a aucun produit", () => {
    const stats = computeStats([]);
    expect(stats.totalProducts).toBe(0);
    expect(stats.priceMin).toBeNull();
    expect(stats.meanPriceEur).toBeNull();
    expect(stats.meanDataGb).toBeNull();
    expect(stats.providers).toEqual([]);
  });

  it("exclut les illimités de la moyenne de data au lieu de les compter comme 0", () => {
    const stats = computeStats([
      product({ sku: "a", dataGb: 10 }),
      product({ sku: "b", dataGb: 20 }),
      product({ sku: "c", dataGb: null }),
    ]);
    expect(stats.meanDataGb).toBe(15);
    expect(stats.unlimitedCount).toBe(1);
  });

  it("compte strictement les produits à plus de 100 €", () => {
    const stats = computeStats([
      product({ sku: "a", priceEur: 100 }),
      product({ sku: "b", priceEur: 100.01 }),
    ]);
    expect(stats.productsAbove100).toBe(1);
  });

  it("calcule l'écart au marché à forfait équivalent, pas un prix au Go biaisé par le mix", () => {
    // A vend plus de forfaits 1 Go (chers au Go) mais au prix du marché ; B est 10 % au-dessus.
    const stats = computeStats([
      product({ sku: "a1", provider: "A", dataGb: 1, priceEur: 5 }),
      product({ sku: "a2", provider: "A", dataGb: 1, priceEur: 5 }),
      product({ sku: "a3", provider: "A", dataGb: 10, priceEur: 20 }),
      product({ sku: "b1", provider: "B", dataGb: 10, priceEur: 22 }),
      product({ sku: "c1", provider: "C", dataGb: 10, priceEur: 20 }),
      product({ sku: "c2", provider: "C", dataGb: 1, priceEur: 5 }),
    ]);
    const index = Object.fromEntries(stats.competitiveness.map((c) => [c.provider, c.medianGapPct]));
    expect(index.A).toBeCloseTo(0);
    expect(index.B).toBeCloseTo(10);
  });

  it("construit la grille data × durée avec l'illimité en dernière ligne", () => {
    const stats = computeStats([
      product({ sku: "a", dataGb: null, validityDays: 30, priceEur: 80 }),
      product({ sku: "b", dataGb: 1, validityDays: 7, priceEur: 6 }),
      product({ sku: "c", dataGb: 1, validityDays: 30, priceEur: 8 }),
    ]);
    expect(stats.priceGrid.validities).toEqual([7, 30]);
    expect(stats.priceGrid.rows).toEqual([
      { dataGb: 1, medianPrices: [6, 8] },
      { dataGb: null, medianPrices: [null, 80] },
    ]);
  });
});

describe("oracle sur les 18 fichiers fournis", () => {
  const dir = path.join(process.cwd(), "public/data");
  const files = readdirSync(dir)
    .filter((f) => f.endsWith(".csv"))
    .map((name) => ({ name, text: readFileSync(path.join(dir, name), "utf-8") }));
  const { products, report } = parseFiles(files);
  const stats = computeStats(products);

  it("lit les 18 fichiers sans rejet", () => {
    expect(report.files).toHaveLength(18);
    expect(report.rejected).toEqual([]);
  });

  it("produit les KPI attendus", () => {
    expect(stats.totalProducts).toBe(5056);
    expect(stats.productsAbove100).toBe(56);
    expect(stats.priceMin?.priceEur).toBe(5.36);
    expect(stats.priceMax).toMatchObject({ priceEur: 154.63, provider: "aloSIM" });
    expect(stats.meanDataGb).toBeCloseTo(14.49, 2);
    expect(stats.limitedCount).toBe(4403);
    expect(stats.unlimitedCount).toBe(653);
    expect(stats.meanPriceEur).toBeCloseTo(29.3, 2);
    expect(stats.medianPriceEur).toBeCloseTo(20.7, 2);
  });

  it("répartit les produits par fournisseur (nom issu de la colonne provider)", () => {
    expect(stats.providers).toHaveLength(18);
    expect(stats.providers[0]).toEqual({ provider: "Airalo", count: 722 });
    expect(stats.providers.at(-1)).toEqual({ provider: "4S eSIM", count: 92 });
    expect(stats.providers.some((p) => p.provider === "Maya Mobile")).toBe(true);
  });

  it("garde les 192 produits Amérique du Nord (code NA)", () => {
    expect(products.filter((p) => p.countryCode === "NA")).toHaveLength(192);
  });

  it("montre un marché homogène : tous les fournisseurs à ±2 % du marché", () => {
    expect(stats.competitiveness).toHaveLength(18);
    for (const c of stats.competitiveness) expect(Math.abs(c.medianGapPct)).toBeLessThan(2);
  });
});
