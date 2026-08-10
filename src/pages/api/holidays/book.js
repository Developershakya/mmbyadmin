import { getConnection } from '../../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ success: false, message: 'Method not allowed' });

  const {
    name, email, phone, altPhone, address, city, pincode,
    travelDate, packageName, offerPrice, razorpayPaymentId,
  } = req.body;

  if (!name || !email || !phone || !address || !city || !pincode || !travelDate || !packageName || !offerPrice) {
    return res.status(400).json({ success: false, message: 'Missing required booking details' });
  }

  let connection;
  try {
    connection = await getConnection();

    const [result] = await connection.execute(
      `INSERT INTO package_book
       (name, email, phone, alt_phone, address, city, pincode, travel_date, package_name, offer_price, razorpay_payment_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name,
        email,
        phone,
        altPhone || null,
        address,
        city,
        pincode,
        travelDate,
        packageName,
        offerPrice,
        razorpayPaymentId || null,
      ]
    );

    return res.status(200).json({ success: true, bookingId: result.insertId });
  } catch (error) {
    console.error('holidays/book error:', error);
    return res.status(500).json({ success: false, message: error.message });
  } finally {
    if (connection) await connection.end();
  }
}