import { NextResponse } from 'next/server';

/**
 * POST /api/admin-srdv/dummy-supplier/bus/book
 * Dummy/mock bus booking — REAL SRDV booking stays disabled.
 * Mirrors old DummyBusBookingProvider.book().
 */

function randomAlphaNumeric(length = 6) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
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
    const {
      busData = {},
      boardingPoint = {},
      droppingPoint = {},
      seats = [],
      passengers = [],
      totalAmount = 0,
      traceId = ''
    } = bookingPayload;

    const busId = `BUS${randomNumeric(6)}`;
    const ticketNo = `TKT-BS-${randomNumeric(8)}`;
    const operatorPnr = `OPR-${randomAlphaNumeric(6)}`;

    const result = {
      success: true,
      provider: 'SRDV_DUMMY_V5',
      Result: {
        TraceId: traceId || `TR-BS-${Date.now()}`,
        BusBookingStatus: 'Confirmed',
        BusId: busId,
        TicketNo: ticketNo,
        TravelOperatorPNR: operatorPnr,
        InvoiceAmount: totalAmount,
        TravelName: busData.operator || busData.TravelName || 'Zingbus Luxury Class',
        BusType: busData.busType || 'Volvo Multi-Axle A/C Sleeper',
        FromCity: busData.fromCity || busData.from || 'Delhi',
        ToCity: busData.toCity || busData.to || 'Manali',
        TravelDate: busData.travelDate || new Date().toISOString().split('T')[0],
        DepartureTime: busData.departureTime || '20:30',
        ArrivalTime: busData.arrivalTime || '08:30',
        BoardingPointDetails: boardingPoint,
        DroppingPointDetails: droppingPoint,
        Seats: seats,
        Passengers: passengers
      }
    };

    return NextResponse.json(result);
  } catch (err) {
    console.error('Dummy bus booking error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
