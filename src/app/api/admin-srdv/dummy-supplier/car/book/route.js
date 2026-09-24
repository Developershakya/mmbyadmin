import { NextResponse } from 'next/server';

/**
 * POST /api/admin-srdv/dummy-supplier/car/book
 * Dummy/mock car booking — REAL SRDV booking stays disabled.
 * Mirrors old DummyCarBookingProvider.book().
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
    const { carData = {}, passengers = [], pickupDate = '', pickupTime = '', totalAmount = 0, traceId = '' } = bookingPayload;

    const bookingId = `CAB${randomNumeric(6)}`;
    const confirmationNo = `CAR-CFM-${randomAlphaNumeric(8)}`;
    const referenceNo = `SRDV-CR-${randomNumeric(6)}`;

    const result = {
      success: true,
      provider: 'SRDV_DUMMY_V8',
      Result: {
        TraceId: traceId || `TR-CR-${Date.now()}`,
        CarBookingStatus: 'Confirmed',
        BookingId: bookingId,
        ConfirmationNo: confirmationNo,
        ReferenceNo: referenceNo,
        VehicleName: carData.vehicleName || carData.name || carData.vehicle || 'Toyota Innova Crysta',
        Category: carData.category || 'INNOVA_OR_EQUIVALENT',
        PickupCity: carData.pickupCity || 'Delhi',
        DropCity: carData.dropCity || 'Manali',
        PickupLocation: carData.pickupLocation || carData.pickup || 'New Delhi Airport',
        DropLocation: carData.dropLocation || carData.drop || 'Manali Hotel',
        PickupDate: pickupDate || carData.date || '2026-10-15',
        PickupTime: pickupTime || carData.time || '09:00 AM',
        TotalAmount: totalAmount,
        Passengers: passengers,
        DriverDetails: {
          DriverName: 'Assigned 2 Hours Prior to Pickup',
          Contact: '+91 98765 43210',
          VehicleNumber: 'DL 01 AB 9988'
        }
      }
    };

    return NextResponse.json(result);
  } catch (err) {
    console.error('Dummy car booking error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
