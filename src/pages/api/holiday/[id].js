import Holiday from '../../../models/Holiday.js';

/**
 * Get a single holiday package by ID
 */
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ success: false, message: 'Holiday ID required' });
    }

    const holiday = await Holiday.findByPk(id);``

    if (!holiday) {
      return res.status(404).json({ success: false, message: 'Holiday package nahi mila' });
    }

    return res.status(200).json({
      success: true,
      result: holiday
    });

  } catch (error) {
    console.error('Holiday fetch error:', error.message);
    return res.status(500).json({
      success: false,
      message: error.message || 'Holiday fetch mein error aa gaya.'
    });
  }
}
