/**
 * SRDV Flight Service (Flight API v8 REST)
 */

const FLIGHT_API_URL = process.env.FLIGHT_API_URL || 'https://flight.srdvtest.com/v8/rest';
const SRDV_CLIENT_ID = process.env.SRDV_CLIENT_ID || 'SRDV_DEMO_CLIENT';
const SRDV_USERNAME = process.env.SRDV_USERNAME || 'srdv_agent';
const SRDV_PASSWORD = process.env.SRDV_PASSWORD || 'srdv_secret';
const SRDV_API_TOKEN = process.env.SRDV_API_TOKEN || '';

export function buildFlightSearchPayload(params = {}, endUserIp = '127.0.0.1') {
  const {
    origin = 'DEL',
    destination = 'KUU',
    departureDate = '2025-12-25',
    returnDate = '',
    adultCount = 1,
    childCount = 0,
    infantCount = 0,
    flightCabinClass = 1, // 1: All, 2: Economy, 3: PremiumEconomy, 4: Business
    journeyType = 1, // 1: OneWay, 2: Return
    directFlight = false
  } = params;

  const prefDepTime = departureDate.includes('T') ? departureDate : `${departureDate}T00:00:00`;
  const segments = [
    {
      Origin: String(origin).toUpperCase().trim(),
      Destination: String(destination).toUpperCase().trim(),
      FlightCabinClass: Number(flightCabinClass) || 1,
      PreferredDepartureTime: prefDepTime
    }
  ];

  if (Number(journeyType) === 2 && returnDate) {
    const prefRetTime = returnDate.includes('T') ? returnDate : `${returnDate}T00:00:00`;
    segments.push({
      Origin: String(destination).toUpperCase().trim(),
      Destination: String(origin).toUpperCase().trim(),
      FlightCabinClass: Number(flightCabinClass) || 1,
      PreferredDepartureTime: prefRetTime
    });
  }

  return {
    EndUserIp: endUserIp,
    ClientId: SRDV_CLIENT_ID,
    UserName: SRDV_USERNAME,
    Password: SRDV_PASSWORD,
    AdultCount: Number(adultCount) || 1,
    ChildCount: Number(childCount) || 0,
    InfantCount: Number(infantCount) || 0,
    JourneyType: Number(journeyType) || 1,
    DirectFlight: Boolean(directFlight),
    Segments: segments
  };
}

export async function callFlightSearch(payload) {
  const endpoint = `${FLIGHT_API_URL.replace(/\/$/, '')}/Search`;
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
      throw new Error(`Upstream SRDV Flight API returned HTTP ${response.status}`);
    }

    const data = await response.json();
    if (data && data.Response && data.Response.Error && data.Response.Error.ErrorCode !== 0) {
      throw new Error(data.Response.Error.ErrorMessage || 'SRDV Flight Search API Error');
    }

    return data;
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
}

export function mapFlightSearchResults(raw, searchContext = {}) {
  const results = [];
  const rawList = raw?.Results || raw?.Response?.Results || [];

  if (Array.isArray(rawList)) {
    const flattened = Array.isArray(rawList[0]) ? rawList[0] : rawList;
    flattened.forEach((item, idx) => {
      const seg = item.Segments?.[0]?.[0] || item.Segments?.[0] || {};
      const fare = item.Fare || {};
      results.push({
        id: `FL-${item.ResultIndex || idx}`,
        resultIndex: item.ResultIndex || String(idx),
        traceId: raw?.Response?.TraceId || raw?.TraceId || 'TR-FLIGHT',
        airline: seg.Airline?.AirlineName || item.AirlineName || 'IndiGo',
        airlineCode: seg.Airline?.AirlineCode || '6E',
        flightNumber: seg.Airline?.FlightNumber || `${seg.Airline?.AirlineCode || '6E'} ${1000 + idx}`,
        from: seg.Origin?.Airport?.AirportCode || searchContext.origin || 'DEL',
        fromName: seg.Origin?.Airport?.CityName || 'Delhi',
        to: seg.Destination?.Airport?.AirportCode || searchContext.destination || 'KUU',
        toName: seg.Destination?.Airport?.CityName || 'Kullu',
        departure: seg.Origin?.DepTime ? seg.Origin.DepTime.split('T')[1]?.slice(0, 5) : '09:20',
        arrival: seg.Destination?.ArrTime ? seg.Destination.ArrTime.split('T')[1]?.slice(0, 5) : '11:35',
        duration: seg.Duration ? `${Math.floor(seg.Duration / 60)}h ${seg.Duration % 60}m` : '2h 15m',
        cabin: seg.CabinClass === 4 ? 'Business' : seg.CabinClass === 3 ? 'Premium Economy' : 'Economy',
        fare: Math.round(fare.PublishedPrice || fare.OfferedFare || item.Price || 5500),
        tax: Math.round(fare.Tax || 650),
        baggage: seg.IncludedBaggage || '15 Kg',
        refundable: item.IsRefundable !== false
      });
    });
  }

  return results;
}

export async function searchFlights(params = {}, endUserIp = '127.0.0.1') {
  const payload = buildFlightSearchPayload(params, endUserIp);
  const raw = await callFlightSearch(payload);
  return mapFlightSearchResults(raw, params);
}
