import { describe, expect, it } from "vitest";
import { readUploadedFiles } from "./read-uploaded-files";

const csvFile = (name: string) => new File(["sku,provider\n"], name, { type: "text/csv" });

describe("readUploadedFiles", () => {
  it("lit tous les fichiers même si la liste source est vidée pendant la lecture", async () => {
    // Comme une FileList : vider l'<input type="file"> (ou finir un drop) vide la liste pendant les await.
    const live = [csvFile("a.csv"), csvFile("b.csv"), csvFile("c.csv"), csvFile("d.csv")];
    const pending = readUploadedFiles(live);
    live.length = 0;

    const { files } = await pending;
    expect(files.map((f) => f.name)).toEqual(["a.csv", "b.csv", "c.csv", "d.csv"]);
  });

  it("refuse les fichiers qui ne sont pas des .csv", async () => {
    const { files, errors } = await readUploadedFiles([csvFile("a.csv"), csvFile("notes.txt")]);
    expect(files.map((f) => f.name)).toEqual(["a.csv"]);
    expect(errors).toEqual([{ kind: "notCsv", file: "notes.txt" }]);
  });
});
