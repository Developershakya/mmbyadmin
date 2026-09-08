import { callSrdvApi } from '@/lib/srdvApi';
import { NextResponse } from "next/server";
export async function POST(request) {

  const {
    traceId, srdvType, srdvIndex, resultIndex, hotelCode, hotelName,
    guestNationality, noOfRooms, room,
  } = await request.json();

  if (!room) {
    return NextResponse.json({ success: false, message: 'Room details missing.' }, { status: 400 });
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
      return NextResponse.json({ success: false, message: result.Error.ErrorMessage });
    }

    return NextResponse.json({
      success: true,
      blockDetails: result,
    });
  } catch (error) {
    console.error('BlockRoom ERROR:', error.message);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

