import { logApiCall } from '../auditLogger.js';
import { resolveBusCity } from '../../lib/srdv/cityMappings.js';
import { DummyBusBookingProvider, DummyCancellationProvider } from './dummy/dummyBookingProvider.js';

const BUS_API_URL = process.env.SRDV_BUS_URL || process.env.BUS_API_URL || 'https://bus.srdvapi.com/v5/rest';
const SRDV_CLIENT_ID = process.env.SRDV_CLIENT_ID || '180189';
const SRDV_USERNAME = process.env.SRDV_USERNAME || 'MakeMy91';
const SRDV_PASSWORD = process.env.SRDV_PASSWORD || 'shakya@9811';
const SRDV_API_TOKEN = process.env.SRDV_API_TOKEN || '';
const PROXY_URL = process.env.SRDV_PROXY_URL || process.env.FORWARD_PROXY_URL || '';

function formatBusDate(dateInput, defaultDaysAhead = 14) {
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

  return ymd;
}

async function callSrdvBusEndpoint(endpointPath, payload, actionName, traceId = null) {
  let fullUrl = BUS_API_URL.replace(/\/+$/, '');
  if (!fullUrl.endsWith('/rest')) {
    fullUrl = `${fullUrl}/rest`;
  }
  const targetUrl = `${fullUrl}/${endpointPath.replace(/^\/+/, '')}`;
  const requestUrl = PROXY_URL ? `${PROXY_URL}?target=${encodeURIComponent(targetUrl)}` : targetUrl;

  const startTime = Date.now();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 20000);

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
      throw new Error(`SRDV Bus API returned HTTP ${response.status} (${response.statusText})`);
    }

    const data = await response.json();
    const errCode = data?.Error?.ErrorCode || data?.Result?.Error?.ErrorCode;
    const errMsg = data?.Error?.ErrorMessage || data?.Result?.Error?.ErrorMessage;

    await logApiCall({
      serviceType: 'BUS',
      action: actionName,
      provider: 'SRDV',
      endpoint: targetUrl,
      httpMethod: 'POST',
      requestData: payload,
      responseData: data,
      httpStatus: response.status,
      providerErrorCode: errCode,
      providerErrorMessage: errMsg,
      traceId: traceId || data?.TraceId || data?.Result?.TraceId,
      latency,
      status: (!errCode || String(errCode) === '0' || Number(errCode) === 25) ? 'SUCCESS' : 'ERROR'
    });

    return data;
  } catch (err) {
    clearTimeout(timeoutId);
    const latency = Date.now() - startTime;
    await logApiCall({
      serviceType: 'BUS',
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

export const busProvider = {
  async search(params = {}) {
    const {
      fromCity = 'Delhi',
      toCity = 'Manali',
      sourceCity = '',
      destinationCity = '',
      sourceCode = '',
      destinationCode = '',
      departDate = '',
      date = ''
    } = params;

    const rawSource = sourceCity || fromCity || 'Delhi';
    const resolvedSource = resolveBusCity(sourceCode || rawSource);

    const rawDest = destinationCity || toCity || 'Manali';
    const resolvedDest = resolveBusCity(destinationCode || rawDest);

    const rawDate = departDate || date || '';
    const formattedDepartDate = formatBusDate(rawDate, 14);

    const payload = {
      ClientId: SRDV_CLIENT_ID,
      UserName: SRDV_USERNAME,
      Password: SRDV_PASSWORD,
      source_city: resolvedSource.name,
      source_code: String(resolvedSource.code),
      destination_city: resolvedDest.name,
      destination_code: String(resolvedDest.code),
      depart_date: formattedDepartDate
    };

    return await callSrdvBusEndpoint('Search', payload, 'Search');
  },

  async boardingPointDetails(params = {}) {
    const { traceId, resultIndex = '0' } = params;

    const payload = {
      ClientId: SRDV_CLIENT_ID,
      UserName: SRDV_USERNAME,
      Password: SRDV_PASSWORD,
      TraceId: String(traceId),
      ResultIndex: String(resultIndex)
    };

    return await callSrdvBusEndpoint('GetBoardingPointDetails', payload, 'GetBoardingPointDetails', traceId);
  },

  async seatLayout(params = {}) {
    const { traceId, resultIndex = '0' } = params;

    const payload = {
      ClientId: SRDV_CLIENT_ID,
      UserName: SRDV_USERNAME,
      Password: SRDV_PASSWORD,
      TraceId: String(traceId),
      ResultIndex: String(resultIndex)
    };

    return await callSrdvBusEndpoint('GetSeatLayOut', payload, 'GetSeatLayOut', traceId);
  },

  async book(bookingPayload) {
    // REAL BOOKING DISABLED
    return await DummyBusBookingProvider.book(bookingPayload);
  },

  async cancel(cancellationPayload) {
    // REAL CANCELLATION DISABLED
    return await DummyCancellationProvider.cancel({
      serviceType: 'BUS',
      ...cancellationPayload
    });
  }
};
