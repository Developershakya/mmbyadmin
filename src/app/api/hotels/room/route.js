import { callSrdvApi } from '@/lib/srdvApi';
import { handleApiError } from "@/lib/apiError";
async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' });

  const { traceId, resultIndex, hotelCode, srdvType, srdvIndex } = req.body;

  console.log('HotelRoom REQUEST params:', { traceId, resultIndex, hotelCode, srdvType, srdvIndex });

  try {
    const payload = {
      TraceId: traceId,
      SrdvType: srdvType,
      SrdvIndex: srdvIndex,
      ResultIndex: resultIndex,
      HotelCode: hotelCode,
    };

    const data = await callSrdvApi(process.env.HOTEL_API_URL, 'GetHotelRoom', payload);

    console.log('HotelRoom RAW RESPONSE:', JSON.stringify(data, null, 2));

    const result = data.GetHotelRoomResult;

    if (result?.Error && result.Error.ErrorCode !== 0) {
      return res.status(200).json({ success: false, message: result.Error.ErrorMessage });
    }

    return res.status(200).json({
      success: true,
      traceId: result?.TraceId || traceId,
      srdvType: result?.SrdvType || srdvType,
      srdvIndex: result?.SrdvIndex || srdvIndex,
      resultIndex: result?.ResultIndex || resultIndex,
      roomCategories: result?.HotelRoomsDetails || [],
    });
  } catch (error) {
    console.error('HotelRoom ERROR:', error.message);
    return handleApiError(res, error, "Something went wrong");
  }
}

export async function GET(req, res) { return handler(req, res); }
export async function POST(req, res) { return handler(req, res); }
