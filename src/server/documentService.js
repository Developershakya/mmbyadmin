export function generateFlightTicketHtml(booking) {
  const paxList = Array.isArray(booking.passengers) ? booking.passengers : [];
  const segments = Array.isArray(booking.segments) ? booking.segments : [];
  const seg = segments[0] || {};

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>E-Ticket - ${booking.pnr || booking.bookingId}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #f8fafc; margin: 0; padding: 30px; color: #1e293b; }
    .ticket-card { max-width: 800px; margin: 0 auto; background: #fff; border-radius: 16px; box-shadow: 0 10px 25px rgba(0,0,0,0.05); border: 1px solid #e2e8f0; overflow: hidden; }
    .header { background: #0f172a; color: #fff; padding: 24px 32px; display: flex; justify-content: space-between; align-items: center; }
    .header h1 { margin: 0; font-size: 20px; font-weight: 700; letter-spacing: 0.5px; }
    .pnr-badge { background: #2563eb; color: #fff; padding: 8px 16px; border-radius: 8px; font-weight: bold; font-family: monospace; font-size: 16px; }
    .content { padding: 32px; }
    .flight-row { display: flex; justify-content: space-between; align-items: center; background: #f1f5f9; padding: 20px; border-radius: 12px; margin-bottom: 24px; }
    .city-block h2 { margin: 0; font-size: 28px; color: #0f172a; }
    .city-block p { margin: 4px 0 0; color: #64748b; font-size: 14px; }
    .plane-icon { font-size: 24px; color: #3b82f6; text-align: center; }
    .meta-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; border-bottom: 1px dashed #cbd5e1; padding-bottom: 20px; }
    .meta-item label { display: block; font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 600; margin-bottom: 4px; }
    .meta-item span { font-size: 15px; font-weight: 600; color: #0f172a; }
    .table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
    .table th { background: #f8fafc; text-align: left; padding: 10px; font-size: 12px; color: #475569; border-bottom: 1px solid #e2e8f0; }
    .table td { padding: 12px 10px; border-bottom: 1px solid #f1f5f9; font-size: 14px; }
    .footer { background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px 32px; display: flex; justify-content: space-between; align-items: center; }
    .btn-print { background: #0f172a; color: #fff; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-weight: 600; }
    @media print { .btn-print { display: none; } body { padding: 0; background: #fff; } .ticket-card { box-shadow: none; border: none; } }
  </style>
</head>
<body>
  <div class="ticket-card">
    <div class="header">
      <div>
        <h1>AIR TRAVEL ELECTRONIC TICKET</h1>
        <p style="margin:4px 0 0; font-size:13px; color:#94a3b8;">Issued by MakeMy91 Travel System</p>
      </div>
      <div>
        <span class="pnr-badge">PNR: ${booking.pnr}</span>
      </div>
    </div>
    <div class="content">
      <div class="flight-row">
        <div class="city-block">
          <h2>${booking.origin}</h2>
          <p>${booking.originCity || 'Departure'}</p>
          <p style="font-weight:bold; color:#0f172a; margin-top:6px;">${booking.departureTime}</p>
          <p style="font-size:12px;">${booking.departureDate}</p>
        </div>
        <div class="plane-icon">
          ✈
          <div style="font-size:11px; color:#64748b; margin-top:4px;">${booking.duration || '2h 00m'} • ${booking.stops || 'Direct'}</div>
        </div>
        <div class="city-block" style="text-align:right;">
          <h2>${booking.destination}</h2>
          <p>${booking.destinationCity || 'Arrival'}</p>
          <p style="font-weight:bold; color:#0f172a; margin-top:6px;">${booking.arrivalTime}</p>
          <p style="font-size:12px;">${booking.arrivalDate || booking.departureDate}</p>
        </div>
      </div>

      <div class="meta-grid">
        <div class="meta-item"><label>Airline</label><span>${booking.airline} (${booking.airlineCode})</span></div>
        <div class="meta-item"><label>Flight Number</label><span>${booking.flightNumber}</span></div>
        <div class="meta-item"><label>Cabin Class</label><span>${booking.cabinClass}</span></div>
        <div class="meta-item"><label>Booking Status</label><span style="color:#16a34a;">${booking.status}</span></div>
      </div>

      <div class="meta-grid">
        <div class="meta-item"><label>Booking ID</label><span>${booking.bookingId}</span></div>
        <div class="meta-item"><label>Ticket Number</label><span>${booking.ticketNumber}</span></div>
        <div class="meta-item"><label>Baggage Included</label><span>15 Kg Check-in, 7 Kg Cabin</span></div>
        <div class="meta-item"><label>Total Paid</label><span>₹${Number(booking.totalAmount).toLocaleString('en-IN')}</span></div>
      </div>

      <h3 style="font-size:14px; text-transform:uppercase; color:#475569; margin-bottom:12px;">Traveler Details</h3>
      <table class="table">
        <thead>
          <tr>
            <th>Passenger Name</th>
            <th>Type</th>
            <th>Ticket Number</th>
            <th>Seat Number</th>
            <th>Meal / SSR</th>
          </tr>
        </thead>
        <tbody>
          ${paxList.map((p, idx) => `
            <tr>
              <td style="font-weight:600;">${p.title || 'Mr'} ${p.firstName || 'Traveler'} ${p.lastName || `${idx+1}`}</td>
              <td>${p.paxType === 2 ? 'Child' : p.paxType === 3 ? 'Infant' : 'Adult'}</td>
              <td style="font-family:monospace;">${booking.ticketNumber}-${idx + 1}</td>
              <td style="font-weight:bold; color:#2563eb;">${p.seat || (booking.seats?.[idx]?.seatNo) || 'Assigned at Check-in'}</td>
              <td>${p.meal || 'Complimentary / None'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div style="background:#f8fafc; padding:16px; border-radius:8px; border-left:4px solid #3b82f6; font-size:12px; color:#475569; line-height:1.6;">
        <strong>Important Travel Notice:</strong> Passengers are advised to carry a government-approved photo ID. Web check-in opens 48 hours prior to scheduled departure. Gate closes 25 minutes before departure.
      </div>
    </div>
    <div class="footer">
      <span style="font-size:12px; color:#64748b;">Support: support@makemy91.com • Helpline: 1800-91-TRAVEL</span>
      <button class="btn-print" onclick="window.print()">Print E-Ticket</button>
    </div>
  </div>
</body>
</html>`;
}

export function generateHotelVoucherHtml(booking) {
  const guests = Array.isArray(booking.guests) ? booking.guests : [];

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Hotel Voucher - ${booking.confirmationNo || booking.bookingId}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #f8fafc; margin: 0; padding: 30px; color: #1e293b; }
    .card { max-width: 800px; margin: 0 auto; background: #fff; border-radius: 16px; box-shadow: 0 10px 25px rgba(0,0,0,0.05); border: 1px solid #e2e8f0; overflow: hidden; }
    .header { background: #065f46; color: #fff; padding: 24px 32px; display: flex; justify-content: space-between; align-items: center; }
    .header h1 { margin: 0; font-size: 20px; }
    .cfm-badge { background: #047857; color: #fff; border: 1px solid #34d399; padding: 8px 16px; border-radius: 8px; font-weight: bold; font-family: monospace; }
    .content { padding: 32px; }
    .hotel-name { font-size: 24px; font-weight: bold; color: #0f172a; margin-bottom: 4px; }
    .hotel-address { color: #64748b; font-size: 14px; margin-bottom: 24px; }
    .stay-banner { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; background: #f0fdf4; border: 1px solid #bbf7d0; padding: 16px 20px; border-radius: 12px; margin-bottom: 24px; }
    .stay-banner div label { display: block; font-size: 11px; text-transform: uppercase; color: #166534; font-weight: 600; }
    .stay-banner div span { font-size: 16px; font-weight: 700; color: #065f46; }
    .meta-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; border-bottom: 1px dashed #cbd5e1; padding-bottom: 20px; }
    .meta-item label { display: block; font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 600; margin-bottom: 4px; }
    .meta-item span { font-size: 14px; font-weight: 600; color: #0f172a; }
    .footer { background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px 32px; display: flex; justify-content: space-between; align-items: center; }
    .btn-print { background: #065f46; color: #fff; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-weight: 600; }
    @media print { .btn-print { display: none; } body { padding: 0; background: #fff; } .card { box-shadow: none; border: none; } }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <div>
        <h1>HOTEL RESERVATION VOUCHER</h1>
        <p style="margin:4px 0 0; font-size:13px; color:#a7f3d0;">Confirmed Booking Voucher</p>
      </div>
      <div>
        <span class="cfm-badge">CFM: ${booking.confirmationNo}</span>
      </div>
    </div>
    <div class="content">
      <div class="hotel-name">${booking.hotelName}</div>
      <div class="hotel-address">📍 ${booking.address || 'Central City'}, ${booking.city}, ${booking.country || 'India'}</div>

      <div class="stay-banner">
        <div>
          <label>Check-In Date</label>
          <span>${booking.checkInDate} (12:00 PM)</span>
        </div>
        <div>
          <label>Check-Out Date</label>
          <span>${booking.checkOutDate} (11:00 AM)</span>
        </div>
        <div>
          <label>Duration & Rooms</label>
          <span>${booking.nights} Night(s) • ${booking.roomsCount} Room</span>
        </div>
      </div>

      <div class="meta-grid">
        <div class="meta-item"><label>Booking ID</label><span>${booking.bookingId}</span></div>
        <div class="meta-item"><label>Booking Reference</label><span>${booking.bookingRefNo}</span></div>
        <div class="meta-item"><label>Room Type</label><span>${booking.roomTypeName}</span></div>
        <div class="meta-item"><label>Status</label><span style="color:#16a34a;">${booking.status}</span></div>
      </div>

      <div class="meta-grid">
        <div class="meta-item"><label>Meal Plan</label><span>Complimentary Breakfast</span></div>
        <div class="meta-item"><label>Star Category</label><span>${booking.category || '4 Star'}</span></div>
        <div class="meta-item"><label>Inclusions</label><span>Breakfast, Wi-Fi, Parking</span></div>
        <div class="meta-item"><label>Total Amount Paid</label><span>₹${Number(booking.totalAmount).toLocaleString('en-IN')}</span></div>
      </div>

      <h3 style="font-size:14px; text-transform:uppercase; color:#475569; margin-bottom:12px;">Registered Guests</h3>
      <div style="background:#f8fafc; padding:16px; border-radius:8px; margin-bottom:24px;">
        ${guests.map((g, idx) => `
          <div style="padding:4px 0; font-size:14px; font-weight:600; color:#1e293b;">
            👤 Guest ${idx + 1}: ${g.title || 'Mr'} ${g.firstName || 'Traveler'} ${g.lastName || ''}
          </div>
        `).join('')}
      </div>

      <div style="background:#f8fafc; padding:16px; border-radius:8px; border-left:4px solid #059669; font-size:12px; color:#475569; line-height:1.6;">
        <strong>Hotel Check-in Policy:</strong> Standard check-in time is 12:00 PM. Please present this voucher along with government-issued photo ID upon arrival.
      </div>
    </div>
    <div class="footer">
      <span style="font-size:12px; color:#64748b;">MakeMy91 Hospitality Desk • Reservations Verified</span>
      <button class="btn-print" onclick="window.print()">Print Voucher</button>
    </div>
  </div>
</body>
</html>`;
}

export function generateBusTicketHtml(booking) {
  const paxList = Array.isArray(booking.passengers) ? booking.passengers : [];
  const seats = Array.isArray(booking.seats) ? booking.seats : [];

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Bus Ticket - ${booking.ticketNo || booking.bookingId}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #f8fafc; margin: 0; padding: 30px; color: #1e293b; }
    .card { max-width: 800px; margin: 0 auto; background: #fff; border-radius: 16px; box-shadow: 0 10px 25px rgba(0,0,0,0.05); border: 1px solid #e2e8f0; overflow: hidden; }
    .header { background: #7c2d12; color: #fff; padding: 24px 32px; display: flex; justify-content: space-between; align-items: center; }
    .header h1 { margin: 0; font-size: 20px; }
    .pnr-badge { background: #ea580c; color: #fff; padding: 8px 16px; border-radius: 8px; font-weight: bold; font-family: monospace; }
    .content { padding: 32px; }
    .route-row { display: flex; justify-content: space-between; align-items: center; background: #fff7ed; border: 1px solid #ffedd5; padding: 20px; border-radius: 12px; margin-bottom: 24px; }
    .city-block h2 { margin: 0; font-size: 24px; color: #9a3412; }
    .city-block p { margin: 4px 0 0; color: #64748b; font-size: 14px; }
    .meta-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; border-bottom: 1px dashed #cbd5e1; padding-bottom: 20px; }
    .meta-item label { display: block; font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 600; margin-bottom: 4px; }
    .meta-item span { font-size: 14px; font-weight: 600; color: #0f172a; }
    .footer { background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px 32px; display: flex; justify-content: space-between; align-items: center; }
    .btn-print { background: #7c2d12; color: #fff; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-weight: 600; }
    @media print { .btn-print { display: none; } body { padding: 0; background: #fff; } .card { box-shadow: none; border: none; } }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <div>
        <h1>BUS TRAVEL BOARDING PASS</h1>
        <p style="margin:4px 0 0; font-size:13px; color:#fed7aa;">Confirmed Bus Reservation</p>
      </div>
      <div>
        <span class="pnr-badge">PNR: ${booking.operatorPnr}</span>
      </div>
    </div>
    <div class="content">
      <div class="route-row">
        <div class="city-block">
          <h2>${booking.fromCity}</h2>
          <p style="font-weight:bold; color:#0f172a;">${booking.departureTime}</p>
          <p style="font-size:12px;">${booking.travelDate}</p>
        </div>
        <div style="text-align:center; font-size:24px; color:#ea580c;">
          🚌
          <div style="font-size:12px; color:#9a3412; font-weight:600;">${booking.duration || '10 hrs'}</div>
        </div>
        <div class="city-block" style="text-align:right;">
          <h2>${booking.toCity}</h2>
          <p style="font-weight:bold; color:#0f172a;">${booking.arrivalTime}</p>
          <p style="font-size:12px;">${booking.travelDate}</p>
        </div>
      </div>

      <div class="meta-grid">
        <div class="meta-item"><label>Bus Operator</label><span>${booking.operator}</span></div>
        <div class="meta-item"><label>Bus Model</label><span>${booking.busType}</span></div>
        <div class="meta-item"><label>Ticket Number</label><span>${booking.ticketNo}</span></div>
        <div class="meta-item"><label>Status</label><span style="color:#16a34a;">${booking.status}</span></div>
      </div>

      <div class="meta-grid">
        <div class="meta-item"><label>Boarding Point</label><span>${booking.boardingPoint?.CityPointName || booking.boardingPoint?.location || 'ISBT Kashmiri Gate'}</span></div>
        <div class="meta-item"><label>Dropping Point</label><span>${booking.droppingPoint?.CityPointName || booking.droppingPoint?.location || 'Private Bus Stand'}</span></div>
        <div class="meta-item"><label>Seats Reserved</label><span style="color:#ea580c; font-weight:bold;">${seats.map(s => s.seatNo || s.name || s).join(', ') || 'Confirmed'}</span></div>
        <div class="meta-item"><label>Total Paid</label><span>₹${Number(booking.totalAmount).toLocaleString('en-IN')}</span></div>
      </div>

      <h3 style="font-size:14px; text-transform:uppercase; color:#475569; margin-bottom:12px;">Passenger List</h3>
      <div style="background:#f8fafc; padding:16px; border-radius:8px; margin-bottom:24px;">
        ${paxList.map((p, idx) => `
          <div style="padding:4px 0; font-size:14px; font-weight:600; color:#1e293b;">
            👤 ${p.name || `${p.firstName || 'Passenger'} ${p.lastName || idx+1}`} (Age: ${p.age || 28}, ${p.gender || 'Male'})
          </div>
        `).join('')}
      </div>

      <div style="background:#f8fafc; padding:16px; border-radius:8px; border-left:4px solid #ea580c; font-size:12px; color:#475569; line-height:1.6;">
        <strong>Boarding Advice:</strong> Please reach boarding point at least 30 minutes prior to departure. Show M-Ticket on your phone or printed copy to the bus conductor.
      </div>
    </div>
    <div class="footer">
      <span style="font-size:12px; color:#64748b;">MakeMy91 Bus Desk • Punctual Transit Guarantee</span>
      <button class="btn-print" onclick="window.print()">Print Ticket</button>
    </div>
  </div>
</body>
</html>`;
}

export function generateCarVoucherHtml(booking) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Cab Voucher - ${booking.confirmationNo || booking.bookingId}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #f8fafc; margin: 0; padding: 30px; color: #1e293b; }
    .card { max-width: 800px; margin: 0 auto; background: #fff; border-radius: 16px; box-shadow: 0 10px 25px rgba(0,0,0,0.05); border: 1px solid #e2e8f0; overflow: hidden; }
    .header { background: #431407; color: #fff; padding: 24px 32px; display: flex; justify-content: space-between; align-items: center; }
    .header h1 { margin: 0; font-size: 20px; }
    .cfm-badge { background: #d97706; color: #fff; padding: 8px 16px; border-radius: 8px; font-weight: bold; font-family: monospace; }
    .content { padding: 32px; }
    .meta-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; border-bottom: 1px dashed #cbd5e1; padding-bottom: 20px; }
    .meta-item label { display: block; font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 600; margin-bottom: 4px; }
    .meta-item span { font-size: 14px; font-weight: 600; color: #0f172a; }
    .footer { background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px 32px; display: flex; justify-content: space-between; align-items: center; }
    .btn-print { background: #431407; color: #fff; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-weight: 600; }
    @media print { .btn-print { display: none; } body { padding: 0; background: #fff; } .card { box-shadow: none; border: none; } }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <div>
        <h1>CHAUFFEUR CAB BOOKING VOUCHER</h1>
        <p style="margin:4px 0 0; font-size:13px; color:#fde68a;">Outstation / Transfer Voucher</p>
      </div>
      <div>
        <span class="cfm-badge">CFM: ${booking.confirmationNo}</span>
      </div>
    </div>
    <div class="content">
      <h2 style="margin:0 0 8px; font-size:22px;">${booking.vehicleName}</h2>
      <p style="color:#64748b; margin:0 0 24px;">Category: ${booking.category} • AC Cab</p>

      <div class="meta-grid">
        <div class="meta-item"><label>Pickup City</label><span>${booking.pickupCity}</span></div>
        <div class="meta-item"><label>Drop City</label><span>${booking.dropCity}</span></div>
        <div class="meta-item"><label>Pickup Date</label><span>${booking.pickupDate}</span></div>
        <div class="meta-item"><label>Pickup Time</label><span>${booking.pickupTime || '09:00 AM'}</span></div>
      </div>

      <div class="meta-grid">
        <div class="meta-item"><label>Booking ID</label><span>${booking.bookingId}</span></div>
        <div class="meta-item"><label>Reference Number</label><span>${booking.referenceNo}</span></div>
        <div class="meta-item"><label>Toll & Fuel</label><span>${booking.tollIncluded ? 'Tolls Included' : 'As per receipts'}</span></div>
        <div class="meta-item"><label>Status</label><span style="color:#16a34a;">${booking.status}</span></div>
      </div>

      <div class="meta-grid">
        <div class="meta-item"><label>Pickup Address</label><span style="grid-column: span 2;">${booking.pickupLocation || 'Specified Address'}</span></div>
        <div class="meta-item"><label>Drop Address</label><span>${booking.dropLocation || 'Hotel Destination'}</span></div>
        <div class="meta-item"><label>Total Paid</label><span>₹${Number(booking.totalAmount).toLocaleString('en-IN')}</span></div>
      </div>

      <div style="background:#f8fafc; padding:16px; border-radius:8px; border-left:4px solid #d97706; font-size:12px; color:#475569; line-height:1.6;">
        <strong>Driver Details:</strong> Driver contact details and vehicle registration number will be dispatched via SMS 2 hours prior to scheduled pickup time.
      </div>
    </div>
    <div class="footer">
      <span style="font-size:12px; color:#64748b;">MakeMy91 Fleet & Chauffeur Services</span>
      <button class="btn-print" onclick="window.print()">Print Voucher</button>
    </div>
  </div>
</body>
</html>`;
}
