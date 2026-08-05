import { callSrdvApi } from '../../../lib/srdvApi';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' });

  const { traceId, resultIndex, hotelCode, srdvType, srdvIndex } = req.body;

  console.log('HotelInfo REQUEST params:', { traceId, resultIndex, hotelCode, srdvType, srdvIndex });

  try {
    const payload = {
      TraceId: traceId,
      SrdvType: srdvType,
      SrdvIndex: srdvIndex,
      ResultIndex: resultIndex,
      HotelCode: hotelCode,
    };

    const data = await callSrdvApi(process.env.HOTEL_API_URL, 'GetHotelInfo', payload);

    console.log('HotelInfo RAW RESPONSE:', JSON.stringify(data, null, 2));

    const result = data.HotelInfoResult;

    if (result?.Error && result.Error.ErrorCode !== 0) {
      return res.status(200).json({ success: false, message: result.Error.ErrorMessage });
    }

    return res.status(200).json({
      success: true,
      hotelDetails: result?.HotelDetails || null,
    });
  } catch (error) {
    console.error('HotelInfo ERROR:', error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
}