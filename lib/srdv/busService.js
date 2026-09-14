/**
 * SRDV Bus Service (Bus API v8 REST)
 * Follows Bus v8 specification with SourceId & DestinationId mapping.
 */

const BUS_API_URL = process.env.SRDV_BUS_URL || process.env.BUS_API_URL || 'https://bus.srdvapi.com/v8/rest';
const SRDV_CLIENT_ID = process.env.SRDV_CLIENT_ID || '';
const SRDV_USERNAME = process.env.SRDV_USERNAME || '';
const SRDV_PASSWORD = process.env.SRDV_PASSWORD || '';
const SRDV_API_TOKEN = process.env.SRDV_API_TOKEN || '';

export function buildBusSearchPayload(params = {}, endUserIp = '127.0.0.1') {
  const {
    sourceId = 1,
    destinationId = 2,
    dateOfJourney = '2025-12-25',
    fromCity = 'Delhi',
    toCity = 'Manali'
  } = params;

  return {
    EndUserIp: endUserIp,
    ClientId: SRDV_CLIENT_ID,
    UserName: SRDV_USERNAME,
    Password: SRDV_PASSWORD,
    SourceId: Number(sourceId) || 1,
    DestinationId: Number(destinationId) || 2,
    DateOfJourney: dateOfJourney,
    FromCity: fromCity,
    ToCity: toCity
  };
}

export async function callBusSearch(payload) {
  const endpoint = `${BUS_API_URL.replace(/\/$/, '')}/Search`;
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
      throw new Error(`Upstream SRDV Bus API returned HTTP ${response.status}`);
    }

    const data = await response.json();
    if (data && data.Response && data.Response.Error && data.Response.Error.ErrorCode !== 0) {
      throw new Error(data.Response.Error.ErrorMessage || 'SRDV Bus Search API Error');
    }

    return data;
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
}

export function mapBusSearchResults(raw, searchContext = {}) {
  const results = [];
  const rawList = raw?.BusResults || raw?.Results || raw?.Response?.BusResults || [];

  if (Array.isArray(rawList) && rawList.length > 0) {
    rawList.forEach((bus, idx) => {
      const fare = bus.BusPrice || bus.Fare || {};
      const publishedFare = typeof fare === 'number' ? fare : (fare.PublishedPrice || fare.TotalFare || bus.Price || 1400);

      results.push({
        id: `BUS-${bus.ResultIndex || bus.BusId || idx}`,
        busId: bus.BusId || String(100 + idx),
        resultIndex: bus.ResultIndex || String(idx),
        traceId: raw?.Response?.TraceId || raw?.TraceId || 'TR-BUS',
        operator: bus.TravelName || bus.OperatorName || 'HRTC Volvo',
        busType: bus.BusType || 'A/C Sleeper / Multi-Axle',
        departure: bus.DepartureTime ? bus.DepartureTime.split('T')[1]?.slice(0, 5) || bus.DepartureTime : '21:00',
        arrival: bus.ArrivalTime ? bus.ArrivalTime.split('T')[1]?.slice(0, 5) || bus.ArrivalTime : '06:30',
        duration: bus.Duration || '9h 30m',
        from: searchContext.from || searchContext.fromCity || 'Delhi',
        to: searchContext.to || searchContext.toCity || 'Manali',
        price: Math.round(Number(publishedFare) || 1400),
        seatsAvailable: bus.AvailableSeats || 18,
        rating: bus.Rating || 4.5,
        boardingPoints: bus.BoardingPointsDetails?.map(b => b.CityPointLocation || b.CityPointName) || ['ISBT Kashmiri Gate', 'Majnu Ka Tilla'],
        droppingPoints: bus.DroppingPointsDetails?.map(d => d.CityPointLocation || d.CityPointName) || ['Manali Private Bus Stand', 'Mall Road']
      });
    });
  }

  return results;
}

export async function searchBuses(params = {}, endUserIp = '127.0.0.1') {
  const payload = buildBusSearchPayload(params, endUserIp);
  const raw = await callBusSearch(payload);
  return mapBusSearchResults(raw, params);
}
