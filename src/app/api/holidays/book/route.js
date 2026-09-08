import PackageBooking from '../../../../../models/PackageBooking.js';
import { NextResponse } from "next/server";
export async function POST(request) {

  const {
    name, email, phone, altPhone, address, city, pincode,
    travelDate, packageName, offerPrice, razorpayPaymentId,
  } = await request.json();

  if (!name || !email || !phone || !address || !city || !pincode || !travelDate || !packageName || !offerPrice) {
    return NextResponse.json({ success: false, message: 'Missing required booking details' }, { status: 400 });
  }

  try {
    const booking = await PackageBooking.create({
      name,
      email,
      phone,
      alt_phone: altPhone || null,
      address,
      city,
      pincode,
      travel_date: travelDate,
      package_name: packageName,
      offer_price: offerPrice,
      razorpay_payment_id: razorpayPaymentId || null,
    });

    return NextResponse.json({ success: true, bookingId: booking.id });
  } catch (error) {
    console.error('holidays/book error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
