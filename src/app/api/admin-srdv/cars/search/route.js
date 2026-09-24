import { NextResponse } from 'next/server';

export async function POST(request) {
  const body = await request.json();
  const pickup = String(body.pickup || '').trim();
  const drop = String(body.drop || '').trim();
  const date = String(body.date || '').trim();
  const time = String(body.time || '').trim();

  if (!pickup) return NextResponse.json({ error: 'Missing required field: pickup' }, { status: 400 });
  if (!drop) return NextResponse.json({ error: 'Missing required field: drop' }, { status: 400 });
  if (!date) return NextResponse.json({ error: 'Missing required field: date' }, { status: 400 });
  if (!time) return NextResponse.json({ error: 'Missing required field: time' }, { status: 400 });
  if (!/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2})?$/.test(date)) {
    return NextResponse.json({ error: 'Invalid date format: date. Use yyyy-MM-dd or yyyy-MM-ddTHH:mm:ss.' }, { status: 400 });
  }

  const carUrl = `${(process.env.SRDV_CAR_BASE_URL || process.env.SRDV_CAR_URL || 'https://car.srdvapi.com/v8/rest').replace(/\/+$/, '')}/Search`;
  const payload = {
    EndUserIp: process.env.SRDV_END_USER_IP || body.endUserIp || '1.1.1.1',
    ClientId: process.env.SRDV_CLIENT_ID || body.clientId || '',
    UserName: process.env.SRDV_USERNAME || body.userName || '',
    Password: process.env.SRDV_PASSWORD || body.password || '',
    FormCity: String(body.FormCity || body.formCity || pickup),
    ToCity: String(body.ToCity || body.toCity || drop),
    PickUpDate: date.includes('T') ? date : `${date}T00:00:00`,
    DropDate: body.DropDate || '',
    Hours: body.Hours || body.hours || time,
    TripType: body.TripType || body.tripType || '0',
  };

  const response = await fetch(carUrl, {
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
