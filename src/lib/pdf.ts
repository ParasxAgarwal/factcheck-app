import * as pdfjsLib from "pdfjs-dist";
// Vite will emit a URL for the worker bundle
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import pdfWorkerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

export async function extractTextFromPdf(file: File, onProgress?: (p: number) => void): Promise<string> {
  const ab = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: ab }).promise;

  const parts: string[] = [];
  for (let pageNo = 1; pageNo <= pdf.numPages; pageNo++) {
    const page = await pdf.getPage(pageNo);
    const content = await page.getTextContent();
    const pageText = content.items
      // pdfjs typings are loose here; runtime objects do include `str`
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((it: any) => ("str" in it ? String(it.str) : ""))
      .join(" ");
    parts.push(pageText);
    onProgress?.(pageNo / pdf.numPages);
  }
  return parts.join("\n");
}
