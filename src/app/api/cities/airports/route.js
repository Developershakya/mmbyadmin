import { getConnection } from '@/lib/db';
import { handleApiError } from "@/lib/apiError";
import { withAppRoute } from '@/lib/routeCompat';

async function handler(req) {
  const { query: searchQuery, code } = req.query || {};
  try {
    const connection = await getConnection();

    if (code) {
      const [rows] = await connection.execute(
        `SELECT DISTINCT airport_city_name, airport_name, airport_code FROM airport_list 
         WHERE airport_code = ? LIMIT 1`,
        [String(code).toUpperCase()]
      );
      await connection.end();
      return Response.json(rows);
    }

    const [rows] = await connection.execute(
      `SELECT DISTINCT airport_city_name, airport_name, airport_code FROM airport_list 
       WHERE airport_city_name LIKE ? OR airport_name LIKE ? OR airport_code LIKE ? LIMIT 10`,
      [`%${searchQuery || ''}%`, `%${searchQuery || ''}%`, `%${searchQuery || ''}%`]
    );
    await connection.end();
    return Response.json(rows);
  } catch (error) {
    return handleApiError(undefined, error, "Something went wrong");
  }
}

export const GET = withAppRoute(handler);
export const POST = withAppRoute(handler);
