import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    const srdvType = String(body.srdvType || '').trim();
    const srdvIndex = String(body.srdvIndex || '').trim();
    const traceId = String(body.traceId || '').trim();
    const resultIndex = String(body.resultIndex || '').trim();
    console.log('SRDV seat-map request:', body, srdvType, srdvIndex, traceId, resultIndex);
    if (!srdvType) return NextResponse.json({ error: 'Missing required field: srdvType' }, { status: 400 });
    if (!srdvIndex) return NextResponse.json({ error: 'Missing required field: srdvIndex' }, { status: 400 });
    if (!traceId) return NextResponse.json({ error: 'Missing required field: traceId' }, { status: 400 });
    if (!resultIndex) return NextResponse.json({ error: 'Missing required field: resultIndex' }, { status: 400 });

    const flightUrl = `${(process.env.SRDV_FLIGHT_BASE_URL || process.env.SRDV_FLIGHT_URL || 'https://flight.srdvapi.com/v8/rest').replace(/\/+$/, '')}/SeatMap`;
    const payload = {
      EndUserIp: process.env.SRDV_END_USER_IP || body.endUserIp || '1.1.1.1',
      ClientId: process.env.SRDV_CLIENT_ID || body.clientId || '',
      UserName: process.env.SRDV_USERNAME || body.userName || '',
      Password: process.env.SRDV_PASSWORD || body.password || '',
      SrdvType: srdvType,
      SrdvIndex: srdvIndex,
      TraceId: traceId,
      ResultIndex: resultIndex,
    };
 
    const response = await fetch(flightUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...(process.env.SRDV_API_TOKEN ? { 'Api-Token': process.env.SRDV_API_TOKEN } : {}),
      },
      body: JSON.stringify(payload),
    });

    const rawText = await response.text();
    console.log('SRDV seat-map response:', rawText);
    let data = {};

    if (rawText) {
      try {
        data = JSON.parse(rawText);
      } catch {
        data = {
          error: 'SRDV returned a non-JSON response',
          message: 'The SRDV seat-map endpoint responded with HTML or an unexpected payload instead of JSON.',
          raw: rawText.slice(0, 1500),
          status: response.status,
        };
      }
    }

    if (!response.ok) {
      return NextResponse.json(
        { error: data.error || 'SRDV seat-map request failed', message: data.message || data?.Error?.ErrorMessage || 'SRDV seat-map request failed', raw: data.raw || rawText.slice(0, 1500), status: response.status },
        { status: response.status || 502 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('SRDV seat-map proxy error:', error);
    return NextResponse.json({ error: 'SRDV seat-map request failed', message: error.message }, { status: error.status || 500 });
  }
}
