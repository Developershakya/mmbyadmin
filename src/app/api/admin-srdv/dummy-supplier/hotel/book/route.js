import { NextResponse } from 'next/server';

/**
 * POST /api/admin-srdv/dummy-supplier/hotel/book
 * Dummy/mock hotel booking — REAL SRDV booking stays disabled.
 * Mirrors old DummyHotelBookingProvider.book().
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
      hotelData = {},
      roomData = {},
      guests = [],
      checkInDate = '',
      checkOutDate = '',
      totalAmount = 0,
      traceId = ''
    } = bookingPayload;

    const bookingId = `HTL${randomNumeric(7)}`;
    const confirmationNo = `CFM-${randomAlphaNumeric(8)}`;
    const bookingRefNo = `SRDV-HT-${randomNumeric(6)}`;
    const invoiceNo = `INV-HT-${randomNumeric(6)}`;

    const result = {
      success: true,
      provider: 'SRDV_DUMMY_V5',
      BookResult: {
        ResponseStatus: 1,
        TraceId: traceId || `TR-HT-${Date.now()}`,
        Error: { ErrorCode: 0, ErrorMessage: '' },
        BookingId: bookingId,
        ConfirmationNo: confirmationNo,
        BookingRefNo: bookingRefNo,
        InvoiceNumber: invoiceNo,
        Status: 1,
        HotelBookingStatus: 'Confirmed',
        VoucherStatus: 'Confirmed',
        IsPriceChanged: false,
        IsCancellationPolicyChanged: false,
        HotelDetails: {
          HotelCode: hotelData.hotelCode || 'HTL-101',
          HotelName: hotelData.hotelName || hotelData.name || 'Alpine Luxury Resort',
          StarRating: hotelData.starRating || 4,
          Address: hotelData.address || hotelData.location || 'Mall Road',
          CityName: hotelData.city || 'Manali',
          CheckInDate: checkInDate,
          CheckOutDate: checkOutDate,
          RoomTypeName: roomData.roomTypeName || roomData.name || 'Deluxe Valley Room',
          RatePlanCode: roomData.ratePlanCode || 'CP-01',
          Inclusions: roomData.inclusions || ['Complimentary Breakfast', 'Free Wi-Fi'],
          Price: {
            Currency: 'INR',
            RoomPrice: Math.round(totalAmount * 0.85),
            Tax: Math.round(totalAmount * 0.15),
            TotalFare: totalAmount
          },
          HotelPassenger: guests.map((g, idx) => ({
            Title: g.title || 'Mr',
            FirstName: g.firstName || 'Guest',
            LastName: g.lastName || `${idx + 1}`,
            PaxType: g.paxType || 1
          }))
        }
      }
    };

    return NextResponse.json(result);
  } catch (err) {
    console.error('Dummy hotel booking error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
