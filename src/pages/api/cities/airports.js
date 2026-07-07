import { getConnection } from '../../../lib/db';

export default async function handler(req, res) {
  const { query } = req.query;
  try {
    const connection = await getConnection();
    const [rows] = await connection.execute(
      `SELECT airport_city_name, airport_name, airport_code FROM airport_list 
       WHERE airport_city_name LIKE ? OR airport_name LIKE ? OR airport_code LIKE ? LIMIT 10`,
      [`%${query}%`, `%${query}%`, `%${query}%`]
    );
    await connection.end();
    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}