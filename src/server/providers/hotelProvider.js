import { logApiCall } from '../auditLogger.js';
import { resolveHotelCity } from '../../lib/srdv/cityMappings.js';
import { DummyHotelBookingProvider, DummyCancellationProvider } from './dummy/dummyBookingProvider.js';
import { normalizeSrdvContext } from '../srdvContext.js';

const HOTEL_API_URL = process.env.SRDV_HOTEL_URL || process.env.HOTEL_API_URL || 'https://hotel.srdvapi.com/v5/rest';
const SRDV_CLIENT_ID = process.env.SRDV_CLIENT_ID || '180189';
const SRDV_USERNAME = process.env.SRDV_USERNAME || 'MakeMy91';
const SRDV_PASSWORD = process.env.SRDV_PASSWORD || 'shakya@9811';
const SRDV_API_TOKEN = process.env.SRDV_API_TOKEN || '';
const PROXY_URL = process.env.SRDV_PROXY_URL || process.env.FORWARD_PROXY_URL || '';

function formatHotelDate(dateInput, defaultDaysAhead = 14) {
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  let rawDate = dateInput ? String(dateInput).trim() : '';
  let ymd = '';

  if (rawDate) {
    if (rawDate.includes('T')) {
      ymd = rawDate.split('T')[0];
    } else if (/^\d{4}-\d{2}-\d{2}$/.test(rawDate)) {
      ymd = rawDate;
    } else if (/^\d{2}\/\d{2}\/\d{4}$/.test(rawDate)) {
      const [dd, mm, yyyy] = rawDate.split('/');
      ymd = `${yyyy}-${mm}-${dd}`;
    }
  }

  if (!ymd || ymd < todayStr) {
    const future = new Date();
    future.setDate(future.getDate() + defaultDaysAhead);
    ymd = future.toISOString().split('T')[0];
  }

  const [yyyy, mm, dd] = ymd.split('-');
  return `${dd}/${mm}/${yyyy}`;
}

function getHotelRestBaseUrl() {
  const raw = process.env.SRDV_HOTEL_URL || 'https://hotel.srdvtest.com/v8/rest/Search';
  let url = raw.trim().replace(/\/+$/, '');
  url = url.replace(/\/(search|gethotelinfo|gethotelroom)$/i, '');
  if (!url.endsWith('/rest')) {
    url = `${url}/rest`;
  }
  return url;
}

async function callSrdvHotelEndpoint(endpointPath, payload, actionName, traceId = null) {
  const fullUrl = getHotelRestBaseUrl();
  const targetUrl = `${fullUrl}/${endpointPath.replace(/^\/+/, '')}`;
  const requestUrl = PROXY_URL ? `${PROXY_URL}?target=${encodeURIComponent(targetUrl)}` : targetUrl;

  const startTime = Date.now();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 25000);

  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  };
  if (SRDV_API_TOKEN) {
    headers['Api-Token'] = SRDV_API_TOKEN;
  }

  try {
    const response = await fetch(requestUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    const latency = Date.now() - startTime;

    if (!response.ok) {
      throw new Error(`SRDV Hotel API returned HTTP ${response.status} (${response.statusText})`);
    }

    const data = await response.json();
    const errCode = data?.Error?.ErrorCode || data?.HotelInfoResult?.Error?.ErrorCode || data?.GetHotelRoomResult?.Error?.ErrorCode;
    const errMsg = data?.Error?.ErrorMessage || data?.HotelInfoResult?.Error?.ErrorMessage || data?.GetHotelRoomResult?.Error?.ErrorMessage;

    await logApiCall({
      serviceType: 'HOTEL',
      action: actionName,
      provider: 'SRDV',
      endpoint: targetUrl,
      httpMethod: 'POST',
      requestData: payload,
      responseData: data,
      httpStatus: response.status,
      providerErrorCode: errCode,
      providerErrorMessage: errMsg,
      traceId: traceId || data?.TraceId,
      latency,
      status: (!errCode || String(errCode) === '0') ? 'SUCCESS' : 'ERROR'
    });

    return data;
  } catch (err) {
    clearTimeout(timeoutId);
    const latency = Date.now() - startTime;
    await logApiCall({
      serviceType: 'HOTEL',
      action: actionName,
      provider: 'SRDV',
      endpoint: targetUrl,
      httpMethod: 'POST',
      requestData: payload,
      responseData: { error: err.message },
      httpStatus: 500,
      providerErrorMessage: err.message,
      traceId,
      latency,
      status: 'ERROR'
    });
    throw err;
  }
}

export const hotelProvider = {
  async search(params = {}, endUserIp = '122.161.76.198') {
    const {
      cityId = '',
      destination = 'Manali',
      checkIn = '',
      checkInDate = '',
      checkOut = '',
      checkOutDate = '',
      nights = 1,
      adults = 2,
      children = 0,
      rooms = 1,
      minRating = 0,
      maxRating = 5
    } = params;

    const resolvedCity = resolveHotelCity(cityId || destination);
    const rawIn = checkInDate || checkIn || '';
    const formattedCheckIn = formatHotelDate(rawIn, 14);

    const payload = {
      EndUserIp: endUserIp || '122.161.76.198',
      ClientId: SRDV_CLIENT_ID,
      UserName: SRDV_USERNAME,
      Password: SRDV_PASSWORD,
      BookingMode: '5',
      CheckInDate: formattedCheckIn,
      NoOfNights: Math.max(1, Number(nights) || 1),
      CountryCode: 'IN',
      CityId: String(resolvedCity.cityid),
      ResultCount: null,
      PreferredCurrency: 'INR',
      GuestNationality: 'IN',
      NoOfRooms: String(Math.max(1, Number(rooms) || 1)),
      RoomGuests: [
        {
          NoOfAdults: String(Math.max(1, Number(adults) || 2)),
          NoOfChild: String(Math.max(0, Number(children) || 0)),
          ChildAge: []
        }
      ],
      PreferredHotel: '',
      MaxRating: String(maxRating || 5),
      MinRating: String(minRating || 0),
      IsNearBySearchAllowed: false
    };

    return await callSrdvHotelEndpoint('Search', payload, 'Search');
  },

  async hotelInfo(params = {}) {
    const ctx = normalizeSrdvContext(params);
    const hotelCode = params.hotelCode || ctx.hotelCode;

    const payload = {
      EndUserIp: '1.1.1.1',
      ClientId: SRDV_CLIENT_ID,
      UserName: SRDV_USERNAME,
      Password: SRDV_PASSWORD,
      TraceId: String(ctx.traceId),
      SrdvType: String(ctx.srdvType),
      SrdvIndex: String(ctx.srdvIndex),
      ResultIndex: String(ctx.resultIndex),
      HotelCode: String(hotelCode)
    };

    return await callSrdvHotelEndpoint('GetHotelInfo', payload, 'GetHotelInfo', ctx.traceId);
  },

  async hotelRoom(params = {}) {
    const ctx = normalizeSrdvContext(params);
    const hotelCode = params.hotelCode || ctx.hotelCode;

    const payload = {
      EndUserIp: '1.1.1.1',
      ClientId: SRDV_CLIENT_ID,
      UserName: SRDV_USERNAME,
      Password: SRDV_PASSWORD,
      TraceId: String(ctx.traceId),
      SrdvType: String(ctx.srdvType),
      SrdvIndex: String(ctx.srdvIndex),
      ResultIndex: String(ctx.resultIndex),
      HotelCode: String(hotelCode)
    };

    return await callSrdvHotelEndpoint('GetHotelRoom', payload, 'GetHotelRoom', ctx.traceId);
  },

  async book(bookingPayload) {
    // REAL BOOKING DISABLED
    return await DummyHotelBookingProvider.book(bookingPayload);
  },

  async cancel(cancellationPayload) {
    // REAL CANCELLATION DISABLED
    return await DummyCancellationProvider.cancel({
      serviceType: 'HOTEL',
      ...cancellationPayload
    });
  }
};
