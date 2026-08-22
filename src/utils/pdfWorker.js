import * as pdfjsLib from 'pdfjs-dist';

// Use standard CDN worker URL for PDF.js 3.11.174
if (typeof window !== 'undefined' && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;
}

export { pdfjsLib };
