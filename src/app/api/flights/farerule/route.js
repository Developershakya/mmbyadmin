import { callSrdvApi } from '@/lib/srdvApi';
import { NextResponse } from "next/server";
// Response ke andar kahin bhi (kisi bhi key ke neeche) HTML table wala string dhoondta hai
function findFareRuleHtml(obj) {
  if (!obj) return null;

  if (typeof obj === 'string') {
    return obj.toLowerCase().includes('<table') ? obj : null;
  }

  if (Array.isArray(obj)) {
    for (const item of obj) {
      const found = findFareRuleHtml(item);
      if (found) return found;
    }
    return null;
  }

  if (typeof obj === 'object') {
    for (const key of Object.keys(obj)) {
      const found = findFareRuleHtml(obj[key]);
      if (found) return found;
    }
  }

  return null;
}

export async function POST(request) {
  const { traceId, resultIndex, srdvType, srdvIndex } = await request.json();

  if (!traceId || !resultIndex) {
    return NextResponse.json({ success: false, message: 'traceId and resultIndex are required.' }, { status: 400 });
  }

  try {
    const data = await callSrdvApi(process.env.FLIGHT_API_URL, 'FareRule', {
      TraceId: traceId,
      ResultIndex: resultIndex,
      SrdvType: srdvType,
      SrdvIndex: srdvIndex,
    });

    console.log('FareRule RAW:', JSON.stringify(data, null, 2));

    const fareRuleText = findFareRuleHtml(data);

    if (!fareRuleText) {
      return NextResponse.json({ success: false, message: 'Fare rules are not available for the selected flight.' });
    }

    return NextResponse.json({ success: true, fareRuleText });
  } catch (error) {
    console.error('FareRule error:', error.message);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

