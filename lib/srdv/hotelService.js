/**
 * SRDV Hotel Service (Hotel API v8 REST)
 * Follows Hotel v8 specification with destination/cityid mapping.
 */

const HOTEL_API_URL = process.env.HOTEL_API_URL || 'https://hotel.srdvtest.com/v8/rest';
const SRDV_CLIENT_ID = process.env.SRDV_CLIENT_ID || 'SRDV_DEMO_CLIENT';
const SRDV_USERNAME = process.env.SRDV_USERNAME || 'srdv_agent';
const SRDV_PASSWORD = process.env.SRDV_PASSWORD || 'srdv_secret';
const SRDV_API_TOKEN = process.env.SRDV_API_TOKEN || '';

export function buildHotelSearchPayload(params = {}, endUserIp = '127.0.0.1') {
  const {
    cityId = '130443',
    destination = 'Manali',
    checkIn = '2025-12-25',
    checkOut = '2025-12-27',
    nights = 2,
    guestCount = 2,
    roomCount = 1,
    starRating = 0 // 0: Any, 3, 4, 5
  } = params;

  return {
    EndUserIp: endUserIp,
    ClientId: SRDV_CLIENT_ID,
    UserName: SRDV_USERNAME,
    Password: SRDV_PASSWORD,
    CityId: String(cityId),
    Destination: destination,
    CheckInDate: checkIn,
    CheckOutDate: checkOut,
    NoOfNights: Number(nights) || 1,
    NoOfRooms: Number(roomCount) || 1,
    GuestNationality: 'IN',
    StarRating: Number(starRating) || 0,
    RoomGuests: [
      {
        NoOfAdults: Number(guestCount) || 2,
        NoOfChild: 0,
        ChildAge: []
      }
    ]
  };
}

export async function callHotelSearch(payload) {
  const endpoint = `${HOTEL_API_URL.replace(/\/$/, '')}/Search`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  try {
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
    if (SRDV_API_TOKEN) {
      headers['Api-Token'] = SRDV_API_TOKEN;
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Upstream SRDV Hotel API returned HTTP ${response.status}`);
    }

    const data = await response.json();
    if (data && data.Response && data.Response.Error && data.Response.Error.ErrorCode !== 0) {
      throw new Error(data.Response.Error.ErrorMessage || 'SRDV Hotel Search API Error');
    }

    return data;
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
}

export function mapHotelSearchResults(raw, searchContext = {}) {
  const results = [];
  const rawList = raw?.HotelResults || raw?.Results || raw?.Response?.HotelResults || [];

  if (Array.isArray(rawList) && rawList.length > 0) {
    rawList.forEach((hotel, idx) => {
      const price = hotel.Price?.PublishedPrice || hotel.Price?.OfferedPrice || hotel.Price || 4500;
      const hotelImg = hotel.HotelPicture || hotel.HotelImage || (Array.isArray(hotel.Images) && hotel.Images[0]) || null;

      results.push({
        id: `HT-${hotel.HotelCode || idx}`,
        hotelId: hotel.HotelCode || String(300 + idx),
        resultIndex: hotel.ResultIndex || String(idx),
        traceId: raw?.Response?.TraceId || raw?.TraceId || 'TR-HOTEL',
        name: hotel.HotelName || 'Snow Valley Resort',
        stars: Number(hotel.StarRating || hotel.Rating) || 4,
        room: hotel.RoomTypeName || hotel.Rooms?.[0]?.Name || 'Deluxe Room',
        meal: hotel.Inclusion || hotel.MealType || 'Breakfast Included',
        price: Math.round(Number(price) || 4500),
        rating: hotel.TripAdvisorRating || hotel.UserRating || 4.2,
        reviews: Number(hotel.ReviewCount || hotel.TotalReviews) || 1250,
        image: hotelImg, // Will fall back to UI placeholder if null
        location: hotel.Address || searchContext.destination || 'Manali',
        nights: Number(searchContext.nights) || 1
      });
    });
  }

  return results;
}

export async function searchHotels(params = {}, endUserIp = '127.0.0.1') {
  const payload = buildHotelSearchPayload(params, endUserIp);
  const raw = await callHotelSearch(payload);
  return mapHotelSearchResults(raw, params);
}
