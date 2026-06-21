import Papa from "papaparse";

export async function loadCsv(filePath: string) {
  const response = await fetch(filePath);

  const csvText = await response.text();

  return new Promise((resolve) => {
    Papa.parse(csvText, {
      header: true,
      complete: (results) => {
        resolve(results.data);
      },
    });
  });
}