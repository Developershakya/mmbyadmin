import { callSrdvApi } from '@/lib/srdvApi';
import { NextResponse } from "next/server";

export async function POST(request) {
  const { traceId, resultIndex, srdvType, srdvIndex } = await request.json();

  try {
    const data = await callSrdvApi(process.env.FLIGHT_API_URL, 'SeatMap', {
      TraceId: traceId,
      SrdvType: srdvType,
      SrdvIndex: srdvIndex,
      ResultIndex: resultIndex,
    });

    console.log('SEATMAP RAW response:', JSON.stringify(data, null, 2));

    if (data.Error?.ErrorCode && data.Error.ErrorCode !== '0') {
      return NextResponse.json({ success: false, message: data.Error.ErrorMessage }, { status: 409 });
    }

    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error('seatmap error:', err.message);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
