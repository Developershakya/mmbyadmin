import { getConnection } from '../../../lib/db';

export default async function handler(req, res) {
  const { slug } = req.query;

  if (!slug) {
    return res.status(400).json({ success: false, message: 'Slug is required' });
  }

  let connection;
  try {
    connection = await getConnection();

    const [packageRows] = await connection.execute(
      `SELECT * FROM package WHERE slug = ? AND status = 1 LIMIT 1`,
      [slug]
    );

    if (packageRows.length === 0) {
      return res.status(200).json({ success: false, message: 'Package not found' });
    }

    const pkg = packageRows[0];

    const [photoRows] = await connection.execute(
      `SELECT photo FROM package_photos WHERE package_id = ?`,
      [pkg.id]
    );

    const [itineraryRows] = await connection.execute(
      `SELECT day_number, title, description, image FROM itineraries WHERE package_id = ? ORDER BY day_number ASC`,
      [pkg.id]
    );

    return res.status(200).json({
      success: true,
      package: pkg,
      photos: photoRows.map((p) => p.photo),
      itinerary: itineraryRows,
    });
  } catch (error) {
    console.error('holidays/[slug] error:', error);
    return res.status(500).json({ success: false, message: error.message });
  } finally {
    if (connection) await connection.end();
  }
}