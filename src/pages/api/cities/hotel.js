import { getConnection } from '../../../lib/db';

export default async function handler(req, res) {
  const { query } = req.query;
  try {
    const connection = await getConnection();
    const [rows] = await connection.execute(
      `SELECT cityid, Destination, country FROM hotel_city_code_v8 
       WHERE Destination LIKE ? AND status = 'Active' LIMIT 10`,
      [`${query}%`]
    );
    await connection.end();
    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}