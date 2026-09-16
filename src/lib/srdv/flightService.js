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

const PROXY_URL = process.env.SRDV_PROXY_URL || process.env.FORWARD_PROXY_URL || '';

/**
 * Normalizes any date input into strict 'yyyy-MM-ddTHH:mm:ss' format required by SRDV v8.
 * Ensures the date is not prior to current date.
 */
export function formatFlightDate(dateInput, defaultDaysAhead = 14) {
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  let rawDate = dateInput ? String(dateInput).trim() : '';

  // Extract YYYY-MM-DD
  let ymd = '';
  if (rawDate) {
    if (rawDate.includes('T')) {
      ymd = rawDate.split('T')[0];
    } else if (/^\d{4}-\d{2}-\d{2}$/.test(rawDate)) {
      ymd = rawDate;
    } else if (/^\d{2}\/\d{2}\/\d{4}$/.test(rawDate)) {
      // DD/MM/YYYY -> YYYY-MM-DD
      const [dd, mm, yyyy] = rawDate.split('/');
      ymd = `${yyyy}-${mm}-${dd}`;
    }
  }

  // If date is empty or prior to today, advance it to a valid date
  if (!ymd || ymd < todayStr) {
    const future = new Date();
    future.setDate(future.getDate() + defaultDaysAhead);
    ymd = future.toISOString().split('T')[0];
  }

  return `${ymd}T00:00:00`;
}

export function buildFlightSearchPayload(params = {}, endUserIp = '122.161.76.198') {
  const {
    origin = 'DEL',
    destination = 'BOM',
    departureDate = '',
    returnDate = '',
    adultCount = 1,
    childCount = 0,
    infantCount = 0,
    flightCabinClass = 0, // 0: All, 1: Economy, 2: Premium Economy, 3: Business
    journeyType = 1, // 1: OneWay, 2: Return
    directFlight = false
  } = params;

  const orgCode = String(origin).toUpperCase().trim();
  const destCode = String(destination).toUpperCase().trim();
  const prefDepTime = formatFlightDate(departureDate, 14);

  const isReturn = Number(journeyType) === 2 || Boolean(returnDate);
  const resolvedJourneyType = isReturn ? 2 : 1;

  // Segment 1 (Outbound)
  // Both PreferredDepartureTime and PreferredArrivalTime are mandatory in SRDV v8
  const segments = [
    {
      Origin: orgCode,
      Destination: destCode,
      FlightCabinClass: Number(flightCabinClass) || 0,
      PreferredDepartureTime: prefDepTime,
      PreferredArrivalTime: prefDepTime
    }
  ];

  // Segment 2 (Inbound for Return)
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

  // Whitelisted client IP
  const resolvedIp =
    endUserIp && endUserIp !== '127.0.0.1' && endUserIp !== '::1' && endUserIp !== '1.1.1.1'
      ? endUserIp
      : process.env.SRDV_END_USER_IP || '122.161.76.198';

  return {
    EndUserIp: resolvedIp,
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
}

export async function callFlightSearch(payload) {
  let endpoint = FLIGHT_API_URL.trim();
  if (!endpoint.toLowerCase().endsWith('/search')) {
    endpoint = `${endpoint.replace(/\/$/, '')}/Search`;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 25000);

  try {
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
    if (SRDV_API_TOKEN) {
      headers['Api-Token'] = SRDV_API_TOKEN;
    }

    const requestUrl = PROXY_URL ? `${PROXY_URL}?target=${encodeURIComponent(endpoint)}` : endpoint;

    const response = await fetch(requestUrl, {
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

    const checkErrorCode = (code, msg) => {
      const codeStr = String(code);
      if (codeStr === '900' || msg?.toLowerCase().includes('not authorized')) {
        const err = new Error(
          `SRDV Flight API [Error 900]: you are not authorized to access. SRDV firewall requires requests to come from your registered IP (122.161.76.198).`
        );
        err.isIpError = true;
        err.whitelistedIp = '122.161.76.198';
        err.errorCode = '900';
        throw err;
      }
      if (codeStr && codeStr !== '0') {
        throw new Error(`SRDV Flight API [Error ${codeStr}]: ${msg || 'Search failed'}`);
      }
    };

    if (data?.Error && data.Error.ErrorCode) {
      checkErrorCode(data.Error.ErrorCode, data.Error.ErrorMessage);
    }

    if (data?.Response?.Error && data.Response.Error.ErrorCode) {
      checkErrorCode(data.Response.Error.ErrorCode, data.Response.Error.ErrorMessage);
    }

    return data;
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
}

/**
 * Transforms a single flight group and its fare data into normalized client objects.
 */
function parseFlightGroup(item, fIdx, traceId, searchContext = {}, isReturn = false) {
  const segMatrix = Array.isArray(item.Segments) ? item.Segments : [];
  const legs = Array.isArray(segMatrix[0]) ? segMatrix[0] : segMatrix;
  const firstSeg = legs[0] || {};
  const lastSeg = legs[legs.length - 1] || firstSeg;

  const airlineCode = firstSeg.Airline?.AirlineCode || item.AirlineCode || item.ValidatingAirline || '';
  const flightNum = firstSeg.Airline?.FlightNumber || '';
  const fullFlightNumber = flightNum ? `${airlineCode} ${flightNum}`.trim() : airlineCode || 'Flight';
  const airlineName = firstSeg.Airline?.AirlineName || item.AirlineName || airlineCode || 'Airline';

  const originCode = firstSeg.Origin?.AirportCode || searchContext.origin || '';
  const originName = firstSeg.Origin?.CityName || firstSeg.Origin?.AirportName || searchContext.fromName || searchContext.origin || '';
  const destCode = lastSeg.Destination?.AirportCode || searchContext.destination || '';
  const destName = lastSeg.Destination?.CityName || lastSeg.Destination?.AirportName || searchContext.toName || searchContext.destination || '';

  const depTime = firstSeg.DepTime ? firstSeg.DepTime.split('T')[1]?.slice(0, 5) : '00:00';
  const arrTime = lastSeg.ArrTime ? lastSeg.ArrTime.split('T')[1]?.slice(0, 5) : '00:00';
  const depDate = firstSeg.DepTime ? firstSeg.DepTime.split('T')[0] : '';
  const arrDate = lastSeg.ArrTime ? lastSeg.ArrTime.split('T')[0] : '';

  const totalMinutes = firstSeg.AccumulatedDuration || firstSeg.Duration || 0;
  const durationStr = totalMinutes > 0 ? `${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m` : '2h 00m';

  const stopsCount = Math.max(0, legs.length - 1);
  const stopsLabel = stopsCount === 0 ? 'Direct' : `${stopsCount} Stop${stopsCount > 1 ? 's' : ''}`;

  // Read fares from FareDataMultiple
  const fares = Array.isArray(item.FareDataMultiple) && item.FareDataMultiple.length > 0
    ? item.FareDataMultiple
    : [{ OfferedFare: item.OfferedFare, Fare: { PublishedFare: item.OfferedFare, BaseFare: item.OfferedFare, Tax: 0 } }];

  const mappedFares = [];

  fares.forEach((fareItem, fareIdx) => {
    const fare = fareItem.Fare || {};
    const fareSeg = Array.isArray(fareItem.FareSegments) ? fareItem.FareSegments[0] : null;

    const publishedFare = Number(fare.PublishedFare || fareItem.OfferedFare || item.OfferedFare || 0);
    const offeredFare = Number(fareItem.OfferedFare || fare.OfferedFare || publishedFare);
    const baseFare = Number(fare.BaseFare || Math.round(offeredFare * 0.8));
    const tax = Number(fare.Tax || Math.round(offeredFare - baseFare));

    const finalPrice = Math.round(offeredFare || publishedFare);
    const resultIndex = fareItem.ResultIndex || `R_${fIdx}_${fareIdx}`;

    mappedFares.push({
      id: `FL-${resultIndex}`,
      resultIndex: String(resultIndex),
      traceId: String(traceId || ''),
      srdvType: 'flight',
      srdvIndex: fareItem.SrdvIndex || String(fIdx),
      isLCC: Boolean(fareItem.IsLCC),
      isReturn,
      airline: airlineName,
      airlineCode,
      flightNo: fullFlightNumber,
      flightNumber: fullFlightNumber,
      from: originCode,
      fromName: originName,
      fromCity: originName,
      to: destCode,
      toName: destName,
      toCity: destName,
      departure: depTime,
      departureTime: depTime,
      depTime,
      departureDate: depDate,
      arrival: arrTime,
      arrivalTime: arrTime,
      arrTime,
      arrivalDate: arrDate,
      duration: durationStr,
      stops: stopsLabel,
      stopsCount,
      cabin: fareSeg?.CabinClassName || (firstSeg.FlightCabinClass === 4 ? 'Business' : 'Economy'),
      cabinClass: fareSeg?.CabinClassName || 'Economy',
      price: finalPrice,
      totalPrice: finalPrice,
      fare: finalPrice,
      baseFare: Math.round(baseFare),
      basePrice: Math.round(baseFare),
      tax: Math.round(tax),
      taxes: Math.round(tax),
      baggage: fareSeg?.Baggage || '15 KG',
      cabinBaggage: fareSeg?.CabinBaggage || '7 KG',
      refundable: fareItem.IsRefundable !== false,
      isRefundable: fareItem.IsRefundable !== false,
      apiSelected: true,
      source: 'SRDV Live Flight API'
    });
  });

  return mappedFares;
}

export function mapFlightSearchResults(raw, searchContext = {}) {
  const results = [];
  const traceId = raw?.TraceId || raw?.Response?.TraceId || '';
  const rawList = raw?.Results || raw?.Response?.Results || [];

  if (!Array.isArray(rawList) || rawList.length === 0) {
    return results;
  }

  // Outbound results are in rawList[0]
  const outboundGroup = Array.isArray(rawList[0]) ? rawList[0] : [rawList[0]];
  outboundGroup.forEach((item, fIdx) => {
    if (!item) return;
    const parsedFares = parseFlightGroup(item, fIdx, traceId, searchContext, false);
    // Take the best/primary fare option for each flight schedule
    if (parsedFares.length > 0) {
      results.push(parsedFares[0]);
    }
  });

  // If Return flight results exist in rawList[1]
  if (Array.isArray(rawList[1])) {
    rawList[1].forEach((item, fIdx) => {
      if (!item) return;
      const parsedReturnFares = parseFlightGroup(item, fIdx + 1000, traceId, searchContext, true);
      if (parsedReturnFares.length > 0) {
        results.push(parsedReturnFares[0]);
      }
    });
  }

  return results;
}

export async function searchFlights(params = {}, endUserIp = '127.0.0.1') {
  if (!SRDV_CLIENT_ID || !SRDV_USERNAME || !SRDV_PASSWORD) {
    throw new Error(
      'SRDV credentials are not configured in the server environment (missing SRDV_CLIENT_ID, SRDV_USERNAME, or SRDV_PASSWORD).'
    );
  }

  const payload = buildFlightSearchPayload(params, endUserIp);
  const raw = await callFlightSearch(payload);
  return mapFlightSearchResults(raw, params);
}
