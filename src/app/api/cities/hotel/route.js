import { getConnection } from '@/lib/db';
import { handleApiError } from "@/lib/apiError";
async function handler(req, res) {
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
    return handleApiError(res, error, "Something went wrong");
  }
}

export async function GET(req, res) { return handler(req, res); }
export async function POST(req, res) { return handler(req, res); }
