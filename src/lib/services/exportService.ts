'use client';

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import ExcelJS from 'exceljs';

// ── PDF Export ──────────────────────────────────────────────────────────────

interface PDFOptions {
  /** Page orientation */
  orientation?: 'portrait' | 'landscape';
  /** Optional subtitle below the title */
  subtitle?: string;
  /** Optional summary key-value pairs above the table */
  summary?: { label: string; value: string }[];
}

/**
 * Exports data to a PDF file with Arabic-friendly layout.
 * Uses right-to-left column ordering and Unicode-safe fonts.
 */
export function exportToPDF(
  title: string,
  columns: string[],
  rows: (string | number)[][],
  options: PDFOptions = {}
) {
  const { orientation = 'portrait', subtitle, summary } = options;

  const doc = new jsPDF({ orientation, unit: 'mm', format: 'a4' });

  // ── Header ──
  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 20;

  doc.setFontSize(18);
  doc.text(title, pageWidth / 2, y, { align: 'center' });
  y += 8;

  if (subtitle) {
    doc.setFontSize(10);
    doc.setTextColor(120);
    doc.text(subtitle, pageWidth / 2, y, { align: 'center' });
    doc.setTextColor(0);
    y += 8;
  }

  // Date stamp
  doc.setFontSize(8);
  doc.setTextColor(150);
  doc.text(
    new Date().toLocaleString('ar-EG', { dateStyle: 'full', timeStyle: 'short' }),
    pageWidth / 2,
    y,
    { align: 'center' }
  );
  doc.setTextColor(0);
  y += 6;

  // ── Summary Section ──
  if (summary && summary.length > 0) {
    doc.setFontSize(10);
    const summaryStartX = pageWidth - 15;
    summary.forEach((item) => {
      doc.text(`${item.label}: ${item.value}`, summaryStartX, y, { align: 'right' });
      y += 6;
    });
    y += 4;
  }

  // ── Table ──
  // Reverse columns and rows for RTL display
  const rtlColumns = [...columns].reverse();
  const rtlRows = rows.map((row) => [...row].reverse().map(String));

  autoTable(doc, {
    head: [rtlColumns],
    body: rtlRows,
    startY: y,
    styles: {
      fontSize: 9,
      cellPadding: 4,
      halign: 'center',
      valign: 'middle',
      lineWidth: 0.1,
      lineColor: [220, 220, 220],
    },
    headStyles: {
      fillColor: [249, 115, 22], // primary orange
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'center',
    },
    alternateRowStyles: {
      fillColor: [248, 248, 248],
    },
    margin: { top: 15, right: 15, bottom: 15, left: 15 },
    didDrawPage: (data) => {
      // Footer with page number
      const pageHeight = doc.internal.pageSize.getHeight();
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text(
        `RT PRO - ${data.pageNumber}`,
        pageWidth / 2,
        pageHeight - 10,
        { align: 'center' }
      );
    },
  });

  // Download
  const safeName = title.replace(/[^\u0621-\u064A\w\s]/g, '').trim() || 'report';
  doc.save(`${safeName}.pdf`);
}

// ── Excel Export ────────────────────────────────────────────────────────────

/**
 * Exports data to an Excel (.xlsx) file using ExcelJS.
 */
export async function exportToExcel(
  title: string,
  columns: string[],
  rows: (string | number)[][]
) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(title.slice(0, 31));

  // RTL sheet direction
  worksheet.views = [{ rightToLeft: true }];

  // Header row
  const headerRow = worksheet.addRow(columns);
  headerRow.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFF97316' }, // primary orange
    };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
    cell.border = {
      top: { style: 'thin', color: { argb: 'FFDCDCDC' } },
      bottom: { style: 'thin', color: { argb: 'FFDCDCDC' } },
      left: { style: 'thin', color: { argb: 'FFDCDCDC' } },
      right: { style: 'thin', color: { argb: 'FFDCDCDC' } },
    };
  });

  // Data rows
  rows.forEach((row) => {
    const dataRow = worksheet.addRow(row);
    dataRow.eachCell((cell, colNumber) => {
      // Alternate row shading
      const rowIndex = dataRow.number;
      if (rowIndex % 2 === 0) {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFF8F8F8' },
        };
      }
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFDCDCDC' } },
        bottom: { style: 'thin', color: { argb: 'FFDCDCDC' } },
        left: { style: 'thin', color: { argb: 'FFDCDCDC' } },
        right: { style: 'thin', color: { argb: 'FFDCDCDC' } },
      };
    });
  });

  // Auto-width columns
  worksheet.columns.forEach((col, i) => {
    const maxDataLen = Math.max(
      columns[i]?.length ?? 0,
      ...rows.map((row) => String(row[i] ?? '').length)
    );
    col.width = Math.min(Math.max(maxDataLen + 2, 10), 40);
  });

  const safeName = title.replace(/[^\u0621-\u064A\w\s]/g, '').trim() || 'report';
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${safeName}.xlsx`;
  a.click();
  URL.revokeObjectURL(url);
}
