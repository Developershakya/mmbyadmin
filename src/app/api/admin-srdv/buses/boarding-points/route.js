import { NextResponse } from 'next/server';

export async function POST(request) {
  const body = await request.json();
  const busId = String(body.busId || '').trim();

  if (!busId) return NextResponse.json({ error: 'Missing required field: busId' }, { status: 400 });

  const busUrl = `${(process.env.SRDV_BUS_BASE_URL || process.env.SRDV_BUS_URL || 'https://bus.srdvapi.com/v5/rest').replace(/\/+$/, '')}/GetBoardingPoints`;
  const payload = {
    ClientId: process.env.SRDV_CLIENT_ID || body.clientId || '',
    UserName: process.env.SRDV_USERNAME || body.userName || '',
    Password: process.env.SRDV_PASSWORD || body.password || '',
    BusId: busId,
    TraceId: body.traceId ? String(body.traceId) : '',
    ResultIndex: body.resultIndex ? String(body.resultIndex) : '',
  };

  const response = await fetch(busUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(process.env.SRDV_API_TOKEN ? { 'Api-Token': process.env.SRDV_API_TOKEN } : {}),
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  return Response.json(data);
}
