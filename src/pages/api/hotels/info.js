import { callSrdvApi } from '../../../lib/srdvApi';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' });

  const { traceId, resultIndex, hotelCode } = req.body;

  try {
    const payload = {
      TraceId: traceId,
      ResultIndex: resultIndex,
      HotelCode: hotelCode,
    };

    const data = await callSrdvApi(process.env.HOTEL_API_URL, 'GetHotelInfo', payload);

    if (data.Error && data.Error.ErrorCode !== 0) {
      return res.status(200).json({ success: false, message: data.Error.ErrorMessage });
    }

    return res.status(200).json({
      success: true,
      hotelDetails: data.HotelRoomsDetails || data.HotelDetails || data
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}