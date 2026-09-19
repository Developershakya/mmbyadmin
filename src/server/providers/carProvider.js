import { logApiCall } from '../auditLogger.js';
import { DummyCarBookingProvider, DummyCancellationProvider } from './dummy/dummyBookingProvider.js';

const CAR_API_URL = process.env.SRDV_CAR_URL || process.env.CAR_API_URL || 'https://car.srdvapi.com/v8/rest';
const SRDV_CLIENT_ID = process.env.SRDV_CLIENT_ID || '180189';
const SRDV_USERNAME = process.env.SRDV_USERNAME || 'MakeMy91';
const SRDV_PASSWORD = process.env.SRDV_PASSWORD || 'shakya@9811';
const SRDV_API_TOKEN = process.env.SRDV_API_TOKEN || '';
const PROXY_URL = process.env.SRDV_PROXY_URL || process.env.FORWARD_PROXY_URL || '';

async function callSrdvCarEndpoint(endpointPath, payload, actionName, traceId = null) {
  let fullUrl = CAR_API_URL.replace(/\/+$/, '');
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
      throw new Error(`SRDV Car API returned HTTP ${response.status} (${response.statusText})`);
    }

    const data = await response.json();
    const errCode = data?.Error?.ErrorCode || data?.Result?.Error?.ErrorCode;
    const errMsg = data?.Error?.ErrorMessage || data?.Result?.Error?.ErrorMessage;

    await logApiCall({
      serviceType: 'CAR',
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
      status: (!errCode || String(errCode) === '0') ? 'SUCCESS' : 'ERROR'
    });

    return data;
  } catch (err) {
    clearTimeout(timeoutId);
    const latency = Date.now() - startTime;
    await logApiCall({
      serviceType: 'CAR',
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

export const carProvider = {
  async search(params = {}, endUserIp = '122.161.76.198') {
    const {
      fromCity = 'Delhi',
      toCity = 'Manali',
      pickupDate = '',
      tripType = '0',
      hours = '8'
    } = params;

    const payload = {
      EndUserIp: endUserIp || '122.161.76.198',
      ClientId: SRDV_CLIENT_ID,
      UserName: SRDV_USERNAME,
      Password: SRDV_PASSWORD,
      FormCity: '673',
      ToCity: '336',
      PickUpDate: pickupDate || new Date().toISOString().split('T')[0],
      DropDate: '',
      Hours: String(hours || '8'),
      TripType: String(tripType || '0')
    };

    return await callSrdvCarEndpoint('Search', payload, 'Search');
  },

  async details(params = {}) {
    const { carId, category } = params;
    return {
      carId,
      category,
      tollIncluded: true,
      fuelIncluded: true,
      driverAllowancePerDay: 350,
      cancellationPolicy: 'Free cancellation up to 6 hours before pickup time. After that, 1-day rental charge applies.'
    };
  },

  async book(bookingPayload) {
    // REAL BOOKING DISABLED
    return await DummyCarBookingProvider.book(bookingPayload);
  },

  async cancel(cancellationPayload) {
    // REAL CANCELLATION DISABLED
    return await DummyCancellationProvider.cancel({
      serviceType: 'CAR',
      ...cancellationPayload
    });
  }
};
