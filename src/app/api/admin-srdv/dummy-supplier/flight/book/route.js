import { NextResponse } from 'next/server';

/**
 * POST /api/admin-srdv/dummy-supplier/flight/book
 * Dummy/mock flight booking — REAL SRDV booking stays disabled.
 * Mirrors old DummyFlightBookingProvider.book().
 */

function randomAlphaNumeric(length = 6) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no 0/O or 1/I confusion
  let res = '';
  for (let i = 0; i < length; i++) res += chars.charAt(Math.floor(Math.random() * chars.length));
  return res;
}

function randomNumeric(digits = 8) {
  let res = '';
  for (let i = 0; i < digits; i++) res += Math.floor(Math.random() * 10);
  return res;
}

export async function POST(request) {
  try {
    const bookingPayload = await request.json().catch(() => ({}));
    const { flightData = {}, passengers = [], seats = [], ssr = {}, totalAmount = 0, traceId = '' } = bookingPayload;

    const pnr = randomAlphaNumeric(6);
    const bookingId = `${Date.now().toString().slice(-4)}${randomNumeric(4)}`;
    const ticketNo = `910-${randomNumeric(10)}`;
    const invoiceNo = `INV-FL-${randomNumeric(6)}`;

    const passengerTickets = passengers.map((p, idx) => ({
      PassengerId: idx + 1,
      Title: p.title || 'Mr',
      FirstName: p.firstName || 'Traveler',
      LastName: p.lastName || `${idx + 1}`,
      PaxType: p.paxType || 1, // 1: Adult, 2: Child, 3: Infant
      TicketNumber: `${ticketNo}-${idx + 1}`,
      TicketId: parseInt(randomNumeric(7), 10),
      IssueDate: new Date().toISOString(),
      Status: 'Confirmed'
    }));

    const result = {
      success: true,
      provider: 'SRDV_DUMMY_V8',
      Response: {
        ResponseStatus: 1,
        TraceId: traceId || `TR-${Date.now()}`,
        Error: { ErrorCode: 0, ErrorMessage: '' },
        Response: {
          BookingId: bookingId,
          PNR: pnr,
          Status: 1,
          IsPriceChanged: false,
          IsTimeChanged: false,
          FlightItinerary: {
            BookingId: bookingId,
            PNR: pnr,
            IsLCC: Boolean(flightData.isLcc),
            ValidatingAirlineCode: flightData.airlineCode || '6E',
            AirlineName: flightData.airline || 'IndiGo',
            FlightNumber: flightData.flightNumber || '6E 204',
            Origin: flightData.origin || flightData.from || 'DEL',
            Destination: flightData.destination || flightData.to || 'BOM',
            DepartureTime: flightData.departureTime || '09:00',
            ArrivalTime: flightData.arrivalTime || '11:15',
            DepartureDate: flightData.departureDate || new Date().toISOString().split('T')[0],
            ArrivalDate: flightData.arrivalDate || flightData.departureDate || new Date().toISOString().split('T')[0],
            Fare: {
              Currency: 'INR',
              BaseFare: flightData.baseFare || Math.round(totalAmount * 0.8),
              Tax: flightData.tax || Math.round(totalAmount * 0.2),
              TotalFare: totalAmount,
              PublishedFare: totalAmount
            },
            Passenger: passengerTickets,
            Segments: flightData.segments || [
              {
                Origin: { AirportCode: flightData.origin || 'DEL', CityName: flightData.originCity || 'Delhi' },
                Destination: { AirportCode: flightData.destination || 'BOM', CityName: flightData.destinationCity || 'Mumbai' },
                Airline: { AirlineCode: flightData.airlineCode || '6E', FlightNumber: flightData.flightNumber || '6E 204' },
                DepTime: `${flightData.departureDate || '2026-10-15'}T${flightData.departureTime || '09:00'}:00`,
                ArrTime: `${flightData.arrivalDate || flightData.departureDate || '2026-10-15'}T${flightData.arrivalTime || '11:15'}:00`,
                CabinClass: flightData.cabinClass || 'Economy'
              }
            ],
            Seats: seats,
            SSR: ssr,
            Ticket: {
              TicketId: parseInt(randomNumeric(7), 10),
              TicketNumber: ticketNo,
              InvoiceNumber: invoiceNo,
              IssueDate: new Date().toISOString(),
              Status: 'Confirmed'
            }
          }
        }
      }
    };

    return NextResponse.json(result);
  } catch (err) {
    console.error('Dummy flight booking error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
