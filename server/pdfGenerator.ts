import type { CartillaItem } from '../src/types.ts';

function toWinAnsi(text: string): string {
  // Normalize common typography to single-byte WinAnsi safe ASCII/Latin-1 range
  return text
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/[—–]/g, '-')
    .replace(/…/g, '...')
    .replace(/•/g, '-')
    .replace(/[^\x20-\x7E\xA0-\xFF]/g, ' ');
}

function escapePdfString(text: string): string {
  const safe = toWinAnsi(text);
  let out = '';
  for (let i = 0; i < safe.length; i++) {
    const ch = safe[i];
    const code = safe.charCodeAt(i);
    if (ch === '\\' || ch === '(' || ch === ')') {
      out += '\\' + ch;
    } else if (code >= 0x80) {
      out += '\\' + code.toString(8).padStart(3, '0');
    } else {
      out += ch;
    }
  }
  return out;
}

function wrapText(text: string, maxChars: number): string[] {
  const paragraphs = text.split(/\n+/);
  const lines: string[] = [];

  for (const para of paragraphs) {
    const words = para.trim().split(/\s+/);
    if (!words[0]) {
      lines.push('');
      continue;
    }
    let current = '';
    for (const word of words) {
      if ((current + ' ' + word).trim().length > maxChars) {
        if (current) lines.push(current.trim());
        current = word;
      } else {
        current = (current + ' ' + word).trim();
      }
    }
    if (current) lines.push(current.trim());
    lines.push('');
  }
  return lines;
}

interface TextLineSpec {
  text: string;
  font: 'F1' | 'F2';
  size: number;
  leading: number;
}

export function generateCartillaPdfBuffer(cartilla: CartillaItem): Buffer {
  const lines: TextLineSpec[] = [];

  lines.push({
    text: 'MAGGIE SEX ED - CARTILLA PSICOEDUCATIVA',
    font: 'F2',
    size: 10,
    leading: 16,
  });
  lines.push({
    text: `Categoria: ${cartilla.category}`,
    font: 'F1',
    size: 10,
    leading: 18,
  });
  for (const titleLine of wrapText(cartilla.title, 54)) {
    if (titleLine) {
      lines.push({ text: titleLine, font: 'F2', size: 18, leading: 24 });
    }
  }
  lines.push({
    text: `${cartilla.sourceLabel} | ${cartilla.authorOrInstitution} (${cartilla.year})`,
    font: 'F1',
    size: 10,
    leading: 18,
  });
  lines.push({ text: '', font: 'F1', size: 11, leading: 10 });

  for (const descLine of wrapText(cartilla.shortDescription, 78)) {
    lines.push({ text: descLine, font: 'F1', size: 12, leading: 17 });
  }

  for (const sec of cartilla.sections) {
    lines.push({ text: '', font: 'F1', size: 11, leading: 8 });
    for (const hLine of wrapText(sec.heading, 66)) {
      if (hLine) {
        lines.push({ text: hLine, font: 'F2', size: 13, leading: 19 });
      }
    }
    for (const bLine of wrapText(sec.body, 80)) {
      lines.push({ text: bLine, font: 'F1', size: 11, leading: 16 });
    }
  }

  lines.push({ text: '', font: 'F1', size: 11, leading: 12 });
  for (const noteLine of wrapText(
    'Aviso: Este material es exclusivamente psicoeducativo y no sustituye una valoracion medica, psicologica ni sexologica profesional.',
    80
  )) {
    lines.push({ text: noteLine, font: 'F1', size: 9, leading: 13 });
  }

  // Paginate lines (letter 612 x 792, margins 54pt top/bottom)
  const pages: TextLineSpec[][] = [];
  let currentPage: TextLineSpec[] = [];
  let y = 738;

  for (const spec of lines) {
    if (y - spec.leading < 56) {
      pages.push(currentPage);
      currentPage = [];
      y = 738;
    }
    currentPage.push(spec);
    y -= spec.leading;
  }
  if (currentPage.length > 0) {
    pages.push(currentPage);
  }

  const objects: string[] = [];
  // 1: Catalog, 2: Pages, 3: F1 Regular, 4: F2 Bold
  const font1Id = 3;
  const font2Id = 4;
  const firstPageObjId = 5;
  const pageIds: number[] = [];

  for (let i = 0; i < pages.length; i++) {
    pageIds.push(firstPageObjId + i * 2);
  }

  objects.push('1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj');
  objects.push(
    `2 0 obj\n<< /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(' ')}] /Count ${pageIds.length} >>\nendobj`
  );
  objects.push(
    `${font1Id} 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>\nendobj`
  );
  objects.push(
    `${font2Id} 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>\nendobj`
  );

  for (let i = 0; i < pages.length; i++) {
    const pageObjId = firstPageObjId + i * 2;
    const contentObjId = pageObjId + 1;
    let stream = 'BT\n';
    let cursorY = 738;
    for (const item of pages[i]) {
      if (item.text) {
        stream += `/${item.font} ${item.size} Tf\n`;
        stream += `1 0 0 1 54 ${cursorY} Tm\n`;
        stream += `(${escapePdfString(item.text)}) Tj\n`;
      }
      cursorY -= item.leading;
    }
    stream += 'ET';

    objects.push(
      `${pageObjId} 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 ${font1Id} 0 R /F2 ${font2Id} 0 R >> >> /Contents ${contentObjId} 0 R >>\nendobj`
    );
    objects.push(
      `${contentObjId} 0 obj\n<< /Length ${Buffer.byteLength(stream, 'latin1')} >>\nstream\n${stream}\nendstream\nendobj`
    );
  }

  let pdf = '%PDF-1.4\n';
  const offsets: number[] = [0];
  for (const obj of objects) {
    offsets.push(Buffer.byteLength(pdf, 'latin1'));
    pdf += obj + '\n';
  }
  const xrefPos = Buffer.byteLength(pdf, 'latin1');
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += '0000000000 65535 f \n';
  for (let i = 1; i <= objects.length; i++) {
    pdf += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefPos}\n%%EOF\n`;

  return Buffer.from(pdf, 'latin1');
}
