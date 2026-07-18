import { getConnection } from '../../../lib/db';

export default async function handler(req, res) {
  const { query, code } = req.query;
  try {
    const connection = await getConnection();

    // Exact lookup by code — flights page header ke liye (From/To dobara dikhane ke liye)
    if (code) {
      const [rows] = await connection.execute(
        `SELECT DISTINCT airport_city_name, airport_name, airport_code FROM airport_list 
         WHERE airport_code = ? LIMIT 1`,
        [code.toUpperCase()]
      );
      await connection.end();
      return res.status(200).json(rows);
    }

    // Purana search-as-you-type behaviour, jaisa tha waisa hi
    const [rows] = await connection.execute(
      `SELECT DISTINCT airport_city_name, airport_name, airport_code FROM airport_list 
       WHERE airport_city_name LIKE ? OR airport_name LIKE ? OR airport_code LIKE ? LIMIT 10`,
      [`%${query}%`, `%${query}%`, `%${query}%`]
    );
    await connection.end();
    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}