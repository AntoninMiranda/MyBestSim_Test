import { describe, expect, it } from "vitest";
import { mergeByProvider } from "./merge";
import type { Product } from "./types";

const p = (sku: string, provider: string): Product => ({
  sku,
  provider,
  productName: "eSIM",
  countryCode: "FR",
  countryName: "France",
  dataGb: 1,
  validityDays: 7,
  priceEur: 5,
  network: "4G",
  topUp: false,
});

describe("mergeByProvider", () => {
  it("remplace le catalogue des fournisseurs importés et garde les autres", () => {
    const base = [p("a-1", "A"), p("a-2", "A"), p("b-1", "B")];
    const imported = [p("a-9", "A"), p("c-1", "C")];
    expect(mergeByProvider(base, imported).map((x) => x.sku)).toEqual(["b-1", "a-9", "c-1"]);
  });

  it("reconnaît un fournisseur malgré la casse ou des espaces", () => {
    const base = [p("a-1", "Airalo"), p("b-1", "B")];
    expect(mergeByProvider(base, [p("a-9", "airalo ")]).map((x) => x.sku)).toEqual(["b-1", "a-9"]);
  });

  it("ne modifie rien si aucun produit n'est importé", () => {
    const base = [p("a-1", "A")];
    expect(mergeByProvider(base, [])).toEqual(base);
  });
});
