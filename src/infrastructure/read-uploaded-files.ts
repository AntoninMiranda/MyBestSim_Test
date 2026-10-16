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
  const files: CsvFile[] = [];
  const errors: UploadError[] = [];

  for (const file of fileList) {
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

/** Recharge les CSV d'exemple servis en statique (nécessaire seulement pour fusionner un import). */
export async function fetchSampleFiles(names: string[]): Promise<CsvFile[]> {
  return Promise.all(
    names.map(async (name) => {
      const response = await fetch(`/data/${encodeURIComponent(name)}`);
      if (!response.ok) throw new Error(`${name}: HTTP ${response.status}`);
      return { name, text: await response.text() };
    }),
  );
}
