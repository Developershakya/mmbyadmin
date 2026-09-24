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

const parseYmd = (value) => {
  const raw = String(value || '').trim();
  if (!raw) return null;

  const datePart = raw.includes('T') ? raw.split('T')[0] : raw;

  if (/^\d{4}-\d{2}-\d{2}$/.test(datePart)) {
    const [yyyy, mm, dd] = datePart.split('-');
    return new Date(`${yyyy}-${mm}-${dd}T00:00:00`);
  }

  if (/^\d{2}\/\d{2}\/\d{4}$/.test(datePart)) {
    const [dd, mm, yyyy] = datePart.split('/');
    return new Date(`${yyyy}-${mm}-${dd}T00:00:00`);
  }

  const parsed = new Date(`${datePart}T00:00:00`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const addDays = (date, days) => {
  const clone = new Date(date);
  clone.setDate(clone.getDate() + days);
  return clone;
};

export async function POST(request) {
  const body = await request.json();
  const destination = String(body.destination || '').trim();
  const checkIn = String(body.checkIn || '').trim();
  const checkOut = String(body.checkOut || '').trim();

  if (!destination) return NextResponse.json({ error: 'Missing required field: destination' }, { status: 400 });
  if (!checkIn) return NextResponse.json({ error: 'Missing required field: checkIn' }, { status: 400 });

  const validDatePattern = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2})?$|^\d{2}\/\d{2}\/\d{4}$/;
  if (!validDatePattern.test(checkIn)) {
    return NextResponse.json({ error: 'Invalid date format. Use yyyy-MM-dd or dd/MM/yyyy.' }, { status: 400 });
  }

  const checkInDate = parseYmd(checkIn);
  if (!checkInDate) {
    return NextResponse.json({ error: 'Invalid check-in date.' }, { status: 400 });
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const safeCheckIn = checkInDate < today ? today : checkInDate;

  let finalCheckOut = checkOut ? parseYmd(checkOut) : null;
  if (!finalCheckOut || finalCheckOut <= safeCheckIn) {
    finalCheckOut = addDays(safeCheckIn, 1);
  }

  if (finalCheckOut < today) {
    finalCheckOut = addDays(today, 1);
  }

  const roomGuests = Array.isArray(body.RoomGuests) && body.RoomGuests.length
    ? body.RoomGuests
    : [{ NoOfAdults: Number(body.adultCount ?? 2) || 2, NoOfChild: Number(body.childCount ?? 0) || 0, ChildAge: [] }];

  const hotelUrl = `${(process.env.SRDV_HOTEL_BASE_URL || process.env.SRDV_HOTEL_URL || 'https://hotel.srdvapi.com/v8/rest').replace(/\/+$/, '')}/Search`;
  const payload = {
    EndUserIp: process.env.SRDV_END_USER_IP || body.endUserIp || '1.1.1.1',
    ClientId: process.env.SRDV_CLIENT_ID || body.clientId || '',
    UserName: process.env.SRDV_USERNAME || body.userName || '',
    Password: process.env.SRDV_PASSWORD || body.password || '',
    BookingMode: body.BookingMode || '5',
    CheckInDate: normalizeHotelSrdvDate(safeCheckIn),
    CheckOutDate: normalizeHotelSrdvDate(finalCheckOut),
    NoOfNights: Number(body.nights ?? 1) || 1,
    CountryCode: body.CountryCode || body.countryCode || 'IN',
    CityId: destination,
    PreferredCurrency: body.PreferredCurrency || body.preferredCurrency || 'INR',
    GuestNationality: String(body.GuestNationality || body.guestNationality || 'IN'),
    NoOfRooms: String(body.NoOfRooms ?? body.rooms ?? 1),
    RoomGuests: roomGuests,
    MaxRating: body.MaxRating || body.maxRating || '5',
    MinRating: body.MinRating || body.minRating || '0',
  };

  console.log('SRDV hotel search payload:', JSON.stringify(payload, null, 2));

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
