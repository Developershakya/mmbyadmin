import { NextResponse } from 'next/server';

export async function POST(request) {
  const body = await request.json();
  const from = String(body.from || '').trim();
  const to = String(body.to || '').trim();
  const date = String(body.date || '').trim();

  if (!from) return NextResponse.json({ error: 'Missing required field: from' }, { status: 400 });
  if (!to) return NextResponse.json({ error: 'Missing required field: to' }, { status: 400 });
  if (!date) return NextResponse.json({ error: 'Missing required field: date' }, { status: 400 });
  if (!/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2})?$/.test(date)) {
    return NextResponse.json({ error: 'Invalid date format: date. Use yyyy-MM-dd or yyyy-MM-ddTHH:mm:ss.' }, { status: 400 });
  }

  const busUrl = `${(process.env.SRDV_BUS_BASE_URL || process.env.SRDV_BUS_URL || 'https://bus.srdvapi.com/v8/rest').replace(/\/+$/, '')}/Search`;
  const payload = {
    ClientId: process.env.SRDV_CLIENT_ID || body.clientId || '',
    UserName: process.env.SRDV_USERNAME || body.userName || '',
    Password: process.env.SRDV_PASSWORD || body.password || '',
    source_city: String(body.source_city || from),
    source_code: String(body.source_code || body.sourceCode || ''),
    destination_city: String(body.destination_city || to),
    destination_code: String(body.destination_code || body.destinationCode || ''),
    depart_date: date.includes('T') ? date.slice(0, 10) : date,
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
