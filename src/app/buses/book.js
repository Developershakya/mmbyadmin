import { callSrdvApi } from '../../lib/srdvApi';
import sequelize from '../../../config/sequelize.js';
import BusBooking from '../../../models/BusBooking.js';
import BusBookingPassenger from '../../../models/BusBookingPassenger.js';

function generateBookingRef() {
  const rand = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `MMBYB${Date.now().toString().slice(-6)}${rand}`;
}

// ⚠️ ADJUST: SRDV Bus Book API docs ke hisaab se field names/format check karke badalna
function toSrdvPassengers(passengers, contact) {
  return passengers.map((p, i) => ({
    Title: p.gender === 'male' ? 'Mr' : 'Ms',
    FirstName: p.firstName,
    LastName: p.lastName,
    Age: Number(p.age),
    Gender: p.gender === 'male' ? 1 : 2,
    Seat: { SeatIndex: p.seatIndex, SeatName: p.seatName },
    ContactNo: contact.phone,
    Email: contact.email,
    IsLeadPax: i === 0,
  }));
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { bus, passengers, contact, boardingPoint, droppingPoint, totalPrice } = req.body;

  if (!bus || !bus.traceId || !bus.resultIndex || !Array.isArray(passengers) || passengers.length === 0) {
    return res.status(400).json({ success: false, message: 'Bus aur passengers required hain.' });
  }

  const srdvPassengers = toSrdvPassengers(passengers, contact);
  try {
    // ⚠️ ADJUST: 'BlockTicket' — agar SRDV plan mein single-step booking hai to ye step hata ke
    // neeche wale call ka method 'Book'/'BookTicket' kar dena.
    const blockData = await callSrdvApi(process.env.BUS_API_URL, 'BlockTicket', {
      TraceId: bus.traceId,
      ResultIndex: bus.resultIndex,
      Passengers: srdvPassengers,
      BoardingPointId: boardingPoint?.CityPointIndex,
      DroppingPointId: droppingPoint?.CityPointIndex,
    });

    if (blockData?.Error?.ErrorCode && Number(blockData.Error.ErrorCode) !== 0) {
      throw new Error(blockData.Error.ErrorMessage || 'Seat block fail ho gaya.');
    }

    const bookData = await callSrdvApi(process.env.BUS_API_URL, 'SaveTicket', {
      TraceId: bus.traceId,
      ResultIndex: bus.resultIndex,
    });

    if (bookData?.Error?.ErrorCode && Number(bookData.Error.ErrorCode) !== 0) {
      throw new Error(bookData.Error.ErrorMessage || 'Booking confirm nahi ho payi.');
    }

    const pnr = bookData?.Response?.PNR || bookData?.PNR || blockData?.Response?.PNR || null;
    const bookingRef = generateBookingRef();

    const transaction = await sequelize.transaction();
    try {
      const booking = await BusBooking.create({
        booking_ref: bookingRef,
        operator_name: bus.operator_name,
        bus_type: bus.bus_type,
        pnr,
        trace_id: bus.traceId,
        result_index: bus.resultIndex,
        boarding_point: boardingPoint?.CityPointLocation || boardingPoint?.CityPointName || '',
        dropping_point: droppingPoint?.CityPointLocation || droppingPoint?.CityPointName || '',
        contact_name: contact.name,
        contact_email: contact.email,
        contact_phone: contact.phone,
        total_price: totalPrice,
        status: 'confirmed',
      }, { transaction });

      await BusBookingPassenger.bulkCreate(passengers.map((p) => ({
        booking_id: booking.id,
        first_name: p.firstName,
        last_name: p.lastName,
        gender: p.gender,
        age: p.age,
        seat_name: p.seatName,
      })), { transaction });
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
    return res.status(200).json({ success: true, bookingRef, pnr, totalPrice });
  } catch (err) {
    console.error('bus book error:', err.message);
    return res.status(500).json({ success: false, message: err.message || 'Booking fail ho gayi, dobara try karo.' });
  }
}