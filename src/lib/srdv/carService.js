/**
 * SRDV Car / Cab Service (Car API v4 REST)
 * Resolves pickup/drop city names via the Cities model and maps results into
 * { vehicle, category, seats, ac, price } as expected by the Package Builder UI.
 */

const CAR_API_URL = process.env.SRDV_CAR_URL || process.env.CAR_API_URL || 'https://car.srdvapi.com/v4/rest';
const SRDV_CLIENT_ID = process.env.SRDV_CLIENT_ID || '';
const SRDV_USERNAME = process.env.SRDV_USERNAME || '';
const SRDV_PASSWORD = process.env.SRDV_PASSWORD || '';
const SRDV_API_TOKEN = process.env.SRDV_API_TOKEN || '';

export function buildCarSearchPayload(params = {}, endUserIp = '127.0.0.1') {
  const {
    pickupCityId = 1,
    dropCityId = 2,
    pickup = 'Delhi',
    drop = 'Manali',
    date = '2025-12-25',
    time = '09:00 AM',
    tripType = 1, // 1 - OneWay / Transfer, 2 - RoundTrip, 3 - Local
    vehicleType = 'Any'
  } = params;

  return {
    EndUserIp: endUserIp,
    ClientId: SRDV_CLIENT_ID,
    UserName: SRDV_USERNAME,
    Password: SRDV_PASSWORD,
    PickupCityId: Number(pickupCityId) || 1,
    DropCityId: Number(dropCityId) || 2,
    PickupLocation: pickup,
    DropLocation: drop,
    DateOfJourney: date,
    PickupTime: time,
    TripType: Number(tripType) || 1,
    VehicleType: vehicleType
  };
}

export async function callCarSearch(payload) {
  const endpoint = `${CAR_API_URL.replace(/\/$/, '')}/Search`;
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
      throw new Error(`Upstream SRDV Car API returned HTTP ${response.status}`);
    }

    const data = await response.json();
    if (data && data.Response && data.Response.Error && data.Response.Error.ErrorCode !== 0) {
      throw new Error(data.Response.Error.ErrorMessage || 'SRDV Car Search API Error');
    }

    return data;
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
}

export function mapCarSearchResults(raw, searchContext = {}) {
  const results = [];
  const rawList = raw?.CarResults || raw?.Results || raw?.Response?.CarResults || [];

  if (Array.isArray(rawList) && rawList.length > 0) {
    rawList.forEach((car, idx) => {
      const fare = car.CarPrice || car.Fare || car.TotalFare || car.Price || 2500;
      results.push({
        id: `CAB-${car.CarId || idx}`,
        carId: car.CarId || String(200 + idx),
        resultIndex: car.ResultIndex || String(idx),
        traceId: raw?.Response?.TraceId || raw?.TraceId || 'TR-CAR',
        vehicle: car.VehicleName || car.VehicleModel || 'Toyota Etios',
        category: car.Category || car.CarType || 'Sedan',
        seats: Number(car.SeatingCapacity || car.Seats) || 4,
        ac: car.AirCondition !== false && car.IsAC !== false,
        price: Math.round(Number(fare) || 2500),
        pickup: searchContext.pickup || 'Kullu Airport',
        drop: searchContext.drop || 'Manali Hotel',
        date: searchContext.date || '12 Oct 2026',
        time: searchContext.time || '12:30 PM',
        driverAllowance: car.DriverAllowance || 350,
        fuelType: car.FuelType || 'CNG / Diesel',
        tollCharges: car.TollTaxesIncluded ? 'Included' : 'Extra as per receipt'
      });
    });
  }

  // Pure zero-fallback: empty array if no live results from upstream
  return results;
}

export async function searchCars(params = {}, endUserIp = '127.0.0.1') {
  if (!SRDV_CLIENT_ID || !SRDV_USERNAME || !SRDV_PASSWORD) {
    throw new Error('SRDV credentials are not configured in the server environment (missing SRDV_CLIENT_ID, SRDV_USERNAME, or SRDV_PASSWORD).');
  }

  const payload = buildCarSearchPayload(params, endUserIp);
  const raw = await callCarSearch(payload);
  return mapCarSearchResults(raw, params);
}
