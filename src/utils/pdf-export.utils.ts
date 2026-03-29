export interface PdfSection {
  heading: string;
  body: string[];
}

interface PdfReportOptions {
  filename: string;
  title: string;
  subtitle?: string;
  sections: PdfSection[];
}

const PAGE_WIDTH = 595;
const PAGE_HEIGHT = 842;
const LEFT_MARGIN = 48;
const TOP_MARGIN = 784;
const BOTTOM_MARGIN = 56;
const BODY_LINE_HEIGHT = 16;
const TITLE_LINE_HEIGHT = 24;

function escapePdfText(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
}

function chunkSections(title: string, subtitle: string | undefined, sections: PdfSection[]) {
  const pages: string[][] = [];
  let currentPage: string[] = [];
  let cursorY = TOP_MARGIN;

  const pushLine = (line: string, fontSize = 11) => {
    if (cursorY <= BOTTOM_MARGIN) {
      pages.push(currentPage);
      currentPage = [];
      cursorY = TOP_MARGIN;
    }

    currentPage.push(`BT /F1 ${fontSize} Tf ${LEFT_MARGIN} ${cursorY} Td (${escapePdfText(line)}) Tj ET`);
    cursorY -= fontSize >= 16 ? TITLE_LINE_HEIGHT : BODY_LINE_HEIGHT;
  };

  pushLine(title, 18);
  if (subtitle) {
    pushLine(subtitle, 11);
    cursorY -= 4;
  }

  sections.forEach((section) => {
    cursorY -= 4;
    pushLine(section.heading, 14);
    section.body.forEach((line) => pushLine(line, 11));
  });

  if (currentPage.length) {
    pages.push(currentPage);
  }

  return pages;
}

function buildPdfDocument(title: string, subtitle: string | undefined, sections: PdfSection[]): string {
  const pages = chunkSections(title, subtitle, sections);
  const fontId = 1;
  const contentIds = pages.map((_, index) => index + 2);
  const pageIds = pages.map((_, index) => index + 2 + pages.length);
  const pagesId = 2 + pages.length * 2;
  const catalogId = pagesId + 1;

  const objects: string[] = ['<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>'];

  pages.forEach((page) => {
    const contentStream = page.join('\n');
    objects.push(`<< /Length ${contentStream.length} >>\nstream\n${contentStream}\nendstream`);
  });

  contentIds.forEach((contentId) => {
    objects.push(
      `<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 ${PAGE_WIDTH} ${PAGE_HEIGHT}] /Contents ${contentId} 0 R /Resources << /Font << /F1 ${fontId} 0 R >> >> >>`,
    );
  });

  objects.push(`<< /Type /Pages /Count ${pageIds.length} /Kids [${pageIds.map((id) => `${id} 0 R`).join(' ')}] >>`);
  objects.push(`<< /Type /Catalog /Pages ${pagesId} 0 R >>`);

  let pdf = '%PDF-1.4\n';
  const offsets: number[] = [0];

  objects.forEach((object, index) => {
    offsets.push(pdf.length);
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });

  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  offsets.slice(1).forEach((offset) => {
    pdf += `${offset.toString().padStart(10, '0')} 00000 n \n`;
  });
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root ${catalogId} 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  return pdf;
}

export function downloadPdfReport({ filename, title, subtitle, sections }: PdfReportOptions) {
  if (typeof document === 'undefined') return;

  const pdf = buildPdfDocument(title, subtitle, sections);
  const blob = new Blob([pdf], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
  link.click();
  URL.revokeObjectURL(url);
}
