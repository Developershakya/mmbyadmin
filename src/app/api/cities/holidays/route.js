import { getConnection } from '@/lib/db';
import { handleApiError } from "@/lib/apiError";
async function handler(req, res) {
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
    return handleApiError(res, error, "Something went wrong");
  } finally {
    if (connection) await connection.end();
  }
}

export async function GET(req, res) { return handler(req, res); }
export async function POST(req, res) { return handler(req, res); }
