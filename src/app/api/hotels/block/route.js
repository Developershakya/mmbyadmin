import { callSrdvApi } from '@/lib/srdvApi';
import { handleApiError } from "@/lib/apiError";
async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' });

  const {
    traceId, srdvType, srdvIndex, resultIndex, hotelCode, hotelName,
    guestNationality, noOfRooms, room,
  } = req.body;

  if (!room) {
    return res.status(400).json({ success: false, message: 'Room details missing.' });
  }

  console.log('BlockRoom REQUEST params:', { traceId, resultIndex, hotelCode, srdvType, srdvIndex });

  try {
    const payload = {
      TraceId: traceId,
      SrdvType: srdvType,
      SrdvIndex: srdvIndex,
      ResultIndex: resultIndex,
      HotelCode: hotelCode,
      HotelName: hotelName,
      GuestNationality: guestNationality || 'IN',
      NoOfRooms: String(noOfRooms || 1),
      ClientReferenceNo: 0,
      IsVoucherBooking: true,
      HotelRoomsDetails: [room],
    };

    const data = await callSrdvApi(process.env.HOTEL_API_URL, 'BlockRoom', payload);

    console.log('BlockRoom RAW RESPONSE:', JSON.stringify(data, null, 2));

    const result = data.BlockRoomResult;

    if (result?.Error && result.Error.ErrorCode !== 0) {
      return res.status(200).json({ success: false, message: result.Error.ErrorMessage });
    }

    return res.status(200).json({
      success: true,
      blockDetails: result,
    });
  } catch (error) {
    console.error('BlockRoom ERROR:', error.message);
    return handleApiError(res, error, "Something went wrong");
  }
}

export async function GET(req, res) { return handler(req, res); }
export async function POST(req, res) { return handler(req, res); }
