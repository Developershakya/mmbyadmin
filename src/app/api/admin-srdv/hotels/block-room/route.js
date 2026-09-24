import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const hotelCode = String(body.hotelCode || '').trim();
    const roomCode = String(body.roomCode || '').trim();

    if (!hotelCode) return NextResponse.json({ error: 'Missing required field: hotelCode' }, { status: 400 });
    if (!roomCode) return NextResponse.json({ error: 'Missing required field: roomCode' }, { status: 400 });

    const hotelUrl = `${(process.env.SRDV_HOTEL_BASE_URL || process.env.SRDV_HOTEL_URL || 'https://hotel.srdvapi.com/v5/rest').replace(/\/+$/, '')}/BlockRoom`;
    const payload = {
      HotelCode: hotelCode,
      RoomCode: roomCode,
      NoOfRooms: Number(body.NoOfRooms ?? 1) || 1,
      NoOfNights: Number(body.noOfNights ?? body.nights ?? 1) || 1,
      RoomGuest: Array.isArray(body.RoomGuests) && body.RoomGuests.length ? body.RoomGuests : [{ NoOfAdults: 2, NoOfChild: 0, ChildAge: [] }],
    };

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);

    try {
      const response = await fetch(hotelUrl, {
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
