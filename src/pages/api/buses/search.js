import { getConnection } from '../../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { sourceCity, destinationCity } = req.body;

  if (!sourceCity || !destinationCity) {
    return res.status(400).json({
      success: false,
      message: 'sourceCity aur destinationCity zaroori hain',
    });
  }

  let connection;

  try {
    connection = await getConnection();

    const [rows] = await connection.query(
      `SELECT
         id, bus_number, route, origin, destination,
         departure_time, arrival_time, seating_capacity, price_per_seat
       FROM buses
       WHERE origin LIKE ?
         AND destination LIKE ?
       ORDER BY departure_time ASC`,
      [`%${sourceCity}%`, `%${destinationCity}%`]
    );

    const results = rows.map((b) => ({
      id: b.id,
      operator_name: b.bus_number,      // aapke table mein operator naam ka alag column nahi hai
      bus_type: b.route,                 // agar bus-type column baad me add karo to yahan badal dena
      origin: b.origin,
      destination: b.destination,
      departure_time: b.departure_time,
      arrival_time: b.arrival_time,
      seats_available: b.seating_capacity,
      price: b.price_per_seat,
    }));

    if (results.length > 0) {
      return res.status(200).json({ success: true, results });
    }

    return res.status(200).json({ success: false, message: 'Is route ke liye koi bus nahi mili.' });
  } catch (error) {
    console.error('Bus search error:', error.message);
    return res.status(500).json({ success: false, message: error.message });
  } finally {
    if (connection) await connection.end();
  }
}