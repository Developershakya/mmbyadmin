import { NextResponse } from 'next/server';

export async function POST(request) {
  const body = await request.json();

  const busUrl = `${(process.env.SRDV_BUS_BASE_URL || process.env.SRDV_BUS_URL || 'https://bus.srdvapi.com/v8/rest').replace(/\/+$/, '')}/GetBoardingPointDetails`;
  const payload = {
    ClientId: process.env.SRDV_CLIENT_ID || body.clientId || '',
    UserName: process.env.SRDV_USERNAME || body.userName || '',
    Password: process.env.SRDV_PASSWORD || body.password || '',
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
  return NextResponse.json(data);
}
