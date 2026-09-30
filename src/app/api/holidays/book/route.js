import PackageBooking from '../../../../../models/PackageBooking.js';
import { NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";

export async function POST(request) {
  try {
    const user = getUserFromRequest({
      cookies: { token: request.cookies.get('token')?.value },
    });
    if (!user?.id) {
      return NextResponse.json({ success: false, message: 'Login required' }, { status: 401 });
    }

    const {
      name, email, phone, altPhone, address, city, pincode,
      travelDate, packageName, offerPrice, razorpayPaymentId,
    } = await request.json();

    if (!name || !email || !phone || !address || !city || !pincode || !travelDate || !packageName || !Number.isFinite(Number(offerPrice)) || Number(offerPrice) <= 0) {
      return NextResponse.json({ success: false, message: 'Missing or invalid booking details' }, { status: 400 });
    }

    const booking = await PackageBooking.create({
      bookingId: `MMBY-PKG-${Date.now()}`,
      userId: String(user.id),
      packageName,
      customerName: name,
      customerEmail: email,
      customerPhone: phone,
      destination: city,
      travelDate,
      totalAmount: Number(offerPrice),
      currency: 'INR',
      status: 'CONFIRMED',
      paymentId: razorpayPaymentId || null,
      bookingDetails: { altPhone: altPhone || null, address, city, pincode },
      isDummy: false,
    });

    return NextResponse.json({ success: true, bookingId: booking.id, bookingReference: booking.bookingId }, { status: 201 });
  } catch (error) {
    console.error('holidays/book error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
