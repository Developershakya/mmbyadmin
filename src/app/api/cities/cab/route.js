import { getConnection } from '@/lib/db';
import { handleApiError } from "@/lib/apiError";
async function handler(req, res) {
  const { query } = req.query;
  try {
    const connection = await getConnection();
    const [rows] = await connection.execute(
      `SELECT 
         caoncitlst_mti_code AS cityid, 
         caoncitlst_city_name AS Destination, 
         caoncitlst_state AS country
       FROM car_on_city_list 
       WHERE caoncitlst_city_name LIKE ? AND caoncitlst_status = 'Active' LIMIT 10`,
      [`%${query}%`]
    );
    await connection.end();
    res.status(200).json(rows);
  } catch (error) {
    return handleApiError(res, error, "Something went wrong");
  }
}

export async function GET(req, res) { return handler(req, res); }
export async function POST(req, res) { return handler(req, res); }
