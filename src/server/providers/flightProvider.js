import { logApiCall } from '../auditLogger.js';
import { DummyFlightBookingProvider, DummyCancellationProvider } from './dummy/dummyBookingProvider.js';
import { normalizeSrdvContext } from '../srdvContext.js';

const FLIGHT_API_URL = process.env.SRDV_FLIGHT_URL || process.env.FLIGHT_API_URL || 'https://flight.srdvapi.com/v8/rest';
const SRDV_CLIENT_ID = process.env.SRDV_CLIENT_ID || '180189';
const SRDV_USERNAME = process.env.SRDV_USERNAME || 'MakeMy91';
const SRDV_PASSWORD = process.env.SRDV_PASSWORD || 'shakya@9811';
const SRDV_API_TOKEN = process.env.SRDV_API_TOKEN || '';
const PROXY_URL = process.env.SRDV_PROXY_URL || process.env.FORWARD_PROXY_URL || '';

function formatFlightDate(dateInput, defaultDaysAhead = 14) {
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

  return `${ymd}T00:00:00`;
}

async function callSrdvEndpoint(endpointPath, payload, actionName, traceId = null) {
  let fullUrl = FLIGHT_API_URL.replace(/\/+$/, '');
  if (!fullUrl.endsWith('/rest')) {
    fullUrl = `${fullUrl}/rest`;
  }
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
      throw new Error(`SRDV Flight API returned HTTP ${response.status} (${response.statusText})`);
    }

    const data = await response.json();
    const errCode = data?.Error?.ErrorCode || data?.Response?.Error?.ErrorCode;
    const errMsg = data?.Error?.ErrorMessage || data?.Response?.Error?.ErrorMessage;

    await logApiCall({
      serviceType: 'FLIGHT',
      action: actionName,
      provider: 'SRDV',
      endpoint: targetUrl,
      httpMethod: 'POST',
      requestData: payload,
      responseData: data,
      httpStatus: response.status,
      providerErrorCode: errCode,
      providerErrorMessage: errMsg,
      traceId: traceId || data?.TraceId || data?.Response?.TraceId,
      latency,
      status: (!errCode || String(errCode) === '0') ? 'SUCCESS' : 'ERROR'
    });

    if (String(errCode) === '900' || errMsg?.toLowerCase().includes('not authorized')) {
      const err = new Error(`SRDV Flight API [Error 900]: Whitelist required for server outbound IP.`);
      err.isIpError = true;
      err.errorCode = '900';
      throw err;
    }

    return data;
  } catch (err) {
    clearTimeout(timeoutId);
    const latency = Date.now() - startTime;
    await logApiCall({
      serviceType: 'FLIGHT',
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

export const flightProvider = {
  async search(params = {}, endUserIp = '122.161.76.198') {
    const {
      origin = 'DEL',
      destination = 'BOM',
      departureDate = '',
      returnDate = '',
      adultCount = 1,
      childCount = 0,
      infantCount = 0,
      flightCabinClass = 0,
      journeyType = 1,
      directFlight = false
    } = params;

    const orgCode = String(origin).toUpperCase().trim();
    const destCode = String(destination).toUpperCase().trim();
    const prefDepTime = formatFlightDate(departureDate, 14);
    const resolvedJourneyType = Number(journeyType) === 2 || Boolean(returnDate) ? 2 : 1;

    const segments = [
      {
        Origin: orgCode,
        Destination: destCode,
        FlightCabinClass: Number(flightCabinClass) || 0,
        PreferredDepartureTime: prefDepTime,
        PreferredArrivalTime: prefDepTime
      }
    ];

    if (resolvedJourneyType === 2) {
      const prefRetTime = formatFlightDate(returnDate || departureDate, 17);
      segments.push({
        Origin: destCode,
        Destination: orgCode,
        FlightCabinClass: Number(flightCabinClass) || 0,
        PreferredDepartureTime: prefRetTime,
        PreferredArrivalTime: prefRetTime
      });
    }

    const payload = {
      EndUserIp: endUserIp || '122.161.76.198',
      ClientId: SRDV_CLIENT_ID,
      UserName: SRDV_USERNAME,
      Password: SRDV_PASSWORD,
      AdultCount: Math.max(1, Number(adultCount) || 1),
      ChildCount: Math.max(0, Number(childCount) || 0),
      InfantCount: Math.max(0, Number(infantCount) || 0),
      JourneyType: resolvedJourneyType,
      DirectFlight: Boolean(directFlight),
      Segments: segments
    };

    return await callSrdvEndpoint('Search', payload, 'Search');
  },

  async fareCalendar(params = {}, endUserIp = '122.161.76.198') {
    const {
      origin = 'DEL',
      destination = 'BOM',
      departureDate = '',
      flightCabinClass = 1
    } = params;

    const prefDepTime = formatFlightDate(departureDate, 14);

    const payload = {
      EndUserIp: endUserIp || '122.161.76.198',
      ClientId: SRDV_CLIENT_ID,
      UserName: SRDV_USERNAME,
      Password: SRDV_PASSWORD,
      JourneyType: 1,
      FlightCabinClass: Number(flightCabinClass) || 1,
      Segments: [
        {
          Origin: String(origin).toUpperCase().trim(),
          Destination: String(destination).toUpperCase().trim(),
          PreferredDepartureTime: prefDepTime
        }
      ]
    };

    return await callSrdvEndpoint('GetCalendarFare', payload, 'FareCalendar');
  },

  async fareRule(params = {}) {
    const ctx = normalizeSrdvContext(params);
    const payload = {
      EndUserIp: '1.1.1.1',
      ClientId: SRDV_CLIENT_ID,
      UserName: SRDV_USERNAME,
      Password: SRDV_PASSWORD,
      TraceId: String(ctx.traceId),
      SrdvType: String(ctx.srdvType),
      SrdvIndex: String(ctx.srdvIndex),
      ResultIndex: String(ctx.resultIndex)
    };

    return await callSrdvEndpoint('FareRule', payload, 'FareRule', ctx.traceId);
  },

  async fareQuote(params = {}) {
    const ctx = normalizeSrdvContext(params);
    const payload = {
      EndUserIp: '1.1.1.1',
      ClientId: SRDV_CLIENT_ID,
      UserName: SRDV_USERNAME,
      Password: SRDV_PASSWORD,
      TraceId: String(ctx.traceId),
      SrdvType: String(ctx.srdvType),
      SrdvIndex: String(ctx.srdvIndex),
      ResultIndex: String(ctx.resultIndex)
    };

    return await callSrdvEndpoint('FareQuote', payload, 'FareQuote', ctx.traceId);
  },

  async seatMap(params = {}) {
    const ctx = normalizeSrdvContext(params);
    const payload = {
      EndUserIp: '1.1.1.1',
      ClientId: SRDV_CLIENT_ID,
      UserName: SRDV_USERNAME,
      Password: SRDV_PASSWORD,
      TraceId: String(ctx.traceId),
      SrdvType: String(ctx.srdvType),
      SrdvIndex: String(ctx.srdvIndex),
      ResultIndex: String(ctx.resultIndex)
    };

    return await callSrdvEndpoint('SeatMap', payload, 'SeatMap', ctx.traceId);
  },

  async ssr(params = {}) {
    const ctx = normalizeSrdvContext(params);
    const payload = {
      EndUserIp: '1.1.1.1',
      ClientId: SRDV_CLIENT_ID,
      UserName: SRDV_USERNAME,
      Password: SRDV_PASSWORD,
      TraceId: String(ctx.traceId),
      SrdvType: String(ctx.srdvType),
      SrdvIndex: String(ctx.srdvIndex),
      ResultIndex: String(ctx.resultIndex)
    };

    return await callSrdvEndpoint('SSR', payload, 'SSR', ctx.traceId);
  },

  async book(bookingPayload) {
    // REAL BOOKING APIS MUST REMAIN DISABLED AS PER SPECIFICATION
    // Dummy booking provider returns realistic synthetic SRDV response
    return await DummyFlightBookingProvider.book(bookingPayload);
  },

  async cancel(cancellationPayload) {
    // REAL CANCELLATION APIS MUST REMAIN DISABLED AS PER SPECIFICATION
    return await DummyCancellationProvider.cancel({
      serviceType: 'FLIGHT',
      ...cancellationPayload
    });
  }
};
