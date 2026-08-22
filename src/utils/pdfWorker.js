import * as pdfjsLib from 'pdfjs-dist/build/pdf.mjs';

// Use CDN worker matching installed pdfjs-dist version (6.2.108)
if (typeof window !== 'undefined' && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/6.2.108/pdf.worker.min.mjs`;
}

export { pdfjsLib };
