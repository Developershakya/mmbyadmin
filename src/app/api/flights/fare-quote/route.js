import { callSrdvApi } from '@/lib/srdvApi';
import { NextResponse } from "next/server";

export async function POST(request) {
  const { legs } = await request.json(); // [{ traceId, resultIndex, srdvType, srdvIndex, legIndex }]

  if (!Array.isArray(legs) || legs.length === 0) {
    return NextResponse.json({ success: false, message: 'Legs required hain.' }, { status: 400 });
  }

  try {
    const results = await Promise.all(
      legs.map(async (leg) => {
        if (!leg.traceId || !leg.resultIndex) {
          throw new Error(`Missing traceId/resultIndex for leg ${leg.legIndex}: traceId=${leg.traceId}, resultIndex=${leg.resultIndex}`);
        }

        const data = await callSrdvApi(process.env.FLIGHT_API_URL, 'FareQuote', {
          TraceId: leg.traceId,
          SrdvType: leg.srdvType,
          SrdvIndex: leg.srdvIndex,
          ResultIndex: leg.resultIndex,
        });

        console.log(`FareQuote RAW response for leg ${leg.legIndex}:`, JSON.stringify(data, null, 2));

        if (data.Error?.ErrorCode && data.Error.ErrorCode !== '0') {
          throw new Error(`SRDV Error [${data.Error.ErrorCode}]: ${data.Error.ErrorMessage}`);
        }

        const quote = data.Results || data.Response;

        return {
          legIndex: leg.legIndex,
          quote,
          traceId: data.TraceId ?? leg.traceId,
          srdvType: data.SrdvType ?? leg.srdvType,
          srdvIndex: quote?.SrdvIndex ?? leg.srdvIndex,
          resultIndex: quote?.ResultIndex ?? leg.resultIndex,
          price: quote?.Fare?.OfferedFare ?? quote?.OfferedFare,
          isPriceChanged: data.IsPriceChanged || false,
        };
      })
    );

    return NextResponse.json({ success: true, legs: results });
  } catch (err) {
    console.error('fare-quote error (actual):', err.message);
    return NextResponse.json({ success: false, message: err.message }, { status: 409 });
  }
}
