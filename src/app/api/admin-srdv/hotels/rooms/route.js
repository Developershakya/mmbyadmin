import { NextResponse } from 'next/server';

const normalizeHotelSrdvDate = (value) => {
  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) return '';
    const yyyy = value.getFullYear();
    const mm = String(value.getMonth() + 1).padStart(2, '0');
    const dd = String(value.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  const raw = String(value ?? '').trim();
  if (!raw) return '';

  const datePart = raw.includes('T') ? raw.split('T')[0] : raw;

  if (/^\d{4}-\d{2}-\d{2}$/.test(datePart)) {
    return datePart;
  }

  if (/^\d{2}\/\d{2}\/\d{4}$/.test(datePart)) {
    const [dd, mm, yyyy] = datePart.split('/');
    return `${yyyy}-${mm}-${dd}`;
  }

  const parsed = new Date(`${datePart}T00:00:00`);
  if (!Number.isNaN(parsed.getTime())) {
    const yyyy = parsed.getFullYear();
    const mm = String(parsed.getMonth() + 1).padStart(2, '0');
    const dd = String(parsed.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  return raw;
};

export async function POST(request) {
  const body = await request.json();
  const hotelCode = String(body.hotelCode || '').trim();
  const checkIn = String(body.checkIn || '').trim();
  const checkOut = String(body.checkOut || '').trim();

  if (!hotelCode) return NextResponse.json({ error: 'Missing required field: hotelCode' }, { status: 400 });
  if (!checkIn) return NextResponse.json({ error: 'Missing required field: checkIn' }, { status: 400 });
  if (!checkOut) return NextResponse.json({ error: 'Missing required field: checkOut' }, { status: 400 });

  const validDatePattern = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2})?$|^\d{2}\/\d{2}\/\d{4}$/;
  if (!validDatePattern.test(checkIn) || !validDatePattern.test(checkOut)) {
    return NextResponse.json({ error: 'Invalid date format. Use yyyy-MM-dd or dd/MM/yyyy.' }, { status: 400 });
  }

  const roomGuests = Array.isArray(body.RoomGuests) && body.RoomGuests.length
    ? body.RoomGuests
    : [{ NoOfAdults: 2, NoOfChild: 0, ChildAge: [] }];

  const hotelUrl = `${(process.env.SRDV_HOTEL_BASE_URL || process.env.SRDV_HOTEL_URL || 'https://hotel.srdvapi.com/v5/rest').replace(/\/+$/, '')}/GetHotelRoom`;
  const payload = {
    EndUserIp: process.env.SRDV_END_USER_IP || body.endUserIp || '1.1.1.1',
    ClientId: process.env.SRDV_CLIENT_ID || body.clientId || '',
    UserName: process.env.SRDV_USERNAME || body.userName || '',
    Password: process.env.SRDV_PASSWORD || body.password || '',
    HotelCode: hotelCode,
    CheckInDate: normalizeHotelSrdvDate(checkIn),
    CheckOutDate: normalizeHotelSrdvDate(checkOut),
    NoOfRooms: Number(body.NoOfRooms ?? 1) || 1,
    RoomGuests: roomGuests,
    GuestNationality: String(body.GuestNationality || 'IN'),
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
