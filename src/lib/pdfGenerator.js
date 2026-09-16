import { toCanvas } from 'html-to-image';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

/**
 * Generates a high-fidelity, multi-page A4 PDF directly from the rendered Customer Preview DOM element.
 * Visually matches the Customer Preview exactly (colors, typography, layout, banner, tables, pricing, itinerary).
 */
export async function downloadCustomerPreviewAsPdf(element, filename = 'Holiday-Itinerary.pdf') {
  if (!element) {
    throw new Error('Customer Preview DOM element was not found.');
  }

  const safeFilename = filename.toLowerCase().endsWith('.pdf') ? filename : `${filename}.pdf`;

  // Wait for any images inside the preview to complete loading
  const images = Array.from(element.querySelectorAll('img'));
  await Promise.all(
    images.map((img) => {
      if (img.complete) return Promise.resolve();
      return new Promise((resolve) => {
        img.onload = resolve;
        img.onerror = resolve;
        setTimeout(resolve, 2000);
      });
    })
  );

  const placeholderPixel =
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAVy38yAAAAAElFTkSuQmCC';

  let canvas;
  try {
    canvas = await toCanvas(element, {
      backgroundColor: '#ffffff',
      pixelRatio: 2,
      skipFonts: true,
      cacheBust: false,
      imagePlaceholder: placeholderPixel,
      filter: (node) => {
        if (
          node.classList &&
          (node.classList.contains('print:hidden') ||
            node.id === 'preview-action-bar' ||
            node.getAttribute?.('aria-hidden') === 'true')
        ) {
          return false;
        }
        return true;
      }
    });
  } catch (err) {
    console.warn('html-to-image toCanvas failed, attempting html2canvas DOM capture:', err);
    canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: false,
      backgroundColor: '#ffffff',
      logging: false,
      ignoreElements: (node) =>
        node.classList && node.classList.contains('print:hidden')
    });
  }

  if (!canvas || canvas.width === 0 || canvas.height === 0) {
    throw new Error('Canvas render was empty.');
  }

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true
  });

  const pdfPageWidth = 210; // A4 width mm
  const pdfPageHeight = 297; // A4 height mm
  const pxPerMm = canvas.width / pdfPageWidth;
  const pageHeightInPx = Math.floor(pdfPageHeight * pxPerMm);
  const totalPages = Math.ceil(canvas.height / pageHeightInPx);

  for (let page = 0; page < totalPages; page++) {
    const sourceY = page * pageHeightInPx;
    const currentSliceHeightPx = Math.min(pageHeightInPx, canvas.height - sourceY);

    const pageCanvas = document.createElement('canvas');
    pageCanvas.width = canvas.width;
    pageCanvas.height = currentSliceHeightPx;

    const ctx = pageCanvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
      ctx.drawImage(
        canvas,
        0,
        sourceY,
        canvas.width,
        currentSliceHeightPx,
        0,
        0,
        canvas.width,
        currentSliceHeightPx
      );
    }

    const pageImgData = pageCanvas.toDataURL('image/jpeg', 0.95);
    const sliceHeightInMm = (currentSliceHeightPx / canvas.width) * pdfPageWidth;

    if (page > 0) {
      pdf.addPage('a4', 'portrait');
    }

    pdf.addImage(pageImgData, 'JPEG', 0, 0, pdfPageWidth, sliceHeightInMm, undefined, 'FAST');
  }

  pdf.save(safeFilename);
  return true;
}

/**
 * Downloads a DOM element as a high-fidelity PDF file.
 */
export async function downloadElementAsPdf(element, filename = 'package-itinerary.pdf') {
  return downloadCustomerPreviewAsPdf(element, filename);
}

/**
 * Generates an official, beautifully structured TravelPro Holiday Package PDF voucher
 */
export function generatePackagePdf(pkg, filename = 'TravelPro-Holiday-Package.pdf') {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const safeFilename = filename.toLowerCase().endsWith('.pdf') ? filename : `${filename}.pdf`;
  const pageWidth = doc.internal.pageSize.getWidth(); // 210mm
  let y = 14;

  // 1. Top Brand Banner
  doc.setFillColor(17, 24, 39); // #111827 Dark Navy
  doc.rect(0, 0, pageWidth, 24, 'F');

  // Orange accent pill
  doc.setFillColor(249, 115, 22); // #F97316 Orange
  doc.roundedRect(14, 5, 8, 8, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('TP', 15.5, 10.5);

  doc.setFontSize(15);
  doc.setFont('helvetica', 'bold');
  doc.text('TravelPro — Holiday Package Voucher', 26, 11);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184);
  doc.text('Explore More | GSTIN: 07AAACT9182P1Z5 | Support: support@travelpro.com | +91 1800-102-8728', 26, 17);

  y = 32;

  // 2. Package Overview Card
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, y, pageWidth - 28, 26, 2, 2, 'FD');

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(pkg.title || pkg.name || 'Holiday Tour Package', 18, y + 8);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  const dest = pkg.destination || pkg.city || 'Manali, Himachal Pradesh';
  const duration = `${pkg.days?.length || 3} Days / ${Math.max((pkg.days?.length || 3) - 1, 1)} Nights`;
  const travelers = `${pkg.travelers?.adults || 2} Adults · ${pkg.travelers?.children || 0} Child`;
  doc.text(`Destination: ${dest}   |   Duration: ${duration}   |   Travelers: ${travelers}`, 18, y + 16);

  const finalPrice = Math.round(Number(pkg.pricingBreakdown?.final || pkg.offerPrice || pkg.totalPrice || 24999));
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(249, 115, 22);
  doc.text(`Rs. ${finalPrice.toLocaleString('en-IN')}`, pageWidth - 20, y + 12, { align: 'right' });
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Total Package Price', pageWidth - 20, y + 17, { align: 'right' });

  y += 33;

  // 3. Financial Breakdown
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('Cost Breakdown & Inclusions', 14, y);
  y += 4;

  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, y, pageWidth - 28, 20, 1.5, 1.5, 'S');

  const p = pkg.pricingBreakdown || {};
  const baseCost = p.base || Math.round(finalPrice * 0.85);
  const markup = p.markup || pkg.pricing?.markup || 3000;
  const taxes = p.tax || pkg.pricing?.tax || 2600;
  const discount = p.discount || pkg.pricing?.discount || 1000;

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);

  doc.text(`Base Services: Rs. ${baseCost.toLocaleString('en-IN')}`, 18, y + 6);
  doc.text(`Agency Markup: Rs. ${Number(markup).toLocaleString('en-IN')}`, 68, y + 6);
  doc.text(`Taxes & GST: Rs. ${Number(taxes).toLocaleString('en-IN')}`, 118, y + 6);
  doc.text(`Discount: -Rs. ${Number(discount).toLocaleString('en-IN')}`, 160, y + 6);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  const perPerson = Math.round(finalPrice / Math.max((pkg.travelers?.adults || 2) + (pkg.travelers?.children || 0), 1));
  doc.text(`Net Payable: Rs. ${finalPrice.toLocaleString('en-IN')} (Per Person: Rs. ${perPerson.toLocaleString('en-IN')})`, 18, y + 14);

  y += 26;

  // 4. Day-by-Day Itinerary
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('Day-by-Day Travel Itinerary', 14, y);
  y += 6;

  const days = pkg.days || [];
  days.forEach((day, index) => {
    // Check if we need a page break
    if (y > 245) {
      doc.addPage();
      y = 16;
    }

    // Day Header
    doc.setFillColor(238, 242, 255); // Indigo/Blue tint
    doc.setDrawColor(199, 210, 254);
    doc.roundedRect(14, y, pageWidth - 28, 8, 1, 1, 'FD');

    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 64, 175);
    doc.text(`DAY ${index + 1}: ${day.title || 'Day Tour'}`, 18, y + 5.5);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(`${day.location || dest}`, pageWidth - 20, y + 5.5, { align: 'right' });
    y += 10;

    // Day Services
    const services = (day.services || []).filter(s => s.selected !== false);
    if (services.length === 0) {
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text('Leisure day / no scheduled group transfer.', 18, y + 4);
      y += 8;
    } else {
      services.forEach(svc => {
        if (y > 270) {
          doc.addPage();
          y = 16;
        }

        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(15, 23, 42);

        let svcTitle = svc.type ? svc.type.toUpperCase() : 'SERVICE';
        let svcDetails = '';

        if (svc.type === 'flight') {
          const d = svc.data || {};
          const route = d.from && d.to ? ` | ${d.from} -> ${d.to}` : '';
          const timing = d.departure || d.arrival ? ` | ${d.departure || ''} - ${d.arrival || ''}` : '';
          const fareStr = d.fare ? ` | Fare: Rs. ${Number(d.fare).toLocaleString('en-IN')}` : '';
          svcDetails = `${d.airline || 'Flight'} ${d.flightNumber || ''}${route}${timing}${fareStr}`.trim();
        } else if (svc.type === 'hotel') {
          const d = svc.data || {};
          const starStr = d.stars ? ` (${d.stars} Star)` : '';
          const roomStr = d.room ? ` | ${d.room}` : '';
          const mealStr = d.meal ? ` | ${d.meal}` : '';
          const priceStr = d.price ? ` | Rs. ${Number(d.price).toLocaleString('en-IN')}/night` : '';
          svcDetails = `${d.name || 'Hotel Stay'}${starStr}${roomStr}${mealStr}${priceStr}`.trim();
        } else if (svc.type === 'cab') {
          const d = svc.data || {};
          const catStr = d.category ? ` (${d.category})` : '';
          const routeStr = d.pickup && d.drop ? ` | ${d.pickup} -> ${d.drop}` : '';
          const priceStr = d.price ? ` | Rs. ${Number(d.price).toLocaleString('en-IN')}` : '';
          svcDetails = `${d.vehicle || 'Cab'}${catStr}${routeStr}${priceStr}`.trim();
        } else if (svc.type === 'bus') {
          const d = svc.data || {};
          const typeStr = d.busType ? ` (${d.busType})` : '';
          const routeStr = d.from && d.to ? ` | ${d.from} -> ${d.to}` : '';
          const timeStr = d.departure || d.arrival ? ` | ${d.departure || ''} - ${d.arrival || ''}` : '';
          const priceStr = d.price ? ` | Rs. ${Number(d.price).toLocaleString('en-IN')}/seat` : '';
          svcDetails = `${d.operator || 'Bus'}${typeStr}${routeStr}${timeStr}${priceStr}`.trim();
        } else if (svc.type === 'sightseeing') {
          const items = svc.data?.items || [];
          svcDetails = items.map(i => i.name).join(', ') || 'Scenic local sightseeing tour';
        } else if (svc.type === 'activity') {
          const items = svc.data?.items || [];
          svcDetails = items.map(i => `${i.name} (${i.duration || '2h'})`).join(', ') || 'Adventure activity';
        } else if (svc.type === 'meal') {
          const items = (svc.data?.items || []).filter(m => m.enabled !== false);
          svcDetails = items.map(m => m.name).join(', ') || 'Complimentary meals';
        }

        // Bullet dot
        doc.setFillColor(249, 115, 22);
        doc.circle(18, y + 2, 1, 'F');

        doc.text(`[${svcTitle}]`, 22, y + 3);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(71, 85, 105);
        doc.text(svcDetails, 42, y + 3);
        y += 6;
      });
    }
    y += 4;
  });

  // 5. Footer & Terms
  if (y > 250) {
    doc.addPage();
    y = 20;
  }

  doc.setDrawColor(226, 232, 240);
  doc.line(14, y, pageWidth - 14, y);
  y += 5;

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184);
  doc.text('Important Notes: Check-in time standard 12:00 PM / Check-out 10:00 AM. Carry a valid Government Photo ID during travel.', 14, y);
  doc.text('Thank you for booking with TravelPro. Wishing you an unforgettable Bharat Yatra experience!', 14, y + 4);

  doc.save(safeFilename);
  return true;
}
