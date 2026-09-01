import { callSrdvApi } from '../../lib/srdvApi';
import { getConnection } from '../../lib/db';

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
  const connection = await getConnection();

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

    const [bookingResult] = await connection.query(
      `INSERT INTO bus_bookings
        (booking_ref, operator_name, bus_type, pnr, trace_id, result_index, boarding_point, dropping_point, contact_name, contact_email, contact_phone, total_price, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'confirmed')`,
      [
        bookingRef,
        bus.operator_name,
        bus.bus_type,
        pnr,
        bus.traceId,
        bus.resultIndex,
        boardingPoint?.CityPointLocation || boardingPoint?.CityPointName || '',
        droppingPoint?.CityPointLocation || droppingPoint?.CityPointName || '',
        contact.name,
        contact.email,
        contact.phone,
        totalPrice,
      ]
    );
    const bookingId = bookingResult.insertId;

    for (const p of passengers) {
      await connection.query(
        `INSERT INTO bus_booking_passengers (booking_id, first_name, last_name, gender, age, seat_name)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [bookingId, p.firstName, p.lastName, p.gender, p.age, p.seatName]
      );
    }

    await connection.end();
    return res.status(200).json({ success: true, bookingRef, pnr, totalPrice });
  } catch (err) {
    console.error('bus book error:', err.message);
    await connection.end().catch(() => {});
    return res.status(500).json({ success: false, message: err.message || 'Booking fail ho gayi, dobara try karo.' });
  }
}