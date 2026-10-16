import { describe, expect, it } from "vitest";
import { interpolate, pickLocale } from "./config";
import en from "./dictionaries/en.json";
import fr from "./dictionaries/fr.json";
import { REJECT_REASONS } from "../domain/types";

/** Liste des chemins de clés d'un dictionnaire, ex. "kpi.total.label". */
const keyPaths = (obj: object, prefix = ""): string[] =>
  Object.entries(obj).flatMap(([key, value]) =>
    typeof value === "object" && value !== null
      ? keyPaths(value, `${prefix}${key}.`)
      : [`${prefix}${key}`],
  );

describe("dictionnaires", () => {
  it("ont exactement les mêmes clés dans toutes les langues", () => {
    expect(keyPaths(en).sort()).toEqual(keyPaths(fr).sort());
  });

  it("traduisent chaque motif de rejet du domaine", () => {
    for (const dict of [fr, en]) {
      expect(Object.keys(dict.quality.reasons).sort()).toEqual([...REJECT_REASONS].sort());
    }
  });
});

describe("pickLocale", () => {
  it.each([
    [null, "fr"],
    ["en-US,en;q=0.9", "en"],
    ["de-DE,en;q=0.8,fr;q=0.9", "fr"],
    ["de-DE,es;q=0.9", "fr"],
    ["EN", "en"],
    ["en;q=0,fr;q=0.5", "fr"],
    ["en;q=abc", "fr"],
  ])("%s → %s", (header, expected) => {
    expect(pickLocale(header)).toBe(expected);
  });
});

describe("interpolate", () => {
  it("remplace les placeholders connus et laisse les autres", () => {
    expect(interpolate("{a} et {b}", { a: 1 })).toBe("1 et {b}");
  });
});
