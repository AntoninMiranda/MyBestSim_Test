import "server-only";
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { parseFiles } from "@/domain/parse";

const SAMPLE_DIR = path.join(process.cwd(), "data");

/**
 * Lit et parse les CSV d'exemple au build. Lecture synchrone : avec Cache Components,
 * `readFileSync` est prévisible et inclus dans le pré-rendu statique.
 */
export function loadSampleCatalog() {
  const files = readdirSync(SAMPLE_DIR)
    .filter((name) => name.endsWith(".csv"))
    .sort()
    .map((name) => ({ name, text: readFileSync(path.join(SAMPLE_DIR, name), "utf-8") }));
  return parseFiles(files);
}
