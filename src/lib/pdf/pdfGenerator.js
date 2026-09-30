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
          const totalFlightFare = d.totalFare ?? d.totalPrice ?? (d.fare ? (Number(d.fare) + Number(d.tax || 0)) : null);
          const fareStr = totalFlightFare ? ` | Fare: Rs. ${Number(totalFlightFare).toLocaleString('en-IN')}` : '';
          svcDetails = `${d.airline || 'Flight'} ${d.flightNumber || ''}${route}${timing}${fareStr}`.trim();
        } else if (svc.type === 'hotel') {
          const d = svc.data || {};
          const starStr = d.stars ? ` (${d.stars} Star)` : '';
          const roomStr = d.room ? ` | ${d.room}` : '';
          const mealStr = d.meal ? ` | ${d.meal}` : '';
          const totalHotelCost = d.totalPrice ?? d.totalFare;
          const priceStr = totalHotelCost != null
            ? ` | Total: Rs. ${Number(totalHotelCost).toLocaleString('en-IN')}`
            : (d.price ? ` | Rs. ${Number(d.price).toLocaleString('en-IN')}/night` : '');
          svcDetails = `${d.name || 'Hotel Stay'}${starStr}${roomStr}${mealStr}${priceStr}`.trim();
        } else if (svc.type === 'cab') {
          const d = svc.data || {};
          const catStr = d.category ? ` (${d.category})` : '';
          const routeStr = d.pickup && d.drop ? ` | ${d.pickup} -> ${d.drop}` : '';
          const cabTotal = d.totalPrice ?? d.totalFare ?? d.price;
          const priceStr = cabTotal ? ` | Rs. ${Number(cabTotal).toLocaleString('en-IN')}` : '';
          svcDetails = `${d.vehicle || 'Cab'}${catStr}${routeStr}${priceStr}`.trim();
        } else if (svc.type === 'bus') {
          const d = svc.data || {};
          const typeStr = d.busType ? ` (${d.busType})` : '';
          const routeStr = d.from && d.to ? ` | ${d.from} -> ${d.to}` : '';
          const timeStr = d.departure || d.arrival ? ` | ${d.departure || ''} - ${d.arrival || ''}` : '';
          const busTotal = d.totalPrice ?? d.totalFare;
          const priceStr = busTotal != null
            ? ` | Total: Rs. ${Number(busTotal).toLocaleString('en-IN')}`
            : (d.price ? ` | Rs. ${Number(d.price).toLocaleString('en-IN')}/seat` : '');
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

export function generateBookingPdf(booking, user = {}) {
  if (!booking || !booking.type) throw new Error('Booking data is required to generate the PDF.');

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4', compress: true });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const left = 16;
  const right = pageWidth - 16;
  const valueX = 67;
  const valueWidth = right - valueX;
  let y = 42;

  const parse = (value) => {
    if (!value) return null;
    if (typeof value === 'object') return value;
    try { return JSON.parse(value); } catch { return null; }
  };
  const array = (value) => {
    const parsed = parse(value);
    return Array.isArray(parsed) ? parsed : [];
  };
  const details = { ...booking, ...(parse(booking.booking_details) || parse(booking.bookingSnapshot) || parse(booking.bookingDetails) || {}) };
  const rooms = parse(details.roomDetails || booking.rooms);
  const room = (Array.isArray(rooms) ? parse(rooms[0]) : rooms) || {};
  const passengers = array(booking.passenger_data || booking.passengers || details.passengers);
  const boarding = parse(booking.boarding_point || booking.boardingPoint) || {};
  const dropping = parse(booking.dropping_point || booking.droppingPoint) || {};
  const hotelAddress = booking.address || [booking.city, booking.state, booking.country].filter(Boolean).join(', ');
  const reference = booking.bookingId || booking.bookingRefNo || booking.confirmationNo || booking.referenceNo || booking.id || 'N/A';
  const amount = booking.amount ?? booking.totalAmount ?? booking.total_price ?? booking.offer_price;
  const customerName = booking.customerName || details.customerName || user.name || passengers[0]?.name || [passengers[0]?.title || passengers[0]?.Title, passengers[0]?.firstName || passengers[0]?.FirstName, passengers[0]?.lastName || passengers[0]?.LastName].filter(Boolean).join(' ');
  const customerEmail = booking.customerEmail || details.customerEmail || user.email || passengers[0]?.email || passengers[0]?.Email;
  const customerPhone = booking.customerPhone || details.customerPhone || user.phone || passengers[0]?.mobile || passengers[0]?.Mobile;
  const display = (value) => value === undefined || value === null || value === '' ? 'N/A' : String(value);
  const money = (value) => {
    const numeric = Number(value);
    return Number.isFinite(numeric) ? `${booking.currency || 'INR'} ${numeric.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : 'N/A';
  };
  const pointName = (point) => point?.Name || point?.Location || (typeof point === 'string' ? point : 'N/A');
  const passengerName = (person) => person.name || [person.title || person.Title, person.firstName || person.FirstName, person.lastName || person.LastName].filter(Boolean).join(' ') || 'Passenger';

  function drawPageHeader() {
    doc.setFillColor(26, 18, 5);
    doc.rect(0, 0, pageWidth, 29, 'F');
    doc.setFillColor(200, 144, 26);
    doc.roundedRect(left, 7, 15, 15, 2, 2, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(26, 18, 5);
    doc.text('MMBY', left + 2.1, 16);
    doc.setFontSize(14);
    doc.setTextColor(255, 255, 255);
    doc.text('Make My Bharat Yatra', 36, 13);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(230, 220, 200);
    doc.text(`${booking.type} Booking Details`, 36, 20);
  }

  function nextPage() {
    doc.addPage();
    drawPageHeader();
    y = 40;
  }

  function ensureRoom(height) {
    if (y + height > pageHeight - 20) nextPage();
  }

  function addSection(title, rows) {
    const validRows = rows.filter(([, value]) => value !== undefined && value !== null && value !== '');
    if (!validRows.length) return;
    ensureRoom(14);
    doc.setFillColor(251, 243, 224);
    doc.roundedRect(left, y, right - left, 8, 1.5, 1.5, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(122, 80, 16);
    doc.text(title.toUpperCase(), left + 3, y + 5.5);
    y += 11;

    validRows.forEach(([label, rawValue]) => {
      const value = Array.isArray(rawValue) ? rawValue.map(display).join(', ') : display(rawValue);
      const wrapped = doc.splitTextToSize(value, valueWidth);
      const rowHeight = Math.max(7, wrapped.length * 4.1 + 3);
      ensureRoom(rowHeight);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(110, 100, 82);
      doc.text(String(label), left + 2, y + 3.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(35, 29, 20);
      doc.text(wrapped, valueX, y + 3.5);
      doc.setDrawColor(237, 229, 216);
      doc.line(left + 2, y + rowHeight, right - 2, y + rowHeight);
      y += rowHeight;
    });
    y += 5;
  }

  drawPageHeader();
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(26, 18, 5);
  doc.text('BOOKING CONFIRMATION', left, y);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 90, 74);
  doc.text(`Reference: ${display(reference)}     Status: ${display(booking.status).toUpperCase()}`, left, y + 6);
  y += 15;

  addSection('Booking & Customer', [
    ['Booking reference', reference],
    ['Booking date', booking.created_at || booking.createdAt],
    ['Status', booking.status],
    ['Customer', customerName],
    ['Email', customerEmail],
    ['Phone', customerPhone],
  ]);

  if (booking.type === 'Flight') {
    addSection('Flight', [
      ['Airline', details.airline],
      ['Flight number', details.flightNumber],
      ['Origin', `${details.originCity || details.originName || details.originCode || details.origin || 'N/A'}${details.originCode ? ` (${details.originCode})` : ''}`],
      ['Destination', `${details.destinationCity || details.destinationName || details.destinationCode || details.destination || 'N/A'}${details.destinationCode ? ` (${details.destinationCode})` : ''}`],
      ['Departure', details.departureTime || details.departureDate],
      ['Arrival', details.arrivalTime || details.arrivalDate],
      ['Duration', details.duration],
      ['Cabin', details.cabinClass],
      ['PNR', booking.pnr],
      ['Ticket number', booking.ticketNumber],
    ]);
    addSection('Passengers', passengers.map((person, index) => [`Passenger ${index + 1}`, `${passengerName(person)}${person.age ? `, age ${person.age}` : ''}${person.seat ? `, seat ${person.seat}` : ''}${person.email ? `, ${person.email}` : ''}`]));
    addSection('Fare & Payment', [['Base fare', money(booking.baseFare || details.fare?.baseFare)], ['Tax', money(booking.tax || details.fare?.tax)], ['Total', money(amount)], ['Payment ID', booking.paymentId || booking.payment_id]]);
    const fareRules = array(booking.fareRules || details.fareRule);
    addSection('Fare Rules', fareRules.map((rule, index) => [`Rule ${index + 1}`, typeof rule === 'string' ? rule : rule.timeframe || rule.PolicyString || rule.fee || 'Policy details']));
  } else if (booking.type === 'Hotel') {
    addSection('Hotel & Stay', [
      ['Hotel', booking.hotelName || booking.hotel_name || details.hotelName],
      ['Address', hotelAddress],
      ['Check-in', booking.checkInDate || booking.checkin_date || details.checkin_date],
      ['Check-out', booking.checkOutDate || booking.checkout_date || details.checkout_date],
      ['Room', room.RoomTypeName || booking.roomTypeName],
      ['Bed type', room.BedTypes || booking.bedType],
      ['Guests', booking.guestCount || (parse(booking.guests) || []).length],
      ['Booking reference', booking.bookingRefNo || booking.confirmationNo || reference],
    ]);
    addSection('Guests', array(booking.guests || details.passengerDetails).map((person, index) => [`Guest ${index + 1}`, passengerName(person)]));
    addSection('Amenities', [['Included amenities', array(room.Amenities || booking.inclusions).map((item) => typeof item === 'string' ? item : item.Name || item.name || item.title || '').filter(Boolean)]]);
    addSection('Cancellation Policy', array(booking.cancellationPolicy || room.CancellationPolicies).map((policy, index) => [`Policy ${index + 1}`, policy.PolicyString || `${policy.FromDate || ''} - ${policy.ToDate || ''}: ${policy.Currency || booking.currency || 'INR'} ${policy.Charge ?? policy.CancellationCharge ?? ''}`]));
    addSection('Pricing', [['Price per night', money(booking.pricePerNight)], ['Tax', money(booking.tax)], ['Total', money(amount)], ['Payment ID', booking.paymentId]]);
  } else if (booking.type === 'Car') {
    const driver = parse(booking.driverDetails) || {};
    addSection('Car & Journey', [
      ['Vehicle', booking.vehicleName || details.carName],
      ['Type', booking.category || details.carType || booking.type],
      ['Pickup', booking.pickupLocation || booking.pickupCity || details.pickupLocation],
      ['Pickup date / time', `${booking.pickupDate || details.pickupDate || ''} ${booking.pickupTime || details.pickupTime || ''}`],
      ['Drop', booking.dropLocation || booking.dropCity || details.dropLocation],
      ['Drop date / time', `${details.dropDate || ''} ${details.dropTime || ''}`],
      ['Passengers', array(booking.passengers).length || booking.passengersCount || details.passengers],
      ['Driver', driver.driverName || details.driverName],
      ['Driver contact', driver.contact || details.driverPhone],
      ['Reference', booking.referenceNo || booking.confirmationNo || reference],
    ]);
    addSection('Pricing', [['Base fare', money(booking.baseFare)], ['Driver allowance', money(booking.driverAllowance)], ['Total', money(amount)]]);
  } else if (booking.type === 'Bus') {
    addSection('Bus & Journey', [
      ['Operator', booking.operator || booking.bus_name],
      ['Bus number', booking.bus_number],
      ['Bus type', booking.busType || booking.bus_type],
      ['Travel date', booking.travelDate || booking.travel_date],
      ['Boarding point', `${pointName(boarding)}${boarding.Address ? `, ${boarding.Address}` : ''}`],
      ['Dropping point', `${pointName(dropping)}${dropping.Address ? `, ${dropping.Address}` : ''}`],
      ['Departure', booking.departureTime || boarding.Time],
      ['Arrival', booking.arrivalTime || dropping.Time],
      ['Seats', booking.seat_number || array(booking.seats).map((seat) => seat.SeatName || seat.SeatNumber).filter(Boolean).join(', ')],
      ['Ticket / PNR', booking.ticketNo || booking.operatorPnr || reference],
    ]);
    addSection('Passengers', passengers.map((person, index) => {
      const seat = person.SeatDetails || {};
      return [`Passenger ${index + 1}`, `${passengerName(person)}${person.Age ? `, age ${person.Age}` : ''}${seat.SeatNumber || seat.SeatName || person.seat ? `, seat ${seat.SeatNumber || seat.SeatName || person.seat}` : ''}${person.Email ? `, ${person.Email}` : ''}`];
    }));
    addSection('Cancellation Policy', array(booking.cancellation_policy || booking.cancellationPolicy).map((policy, index) => [`Policy ${index + 1}`, policy.PolicyString || `${policy.CancellationCharge ?? ''}${policy.CancellationChargeType === 2 ? '%' : booking.currency || 'INR'}`]));
    addSection('Payment', [['Fare', money(booking.fare)], ['Tax', money(booking.tax)], ['Total', money(amount)], ['Payment ID', booking.paymentId || booking.payment_id], ['Trace ID', booking.traceId || booking.trace_id]]);
  } else if (booking.type === 'Package') {
    addSection('Package', [
      ['Name', booking.packageName || details.packageName],
      ['Destination', booking.destination || details.destination],
      ['Duration', details.duration],
      ['Travel date', booking.travelDate || details.travelDate],
      ['Adults', details.adults],
      ['Children', details.children],
      ['Hotel', details.hotel],
      ['Customer', booking.customerName || details.customerName],
      ['Email', booking.customerEmail || details.customerEmail],
      ['Phone', booking.customerPhone || details.customerPhone],
      ['Reference', reference],
    ]);
    addSection('Inclusions', array(booking.servicesBooked || details.inclusions).map((item, index) => [`Included ${index + 1}`, typeof item === 'string' ? item : item.name || item.title || item.type || 'Service']));
    addSection('Pricing', [['Total', money(amount)], ['Payment ID', booking.paymentId || booking.payment_id]]);
  } else {
    throw new Error(`Unsupported booking type: ${booking.type}`);
  }

  const pageCount = doc.getNumberOfPages();
  for (let page = 1; page <= pageCount; page += 1) {
    doc.setPage(page);
    doc.setDrawColor(237, 229, 216);
    doc.line(left, pageHeight - 14, right, pageHeight - 14);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(120, 110, 92);
    doc.text('Make My Bharat Yatra | Please carry valid travel identification.', left, pageHeight - 8);
    doc.text(`Page ${page} of ${pageCount}`, right, pageHeight - 8, { align: 'right' });
  }

  const safeType = String(booking.type).replace(/[^a-z0-9]/gi, '');
  const safeReference = String(reference).replace(/[^a-z0-9-]/gi, '');
  doc.save(`MMBY-${safeType}-${safeReference}.pdf`);
  return true;
}
