import { getConnection } from '../../../lib/db';

export default async function handler(req, res) {
  const { query } = req.query;
  try {
    const connection = await getConnection();
    const [rows] = await connection.execute(
      `SELECT DISTINCT location AS Destination, location AS cityid, 'India' AS country
       FROM package
       WHERE status = 1 AND location LIKE ?
       LIMIT 10`,
      [`%${query}%`]
    );
    await connection.end();
    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}