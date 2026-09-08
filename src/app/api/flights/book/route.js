import { NextResponse } from "next/server";
import sequelize from "../../../../../config/sequelize.js";
import Booking from "../../../../../models/Booking.js";
import BookingLeg from "../../../../../models/BookingLeg.js";
import BookingPassenger from "../../../../../models/BookingPassenger.js";
import { callSrdvApi } from "@/lib/srdvApi";
function generateBookingRef() {
  const rand = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `MMBY${Date.now().toString().slice(-6)}${rand}`;
}

// âš ï¸ ADJUST: passenger field names (Title/FirstName/PaxType/Gender codes waghera)
// SRDV ki actual Book API docs ke hisaab se badalne padenge agar match na ho.

function toSrdvPassengers(passengers, contact) {
  return passengers.map((p, i) => ({
    Title: p.title,
    FirstName: p.firstName,
    LastName: p.lastName,
    PaxType: p.type === 'adult' ? 1 : p.type === 'child' ? 2 : 3,
    Gender: p.gender === 'Male' ? 1 : 2,
    DateOfBirth: p.dob || null,
    ContactNo: contact.phone,
    Email: contact.email,
    IsLeadPax: i === 0,
  }));
}

export async function POST(request) {
  const { tripType, legs, passengers, contact } = await request.json();
  // legs: [{ legIndex, traceId, resultIndex, price, airline_name, flight_number, origin_code, destination_code }]

  if (!Array.isArray(legs) || legs.length === 0 || !Array.isArray(passengers) || passengers.length === 0) {
    return NextResponse.json({ success: false, message: 'Legs aur passengers required hain.' }, { status: 400 });
  }
const srdvPassengers = toSrdvPassengers(passengers, contact);
  const bookedLegs = [];

  try {
    // Har leg apni independent Search se aayi thi (traceId alag), isliye har leg alag se book hogi
    for (const leg of legs) {
     const endpointName = 'Book';
const data = await callSrdvApi(process.env.FLIGHT_API_URL, endpointName, {
        TraceId: leg.traceId,
        ResultIndex: leg.resultIndex,
        Passengers: srdvPassengers,
      });

      if (data.Error?.ErrorCode && data.Error.ErrorCode !== '0') {
        throw new Error(`Leg ${leg.legIndex}: ${data.Error.ErrorMessage || 'Booking failed'}`);
      }

      bookedLegs.push({
        ...leg,
        pnr: data.Response?.PNR || data.PNR || null,
      });
    }

    // Sab legs book ho gayi -> ab ek transaction me local records save karo
    const totalPrice = legs.reduce((sum, l) => sum + Number(l.price), 0);
    const bookingRef = generateBookingRef();
    const transaction = await sequelize.transaction();
    try {
      const booking = await Booking.create({
        booking_ref: bookingRef,
        trip_type: tripType,
        contact_name: contact.name,
        contact_email: contact.email,
        contact_phone: contact.phone,
        total_price: totalPrice,
        status: "confirmed",
      }, { transaction });

      await BookingLeg.bulkCreate(bookedLegs.map((leg) => ({
        booking_id: booking.id,
        leg_index: leg.legIndex,
        trace_id: leg.traceId,
        result_index: leg.resultIndex,
        pnr: leg.pnr,
        airline_name: leg.airline_name,
        flight_number: leg.flight_number,
        origin_code: leg.origin_code,
        destination_code: leg.destination_code,
        price: leg.price,
      })), { transaction });

      await BookingPassenger.bulkCreate(passengers.map((p) => ({
        booking_id: booking.id,
        passenger_type: p.type,
        title: p.title,
        first_name: p.firstName,
        last_name: p.lastName,
        gender: p.gender,
        dob: p.dob || null,
        contact_number: p.contactNumber || null,
        email: p.email || null,
        passport_number: p.passportNumber || null,
        passport_issue_date: p.passportIssueDate || null,
        passport_expiry: p.passportExpiry || null,
      })), { transaction });
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
    return NextResponse.json({ success: true, bookingRef, totalPrice, legs: bookedLegs });
  } catch (err) {
    console.error('book error:', err.message);
    return NextResponse.json({ success: false, message: err.message || 'Booking fail ho gayi, dobara try karo.' }, { status: 500 });
  }
}
