import { handleApiError } from "@/lib/apiError";
import { getConnection } from '@/lib/db';
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

async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { tripType, legs, passengers, contact } = req.body;
  // legs: [{ legIndex, traceId, resultIndex, price, airline_name, flight_number, origin_code, destination_code }]

  if (!Array.isArray(legs) || legs.length === 0 || !Array.isArray(passengers) || passengers.length === 0) {
    return res.status(400).json({ success: false, message: 'Legs aur passengers required hain.' });
  }
const srdvPassengers = toSrdvPassengers(passengers, contact);
  const bookedLegs = [];

  const connection = await getConnection();   // â­ NEW

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

    // Sab legs book ho gayi -> ab MySQL me record save karo
    const totalPrice = legs.reduce((sum, l) => sum + Number(l.price), 0);
    const bookingRef = generateBookingRef();

const [bookingResult] = await connection.query(
  `INSERT INTO bookings (booking_ref, trip_type, contact_name, contact_email, contact_phone, total_price, status)
   VALUES (?, ?, ?, ?, ?, ?, 'confirmed')`,
  [bookingRef, tripType, contact.name, contact.email, contact.phone, totalPrice]
);
    const bookingId = bookingResult.insertId;

for (const leg of bookedLegs) {
  await connection.query(
    `INSERT INTO booking_legs (booking_id, leg_index, trace_id, result_index, pnr, airline_name, flight_number, origin_code, destination_code, price)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [bookingId, leg.legIndex, leg.traceId, leg.resultIndex, leg.pnr, leg.airline_name, leg.flight_number, leg.origin_code, leg.destination_code, leg.price]
  );
}

for (const p of passengers) {
  await connection.query(
    `INSERT INTO booking_passengers 
      (booking_id, passenger_type, title, first_name, last_name, gender, dob, contact_number, email, passport_number, passport_issue_date, passport_expiry)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      bookingId, p.type, p.title, p.firstName, p.lastName, p.gender, p.dob || null,
      p.contactNumber || null, p.email || null,
      p.passportNumber || null, p.passportIssueDate || null, p.passportExpiry || null,
    ]
  );
}

await connection.end();   // â­ NEW
    return res.status(200).json({ success: true, bookingRef, totalPrice, legs: bookedLegs });
  } catch (err) {
    console.error('book error:', err.message);
    await connection.end().catch(() => {});   // â­ NEW â€” safe close even on error
    return res.status(500).json({ success: false, message: err.message || 'Booking fail ho gayi, dobara try karo.' });
  }
}

export async function GET(req, res) { return handler(req, res); }
export async function POST(req, res) { return handler(req, res); }
