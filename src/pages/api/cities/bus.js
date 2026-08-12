import { getConnection } from '../../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();

  const { query } = req.query;
  let connection;

  try {
    connection = await getConnection();

    // Agar koi text nahi hai, to default popular cities dikhao
    if (!query || query.trim().length < 2) {
      const [rows] = await connection.query(
        `SELECT city_name AS cityid, city_name AS Destination, '' AS country
         FROM cities
         ORDER BY city_name ASC
         LIMIT 10`
      );
      return res.status(200).json(rows);
    }

    const searchTerm = `%${query.trim()}%`;
    const [rows] = await connection.query(
      `SELECT city_name AS cityid, city_name AS Destination, '' AS country
       FROM cities
       WHERE city_name LIKE ?
       LIMIT 10`,
      [searchTerm]
    );
    return res.status(200).json(rows);
  } catch (error) {
    console.error('Bus city search error:', error.message);
    return res.status(500).json({ error: 'Internal server error' });
  } finally {
    if (connection) await connection.end();
  }
}