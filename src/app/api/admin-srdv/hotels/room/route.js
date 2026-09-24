import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const hotelCode = String(body.hotelCode || '').trim();
    const checkIn = String(body.checkIn || '').trim();
    const checkOut = String(body.checkOut || '').trim();

    if (!hotelCode) return NextResponse.json({ error: 'Missing required field: hotelCode' }, { status: 400 });
    if (!checkIn) return NextResponse.json({ error: 'Missing required field: checkIn' }, { status: 400 });
    if (!checkOut) return NextResponse.json({ error: 'Missing required field: checkOut' }, { status: 400 });
    if (!/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2})?$/.test(checkIn) || !/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2})?$/.test(checkOut)) {
      return NextResponse.json({ error: 'Invalid date format. Use yyyy-MM-dd or yyyy-MM-ddTHH:mm:ss.' }, { status: 400 });
    }

    const hotelUrl = `${(process.env.SRDV_HOTEL_BASE_URL || process.env.SRDV_HOTEL_URL || 'https://hotel.srdvapi.com/v5/rest').replace(/\/+$/, '')}/GetHotelRoom`;
    const payload = {
      HotelCode: hotelCode,
      CheckInDate: checkIn.includes('T') ? checkIn : `${checkIn}T00:00:00`,
      CheckOutDate: checkOut.includes('T') ? checkOut : `${checkOut}T00:00:00`,
      NoOfRooms: Number(body.NoOfRooms ?? 1) || 1,
      RoomGuests: Array.isArray(body.RoomGuests) && body.RoomGuests.length ? body.RoomGuests : [{ NoOfAdults: 2, NoOfChild: 0, ChildAge: [] }],
      GuestNationality: String(body.GuestNationality || 'IN'),
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
