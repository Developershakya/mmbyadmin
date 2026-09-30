import { NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import BusBooking from "../../../../models/BusBooking.js";
import CarBooking from "../../../../models/CarBooking.js";
import FlightBooking from "../../../../models/FlightBooking.js";
import HotelBooking from "../../../../models/HotelBooking.js";
import PackageBooking from "../../../../models/PackageBooking.js";

const bookingModels = [
  ["Flight", FlightBooking],
  ["Hotel", HotelBooking],
  ["Car", CarBooking],
  ["Bus", BusBooking],
  ["Package", PackageBooking],
];

function serializeBooking(type, instance) {
  const record = instance.get({ plain: true });
  const snapshot = record.bookingSnapshot && Object.keys(record.bookingSnapshot).length
    ? record.bookingSnapshot
    : record.bookingDetails || record.booking_details || {};
  return {
    ...record,
    type,
    amount: record.totalAmount ?? record.amount ?? record.offer_price ?? record.offerPrice ?? 0,
    currency: record.currency || "INR",
    created_at: record.createdAt || record.created_at || null,
    booking_details: snapshot,
  };
}

export async function GET(request) {
  const user = getUserFromRequest({
    cookies: { token: request.cookies.get("token")?.value },
  });

  if (!user?.id) {
    return NextResponse.json({ message: "Authentication required" }, { status: 401 });
  }

  const results = await Promise.allSettled(
    bookingModels.map(async ([type, Model]) => {
      const rows = await Model.findAll({
        where: { userId: String(user.id) },
        order: [["createdAt", "DESC"]],
      });
      return rows.map((row) => serializeBooking(type, row));
    })
  );

  const failed = results.filter((result) => result.status === "rejected");
  const bookings = results
    .filter((result) => result.status === "fulfilled")
    .flatMap((result) => result.value)
    .sort((left, right) => new Date(right.created_at || 0) - new Date(left.created_at || 0));

  if (failed.length === bookingModels.length) {
    console.error("User bookings query failed:", failed[0].reason);
    return NextResponse.json({ message: "Unable to load bookings" }, { status: 500 });
  }

  return NextResponse.json({ bookings });
}