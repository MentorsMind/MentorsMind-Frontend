import jsPDF from 'jspdf';
import type { PaymentTransaction } from '../types/payment.types';

export interface ReceiptData extends PaymentTransaction {
  fullBreakdown?: {
    baseAmount: number;
    platformFeePercentage: number;
    platformFeeAmount: number;
    networkFeeAmount: number;
    totalDeductions: number;
    netAmount: number;
  };
  stellarDetails?: {
    transactionHash: string;
    ledgerSequence: number;
    timestamp: string;
    horizonUrl: string;
  };
}

export const generatePaymentReceipt = (transaction: ReceiptData): void => {
  const doc = new jsPDF();

  // Colors
  const primaryColor = [0, 123, 255]; // Stellar blue
  const textColor = [51, 51, 51];
  const lightGray = [245, 245, 245];
  const borderColor = [229, 229, 229];

  // Page dimensions
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  let yPosition = margin;

  // Helper functions
  const addText = (text: string, x: number, y: number, options: any = {}) => {
    doc.setTextColor(options.color || textColor);
    doc.setFontSize(options.size || 10);
    doc.setFont(options.font || 'helvetica', options.style || 'normal');
    doc.text(text, x, y, options.align ? { align: options.align } : undefined);
  };

  const addLine = (x1: number, y1: number, x2: number, y2: number, color = borderColor) => {
    doc.setDrawColor(color[0], color[1], color[2]);
    doc.setLineWidth(0.5);
    doc.line(x1, y1, x2, y2);
  };

  const addRect = (x: number, y: number, w: number, h: number, fill = false, color = lightGray) => {
    if (fill) {
      doc.setFillColor(color[0], color[1], color[2]);
      doc.rect(x, y, w, h, 'F');
    } else {
      doc.setDrawColor(color[0], color[1], color[2]);
      doc.setLineWidth(0.5);
      doc.rect(x, y, w, h);
    }
  };

  // Header
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(0, 0, pageWidth, 40, 'F');

  addText('MENTORSMIND', margin, 15, { size: 20, color: [255, 255, 255], style: 'bold' });
  addText('Payment Receipt', margin, 25, { size: 12, color: [255, 255, 255] });
  addText(`Receipt #${transaction.id.toUpperCase()}`, pageWidth - margin, 25, { size: 10, color: [255, 255, 255], align: 'right' });

  yPosition = 50;

  // Transaction Details Box
  addRect(margin, yPosition, pageWidth - 2 * margin, 80);
  yPosition += 10;

  addText('TRANSACTION DETAILS', margin + 5, yPosition, { size: 12, style: 'bold' });
  yPosition += 15;

  const details = [
    ['Date:', new Date(transaction.date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })],
    ['Mentor:', transaction.mentorName],
    ['Description:', transaction.description],
    ['Type:', transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)],
    ['Status:', transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)],
  ];

  details.forEach(([label, value]) => {
    addText(label, margin + 5, yPosition, { size: 9, style: 'bold' });
    addText(value, margin + 40, yPosition, { size: 9 });
    yPosition += 8;
  });

  yPosition += 10;

  // Amount Breakdown
  if (transaction.fullBreakdown) {
    addRect(margin, yPosition, pageWidth - 2 * margin, 60);
    yPosition += 10;

    addText('AMOUNT BREAKDOWN', margin + 5, yPosition, { size: 12, style: 'bold' });
    yPosition += 15;

    const breakdown = [
      ['Gross Amount:', `${transaction.fullBreakdown.baseAmount} ${transaction.currency}`],
      ['Platform Fee:', `${transaction.fullBreakdown.platformFeeAmount} ${transaction.currency} (${transaction.fullBreakdown.platformFeePercentage}%)`],
      ['Network Fee:', `${transaction.fullBreakdown.networkFeeAmount} ${transaction.currency}`],
      ['Net Amount:', `${transaction.fullBreakdown.netAmount} ${transaction.currency}`, true],
    ];

    breakdown.forEach(([label, value, isTotal]) => {
      if (isTotal) {
        addLine(margin + 5, yPosition - 3, pageWidth - margin - 5, yPosition - 3);
        yPosition += 2;
        addText(label, margin + 5, yPosition, { size: 10, style: 'bold' });
        addText(value, pageWidth - margin - 5, yPosition, { size: 10, style: 'bold', align: 'right' });
      } else {
        addText(label, margin + 5, yPosition, { size: 9 });
        addText(value, pageWidth - margin - 5, yPosition, { size: 9, align: 'right' });
      }
      yPosition += 8;
    });

    yPosition += 10;
  } else {
    // Simple amount display
    addRect(margin, yPosition, pageWidth - 2 * margin, 30);
    yPosition += 10;

    addText('AMOUNT', margin + 5, yPosition, { size: 12, style: 'bold' });
    addText(`${transaction.type === 'refund' ? '-' : ''}${transaction.amount} ${transaction.currency}`,
            pageWidth - margin - 5, yPosition, { size: 14, style: 'bold', align: 'right' });
    yPosition += 20;
  }

  // Stellar Network Details
  if (transaction.stellarDetails) {
    yPosition += 10;
    addRect(margin, yPosition, pageWidth - 2 * margin, 50);
    yPosition += 10;

    addText('STELLAR NETWORK DETAILS', margin + 5, yPosition, { size: 12, style: 'bold' });
    yPosition += 15;

    const stellarDetails = [
      ['Transaction Hash:', transaction.stellarDetails.transactionHash],
      ['Ledger Sequence:', transaction.stellarDetails.ledgerSequence.toString()],
      ['Timestamp:', new Date(transaction.stellarDetails.timestamp).toLocaleString()],
    ];

    stellarDetails.forEach(([label, value]) => {
      addText(label, margin + 5, yPosition, { size: 8, style: 'bold' });
      // Handle long hash with word wrapping
      if (value.length > 40) {
        const words = value.match(/.{1,40}/g) || [value];
        words.forEach((word: string, index: number) => {
          addText(word, margin + 50, yPosition + (index * 5), { size: 8 });
        });
        yPosition += words.length * 5;
      } else {
        addText(value, margin + 50, yPosition, { size: 8 });
        yPosition += 8;
      }
    });

    yPosition += 10;
  }

  // Transaction Hash (always show)
  yPosition += 10;
  addRect(margin, yPosition, pageWidth - 2 * margin, 25);
  yPosition += 10;

  addText('TRANSACTION HASH', margin + 5, yPosition, { size: 10, style: 'bold' });
  yPosition += 8;

  // Split hash into chunks for better display
  const hash = transaction.stellarTxHash;
  const hashChunks = hash.match(/.{1,32}/g) || [hash];
  hashChunks.forEach((chunk: string) => {
    addText(chunk, margin + 5, yPosition, { size: 8, font: 'courier' });
    yPosition += 6;
  });

  // Footer
  yPosition = pageHeight - 30;
  addLine(margin, yPosition, pageWidth - margin, yPosition);

  yPosition += 10;
  addText('This receipt was generated electronically and is valid without signature.',
          pageWidth / 2, yPosition, { size: 8, align: 'center' });

  yPosition += 6;
  addText(`Generated on ${new Date().toLocaleString()} | MentorsMind - Powered by Stellar Network`,
          pageWidth / 2, yPosition, { size: 7, align: 'center' });

  // Save the PDF
  const fileName = `receipt_${transaction.id}_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
};

export const generateRefundReceipt = (transaction: ReceiptData): void => {
  // For refunds, we can reuse the same function but add refund-specific messaging
  const refundTransaction = {
    ...transaction,
    description: `Refund: ${transaction.description}`,
  };

  generatePaymentReceipt(refundTransaction);
};