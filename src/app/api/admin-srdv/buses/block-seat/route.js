import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const busId = String(body.busId || '').trim();
    const seatNumber = String(body.seatNumber || '').trim();

    if (!busId) return NextResponse.json({ error: 'Missing required field: busId' }, { status: 400 });
    if (!seatNumber) return NextResponse.json({ error: 'Missing required field: seatNumber' }, { status: 400 });

    const busUrl = `${(process.env.SRDV_BUS_BASE_URL || process.env.SRDV_BUS_URL || 'https://bus.srdvapi.com/v5/rest').replace(/\/+$/, '')}/BlockSeat`;
    const payload = {
      BusId: busId,
      SeatNumber: seatNumber,
      TraceId: body.traceId ? String(body.traceId) : '',
      ResultIndex: body.resultIndex ? String(body.resultIndex) : '',
    };

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);

    try {
      const response = await fetch(busUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          ...(process.env.SRDV_API_TOKEN ? { 'Api-Token': process.env.SRDV_API_TOKEN } : {}),
          ...(process.env.SRDV_CLIENT_ID ? { ClientId: process.env.SRDV_CLIENT_ID } : {}),
          ...(process.env.SRDV_USERNAME ? { UserName: process.env.SRDV_USERNAME } : {}),
          ...(process.env.SRDV_PASSWORD ? { Password: process.env.SRDV_PASSWORD } : {}),
          ...(process.env.SRDV_END_USER_IP ? { EndUserIp: process.env.SRDV_END_USER_IP } : {}),
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      const data = await response.json();
      return Response.json(data);
    } finally {
      clearTimeout(timeout);
    }
  } catch (error) {
    return NextResponse.json({ error: 'SRDV request failed', message: error.message }, { status: error.status || 500 });
  }
}
