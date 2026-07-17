import { getConnection } from '../../../lib/db.js';

export default async function handler(req, res) {
  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  let connection;

  try {
    const params = req.method === 'POST' ? req.body : req.query;

    const {
      destination,
      limit = 20,
      offset = 0
    } = params;

    // "Goa, India" jaisa string aata hai, ", India" hata ke sirf city name le rahe hain
    const cleanDestination = destination ? destination.split(',')[0].trim() : '';

    connection = await getConnection();

    let sql = `SELECT * FROM package WHERE status = 1`;
    const values = [];

    if (cleanDestination) {
      sql += ` AND (package_name LIKE ? OR location LIKE ?)`;
      values.push(`%${cleanDestination}%`, `%${cleanDestination}%`);
    }

    sql += ` ORDER BY id DESC LIMIT ? OFFSET ?`;
    values.push(parseInt(limit), parseInt(offset));

    const [rows] = await connection.execute(sql, values);

    let countSql = `SELECT COUNT(*) as total FROM package WHERE status = 1`;
    const countValues = [];
    if (cleanDestination) {
      countSql += ` AND (package_name LIKE ? OR location LIKE ?)`;
      countValues.push(`%${cleanDestination}%`, `%${cleanDestination}%`);
    }
    const [countRows] = await connection.execute(countSql, countValues);
    const totalCount = countRows[0].total;

    return res.status(200).json({
      success: rows.length > 0,
      message: rows.length > 0 ? undefined : 'Is search criteria ke hisaab se koi package nahi mila.',
      results: rows,
      totalCount,
      pageInfo: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        totalPages: Math.ceil(totalCount / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Holiday search error:', error.message);
    return res.status(500).json({
      success: false,
      message: error.message || 'Holiday search mein error aa gaya.'
    });
  } finally {
    if (connection) await connection.end();
  }
}