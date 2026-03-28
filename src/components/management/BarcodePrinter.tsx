"use client";

import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';
import Barcode from 'react-barcode';

interface BarcodePrinterProps {
  value: string;
  name: string;
  price?: number;
}

export function BarcodePrinter({ value, name, price }: BarcodePrinterProps) {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    if (!printRef.current) return;
    const printContent = printRef.current.innerHTML;

    // Create an iframe to print isolated content without affecting the current page
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = 'none';

    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (doc) {
      doc.open();
      // Add styling optimized for typical thermal barcode printers (e.g., 50x30mm)
      doc.write(`
        <html>
          <head>
            <title>طباعة باركود</title>
            <style>
              @page { margin: 0; size: 50mm 30mm; }
              body {
                margin: 0;
                padding: 2mm;
                font-family: Arial, sans-serif;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                height: 100vh;
                text-align: center;
              }
              .name { font-size: 10px; font-weight: bold; margin-bottom: 2px; max-width: 100%; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }
              .price { font-size: 12px; font-weight: bold; margin-top: 2px; }
              .barcode-container svg { width: 100%; height: 18mm; max-width: 45mm; }
            </style>
          </head>
          <body>
            ${printContent}
            <script>
              window.onload = () => {
                setTimeout(() => {
                  window.print();
                  setTimeout(() => window.parent.document.body.removeChild(window.frameElement), 1000);
                }, 500);
              };
            </script>
          </body>
        </html>
      `);
      doc.close();
    }
  };

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={handlePrint}
        className="h-10 w-10 rounded-xl bg-white/5 text-white/40 hover:text-white hover:bg-white/10 transition-all border border-white/5 active:scale-95"
        title="طباعة باركود"
      >
        <Printer className="w-5 h-5" />
      </Button>

      {/* Hidden print template */}
      <div style={{ display: 'none' }}>
        <div ref={printRef}>
          <div className="name" dir="rtl">${name}</div>
          <div className="barcode-container">
            <Barcode
              value={value}
              width={1.5}
              height={40}
              fontSize={12}
              margin={0}
              displayValue={true}
            />
          </div>
          {price && <div className="price">${price} ج.م</div>}
        </div>
      </div>
    </>
  );
}
