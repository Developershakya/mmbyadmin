/**
 * SRDV Flight Service (Flight API v8 REST)
 * Strictly connects to SRDV live/test endpoints.
 * ZERO mock or static fallback data.
 */

const FLIGHT_API_URL = process.env.SRDV_FLIGHT_URL || process.env.FLIGHT_API_URL || 'https://flight.srdvapi.com/v8/rest';
const SRDV_CLIENT_ID = process.env.SRDV_CLIENT_ID || '';
const SRDV_USERNAME = process.env.SRDV_USERNAME || '';
const SRDV_PASSWORD = process.env.SRDV_PASSWORD || '';
const SRDV_API_TOKEN = process.env.SRDV_API_TOKEN || '';

export function buildFlightSearchPayload(params = {}, endUserIp = '127.0.0.1') {
  const {
    origin = 'DEL',
    destination = 'KUU',
    departureDate = '',
    returnDate = '',
    adultCount = 1,
    childCount = 0,
    infantCount = 0,
    flightCabinClass = 1, // 1: All, 2: Economy, 3: PremiumEconomy, 4: Business
    journeyType = 1, // 1: OneWay, 2: Return
    directFlight = false
  } = params;

  // Format date to ISO without timezone shift if date string provided
  let formattedDate = departureDate;
  if (!formattedDate) {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    formattedDate = d.toISOString().split('T')[0];
  }
  const prefDepTime = formattedDate.includes('T') ? formattedDate : `${formattedDate}T00:00:00`;

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
    EndUserIp: process.env.SRDV_END_USER_IP || endUserIp || '127.0.0.1',
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
  let endpoint = FLIGHT_API_URL.trim();
  if (!endpoint.toLowerCase().endsWith('/search')) {
    endpoint = `${endpoint.replace(/\/$/, '')}/Search`;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 12000);

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
      throw new Error(`SRDV Flight API returned HTTP ${response.status} (${response.statusText})`);
    }

    const data = await response.json();

    // Check top-level Error object
    if (data?.Error && data.Error.ErrorCode && data.Error.ErrorCode !== '0' && data.Error.ErrorCode !== 0) {
      throw new Error(`SRDV Flight API [Error ${data.Error.ErrorCode}]: ${data.Error.ErrorMessage || 'Search failed'}`);
    }

    // Check nested Response.Error object
    if (data?.Response?.Error && data.Response.Error.ErrorCode && data.Response.Error.ErrorCode !== '0' && data.Response.Error.ErrorCode !== 0) {
      throw new Error(`SRDV Flight API [Error ${data.Response.Error.ErrorCode}]: ${data.Response.Error.ErrorMessage || 'Search failed'}`);
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
      const segGroup = Array.isArray(item.Segments) ? (Array.isArray(item.Segments[0]) ? item.Segments[0] : item.Segments) : [];
      const seg = segGroup[0] || {};
      const fare = item.Fare || {};
      const airlineCode = seg.Airline?.AirlineCode || item.AirlineCode || '';
      const flightNum = seg.Airline?.FlightNumber || item.FlightNumber || '';
      const fullFlightNumber = flightNum ? `${airlineCode} ${flightNum}`.trim() : airlineCode;

      results.push({
        id: `FL-${item.ResultIndex || idx}`,
        resultIndex: String(item.ResultIndex ?? idx),
        traceId: raw?.Response?.TraceId || raw?.TraceId || '',
        srdvType: 'flight',
        srdvIndex: item.ResultIndex ?? idx,
        isLCC: Boolean(item.IsLCC),
        airline: seg.Airline?.AirlineName || item.AirlineName || airlineCode || 'Airline',
        airlineCode: airlineCode,
        flightNumber: fullFlightNumber || 'Flight',
        from: seg.Origin?.Airport?.AirportCode || searchContext.origin || '',
        fromName: seg.Origin?.Airport?.CityName || seg.Origin?.Airport?.AirportName || searchContext.fromName || searchContext.origin || '',
        to: seg.Destination?.Airport?.AirportCode || searchContext.destination || '',
        toName: seg.Destination?.Airport?.CityName || seg.Destination?.Airport?.AirportName || searchContext.toName || searchContext.destination || '',
        departure: seg.Origin?.DepTime ? seg.Origin.DepTime.split('T')[1]?.slice(0, 5) : '',
        arrival: seg.Destination?.ArrTime ? seg.Destination.ArrTime.split('T')[1]?.slice(0, 5) : '',
        duration: seg.Duration ? `${Math.floor(seg.Duration / 60)}h ${seg.Duration % 60}m` : '',
        cabin: seg.CabinClass === 4 ? 'Business' : seg.CabinClass === 3 ? 'Premium Economy' : 'Economy',
        fare: Math.round(fare.PublishedPrice || fare.OfferedFare || item.Price || 0),
        tax: Math.round(fare.Tax || 0),
        baseFare: Math.round(fare.BaseFare || 0),
        baggage: seg.IncludedBaggage || '15 Kg',
        refundable: item.IsRefundable !== false,
        apiSelected: true
      });
    });
  }

  // Pure zero-fallback: empty array if no live results from upstream
  return results;
}

export async function searchFlights(params = {}, endUserIp = '127.0.0.1') {
  if (!SRDV_CLIENT_ID || !SRDV_USERNAME || !SRDV_PASSWORD) {
    throw new Error('SRDV credentials are not configured in the server environment (missing SRDV_CLIENT_ID, SRDV_USERNAME, or SRDV_PASSWORD).');
  }

  const payload = buildFlightSearchPayload(params, endUserIp);
  const raw = await callFlightSearch(payload);
  return mapFlightSearchResults(raw, params);
}
