import { callSrdvApi } from '@/lib/srdvApi';
import { handleApiError } from '@/lib/apiError';
import { withAppRoute } from '@/lib/routeCompat';

async function handler(req) {
  if (req.method !== 'POST') {
    return Response.json({ success: false, message: 'Method not allowed' }, { status: 405 });
  }

  const { traceId, resultIndex, srdvType, srdvIndex } = req.body || {};

  try {
    const data = await callSrdvApi(process.env.FLIGHT_API_URL, 'SeatMap', {
      TraceId: traceId,
      SrdvType: srdvType,
      SrdvIndex: srdvIndex,
      ResultIndex: resultIndex,
    });

    console.log('SEATMAP RAW response:', JSON.stringify(data, null, 2));

    if (data.Error?.ErrorCode && data.Error.ErrorCode !== '0') {
      return Response.json({ success: false, message: data.Error.ErrorMessage }, { status: 409 });
    }

    return Response.json({ success: true, data });
  } catch (err) {
    console.error('seatmap error:', err.message);
    return handleApiError(null, err, 'Something went wrong');
  }
}

export const GET = withAppRoute(handler);
export const POST = withAppRoute(handler);
