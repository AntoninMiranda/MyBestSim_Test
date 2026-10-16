import type { CsvFile } from "@/domain/parse";

export const MAX_FILE_SIZE_MB = 5;

export type UploadError =
  | { kind: "tooLarge"; file: string }
  | { kind: "notCsv"; file: string }
  | { kind: "readFailed"; file: string };

/** Lit les fichiers choisis par l'utilisateur, entièrement dans le navigateur. */
export async function readUploadedFiles(
  fileList: Iterable<File>,
): Promise<{ files: CsvFile[]; errors: UploadError[] }> {
  // Copie immédiate, avant le premier await : une FileList est vivante et se vide quand on
  // réinitialise l'<input type="file"> ou à la fin d'un drop, ce qui couperait la boucle après un fichier.
  const selected = Array.from(fileList);
  const files: CsvFile[] = [];
  const errors: UploadError[] = [];

  for (const file of selected) {
    if (!file.name.toLowerCase().endsWith(".csv")) {
      errors.push({ kind: "notCsv", file: file.name });
    } else if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      errors.push({ kind: "tooLarge", file: file.name });
    } else {
      try {
        files.push({ name: file.name, text: await file.text() });
      } catch {
        errors.push({ kind: "readFailed", file: file.name });
      }
    }
  }

  return { files, errors };
}
