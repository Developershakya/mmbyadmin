import { NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import BusBooking from "../../../../../models/BusBooking.js";
import CarBooking from "../../../../../models/CarBooking.js";
import FlightBooking from "../../../../../models/FlightBooking.js";
import HotelBooking from "../../../../../models/HotelBooking.js";
import PackageBooking from "../../../../../models/PackageBooking.js";

const models = { Flight: FlightBooking, Hotel: HotelBooking, Car: CarBooking, Bus: BusBooking, Package: PackageBooking };

export async function POST(request) {
  const user = getUserFromRequest({
    cookies: { token: request.cookies.get("token")?.value },
  });
  if (!user?.id) return NextResponse.json({ message: "Authentication required" }, { status: 401 });

  try {
    const { id, type, reason } = await request.json();
    const Model = models[type];
    if (!Model || !id || !String(reason || "").trim()) {
      return NextResponse.json({ message: "Booking, type, and cancellation reason are required." }, { status: 400 });
    }

    const booking = await Model.findOne({ where: { id: String(id), userId: String(user.id) } });
    if (!booking) return NextResponse.json({ message: "Booking not found." }, { status: 404 });
    if (["CANCELLED", "CANCELED", "CANCEL_REQUESTED", "REFUNDED"].includes(String(booking.status).toUpperCase())) {
      return NextResponse.json({ message: "This booking is already cancelled or has a pending cancellation request." }, { status: 409 });
    }

    const requestDetails = { reason: String(reason).trim(), requestedAt: new Date().toISOString() };
    if (type === "Package") {
      const existingDetails = booking.bookingDetails && typeof booking.bookingDetails === "object" ? booking.bookingDetails : {};
      booking.bookingDetails = { ...existingDetails, cancellationRequest: requestDetails };
    } else {
      booking.cancellationDetails = requestDetails;
    }
    booking.status = "CANCEL_REQUESTED";
    await booking.save();

    return NextResponse.json({
      message: "Cancellation request submitted. Provider confirmation is still pending.",
      booking: { id: booking.id, type, status: booking.status },
    });
  } catch (error) {
    console.error("Cancellation request error:", error);
    return NextResponse.json({ message: "Unable to submit cancellation request." }, { status: 500 });
  }
}