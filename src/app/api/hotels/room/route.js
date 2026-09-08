import { callSrdvApi } from '@/lib/srdvApi';
import { NextResponse } from "next/server";
export async function POST(request) {

  const { traceId, resultIndex, hotelCode, srdvType, srdvIndex } = await request.json();

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
      return NextResponse.json({ success: false, message: result.Error.ErrorMessage });
    }

    return NextResponse.json({
      success: true,
      traceId: result?.TraceId || traceId,
      srdvType: result?.SrdvType || srdvType,
      srdvIndex: result?.SrdvIndex || srdvIndex,
      resultIndex: result?.ResultIndex || resultIndex,
      roomCategories: result?.HotelRoomsDetails || [],
    });
  } catch (error) {
    console.error('HotelRoom ERROR:', error.message);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

