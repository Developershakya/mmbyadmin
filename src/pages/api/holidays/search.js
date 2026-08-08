import { getConnection } from '../../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ success: false, message: 'Method not allowed' });

  const { destination, limit } = req.body;

  if (!destination) {
    return res.status(400).json({ success: false, message: 'Destination is required' });
  }

  const safeLimit = Math.min(Number(limit) || 50, 100);

  let connection;
  try {
    connection = await getConnection();
    const [rows] = await connection.execute(
      `SELECT id, package_name, slug, duration, ragular_price, offer_price, photo,
              short_description, location
       FROM package
       WHERE status = 1 AND location LIKE ?
       ORDER BY id DESC
       LIMIT ${safeLimit}`,
      [`%${destination}%`]
    );

    return res.status(200).json({
      success: true,
      results: rows.map((r) => ({
        ...r,
        city_name: r.location,
      })),
    });
  } catch (error) {
    console.error('holidays/search error:', error);
    return res.status(500).json({ success: false, message: error.message });
  } finally {
    if (connection) await connection.end();
  }
}