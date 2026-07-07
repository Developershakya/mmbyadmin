import { getConnection } from '../../../lib/db';

export default async function handler(req, res) {
  const { query } = req.query;
  try {
    const connection = await getConnection();
    const [rows] = await connection.execute(
      `SELECT caoncitlst_city_name, caoncitlst_mti_code FROM car_on_city_list 
       WHERE caoncitlst_city_name LIKE ? AND caoncitlst_status = 'Active' LIMIT 10`,
      [`%${query}%`]
    );
    await connection.end();
    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}