import { getConnection } from '../../../lib/db';

export default async function handler(req, res) {
  const { query } = req.query;
  let connection;
  try {
    connection = await getConnection();
    const [rows] = await connection.execute(
      `SELECT DISTINCT c.id AS code, c.city_name AS name, 'India' AS country
       FROM package p
       JOIN cities c ON p.city_id = c.id
       WHERE p.status = 1 AND c.city_name LIKE ?
       LIMIT 10`,
      [`%${query}%`]
    );
    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    if (connection) await connection.end();
  }
}