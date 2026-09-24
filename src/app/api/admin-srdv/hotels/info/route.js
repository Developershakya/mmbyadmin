import { NextResponse } from 'next/server';

export async function POST(request) {
  const body = await request.json();
  const hotelCode = String(body.hotelCode || '').trim();

  if (!hotelCode) return NextResponse.json({ error: 'Missing required field: hotelCode' }, { status: 400 });

  const hotelUrl = `${(process.env.SRDV_HOTEL_BASE_URL || process.env.SRDV_HOTEL_URL || 'https://hotel.srdvapi.com/v5/rest').replace(/\/+$/, '')}/GetHotelInfo`;
  const payload = {
    EndUserIp: process.env.SRDV_END_USER_IP || body.endUserIp || '1.1.1.1',
    ClientId: process.env.SRDV_CLIENT_ID || body.clientId || '',
    UserName: process.env.SRDV_USERNAME || body.userName || '',
    Password: process.env.SRDV_PASSWORD || body.password || '',
    HotelCode: hotelCode,
    TraceId: body.traceId ? String(body.traceId) : '',
    ResultIndex: body.resultIndex ? String(body.resultIndex) : '',
  };

  const response = await fetch(hotelUrl, {
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
