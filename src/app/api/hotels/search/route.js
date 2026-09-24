import { callSrdvApi } from '@/lib/srdvApi';
import { NextResponse } from "next/server";

const normalizeHotelApiDate = (value) => {
  const raw = String(value ?? '').trim();
  if (!raw) return '';

  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;

  if (/^\d{2}\/\d{2}\/\d{4}$/.test(raw)) {
    const [dd, mm, yyyy] = raw.split('/');
    return `${yyyy}-${mm}-${dd}`;
  }

  const parsed = new Date(`${raw.includes('T') ? raw.split('T')[0] : raw}T00:00:00`);
  if (!Number.isNaN(parsed.getTime())) {
    const yyyy = parsed.getFullYear();
    const mm = String(parsed.getMonth() + 1).padStart(2, '0');
    const dd = String(parsed.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  return raw;
};

export async function POST(request) {
  const { checkInDate, noOfNights, cityId, guestNationality, noOfRooms, roomGuests } = await request.json();

  if (!checkInDate || !cityId) {
    return NextResponse.json({
      success: false,
      message: "checkInDate aur cityId required hain",
    }, { status: 400 });
  }

  try {
    const formattedRoomGuests = Array.isArray(roomGuests)
      ? roomGuests.map(g => ({
          NoOfAdults: String(g.adults || 1),
          NoOfChild: String(g.children || 0),
          ChildAge: g.childAge || []
        }))
      : [];

    const payload = {
      BookingMode: "5",
      CheckInDate: normalizeHotelApiDate(checkInDate),
      NoOfNights: String(noOfNights || 1),
      CityId: String(cityId || ''),
      CountryCode: "",
      GuestNationality: guestNationality || "IN",
      PreferredCurrency: "INR",
      NoOfRooms: String(noOfRooms || 1),
      RoomGuests: formattedRoomGuests,
      MinRating: "0",
      MaxRating: "5",
      IsNearBySearchAllowed: false
    };
   console.log("Payload for SRDV API:", payload);
    const data = await callSrdvApi(process.env.HOTEL_API_URL, 'Search', payload);

    if (data.Error && String(data.Error.ErrorCode) !== '0') {
      return NextResponse.json({ success: false, message: data.Error.ErrorMessage });
    }

    const rawResults = Array.isArray(data.Results)
      ? data.Results
      : Array.isArray(data.Response?.Results)
        ? data.Response.Results
        : [];
    const results = rawResults.flatMap((group) => Array.isArray(group) ? group : [group]).filter(Boolean);

    if (results.length > 0) {
  return NextResponse.json({
    success: true,
    traceId: data.TraceId,
    srdvType: data.SrdvType,
        results,
  });
}

    return NextResponse.json({ success: false, message: 'No hotels found' });
  } catch (error) {
    console.error("Hotel search API error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

