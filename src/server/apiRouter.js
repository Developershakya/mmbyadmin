import express from 'express';
import { Op } from 'sequelize';
import {
  initDb,
  sequelize,
  AirportList,
  Cities,
  Sightseeing,
  Hotel,
  Bus,
  Package,
  BlogCategory,
  Blog,
  TravelSearchSession,
  PackageServiceItem,
  ServiceApiLog,
  Payment,
  FlightBooking,
  HotelBooking,
  BusBooking,
  CarBooking
} from '../models/index.js';
import { searchFlights } from '../lib/srdv/flightService.js';
import { searchBuses } from '../lib/srdv/busService.js';
import { searchCars } from '../lib/srdv/carService.js';
import { searchHotels } from '../lib/srdv/hotelService.js';
import { generateNormalizedFallbackFlights } from './srdvService.js';
import { searchRouteLocations, getRouteDirections } from './routeService.js';

import { flightProvider } from './providers/flightProvider.js';
import { hotelProvider } from './providers/hotelProvider.js';
import { busProvider } from './providers/busProvider.js';
import { carProvider } from './providers/carProvider.js';
import { createPaymentOrder, verifyPaymentSignature, getRazorpayKeyId, generateTestSignature } from './paymentService.js';
import {
  generateFlightTicketHtml,
  generateHotelVoucherHtml,
  generateBusTicketHtml,
  generateCarVoucherHtml
} from './documentService.js';

const router = express.Router();

// Outbound IP cache to prevent redundant external calls
let cachedOutboundIp = '34.34.254.22';
let lastOutboundIpCheck = 0;

async function getOutboundIp() {
  const now = Date.now();
  if (now - lastOutboundIpCheck < 60000 && cachedOutboundIp) {
    return cachedOutboundIp;
  }
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2500);
    const res = await fetch('https://api.ipify.org?format=json', { signal: controller.signal });
    clearTimeout(timeout);
    if (res.ok) {
      const data = await res.json();
      if (data?.ip) {
        cachedOutboundIp = data.ip;
        lastOutboundIpCheck = now;
        return cachedOutboundIp;
      }
    }
  } catch (e) {
    // fallback to cached
  }
  return cachedOutboundIp;
}

// Ensure in-memory database is initialized
let dbInitialized = false;
async function ensureDb() {
  if (!dbInitialized) {
    await initDb();
    dbInitialized = true;
  }
}

const DEVTUNNEL_BASE = 'https://mdrhbldj-3000.inc1.devtunnels.ms';

async function fetchFromDevtunnel(endpointPath, query) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3500);
    const url = `${DEVTUNNEL_BASE}${endpointPath}?query=${encodeURIComponent(query)}`;
    const resp = await fetch(url, {
      headers: {
        'X-Tunnel-Skip-Anti-Phishing-Page': 'true',
        'User-Agent': 'TravelPro/1.0'
      },
      signal: controller.signal
    });
    clearTimeout(timeout);
    if (resp.ok) {
      const data = await resp.json();
      if (Array.isArray(data)) return data;
      if (data && Array.isArray(data.results)) return data.results;
      if (data && Array.isArray(data.data)) return data.data;
    }
  } catch (err) {
    // Fall back silently to local SQLite database
  }
  return null;
}

/* =========================================================================
   TASK 4: DB-BACKED & DEVTUNNEL PROXY AUTOCOMPLETE SUGGESTION ENDPOINTS
   Endpoints requested by user:
   - /api/cities/bus?query=...
   - /api/cities/hotel?query=...
   - /api/cities/airports?query=...
   - /api/cities/cab?query=...
   ========================================================================= */

// 1. Airports / Flight Suggestions
router.get(['/cities/airports', '/airports/suggest'], async (req, res) => {
  try {
    const q = (req.query.query || req.query.q || '').trim();
    if (!q || q.length < 2) {
      return res.json([]);
    }

    // Try live devtunnel proxy first
    const remote = await fetchFromDevtunnel('/api/cities/airports', q);
    if (remote && remote.length > 0) {
      // Return raw array directly as requested by devtunnel API
      return res.json(remote);
    }

    // Fallback to local SQLite database
    await ensureDb();
    const likeOp = Op.iLike || Op.like;
    const airports = await AirportList.findAll({
      where: {
        [Op.or]: [
          { airport_code: { [likeOp]: `%${q}%` } },
          { airport_city_name: { [likeOp]: `%${q}%` } },
          { airport_name: { [likeOp]: `%${q}%` } }
        ]
      },
      limit: 8,
      order: [['airport_city_name', 'ASC']]
    });

    const results = airports.map(a => ({
      airport_city_name: a.airport_city_name,
      airport_name: a.airport_name,
      airport_code: a.airport_code,
      id: a.airport_id,
      code: a.airport_code,
      label: a.airport_city_name,
      subLabel: a.airport_name
    }));

    res.json(results);
  } catch (err) {
    console.error('Airports suggest error:', err);
    res.status(500).json([]);
  }
});

// 2. Bus Cities Suggestions
router.get(['/cities/bus', '/buses/suggest'], async (req, res) => {
  try {
    const q = (req.query.query || req.query.q || '').trim();
    if (!q || q.length < 2) {
      return res.json([]);
    }

    // Try live devtunnel proxy first
    const remote = await fetchFromDevtunnel('/api/cities/bus', q);
    if (remote && remote.length > 0) {
      return res.json(remote);
    }

    await ensureDb();
    const likeOp = Op.iLike || Op.like;
    const buses = await Bus.findAll({
      where: {
        CityName: { [likeOp]: `%${q}%` }
      },
      limit: 8,
      order: [['CityName', 'ASC']]
    });

    const results = buses.map(b => ({
      cityid: b.CityId,
      Destination: b.CityName,
      country: '',
      id: b.CityId,
      code: String(b.CityId),
      label: b.CityName,
      subLabel: 'Bus Terminal / City'
    }));

    res.json(results);
  } catch (err) {
    console.error('Buses suggest error:', err);
    res.status(500).json([]);
  }
});

// 3. Hotel Destinations Suggestions
router.get(['/cities/hotel', '/hotels/suggest'], async (req, res) => {
  try {
    const q = (req.query.query || req.query.q || '').trim();
    if (!q || q.length < 2) {
      return res.json([]);
    }

    // Try live devtunnel proxy first
    const remote = await fetchFromDevtunnel('/api/cities/hotel', q);
    if (remote && remote.length > 0) {
      return res.json(remote);
    }

    await ensureDb();
    const likeOp = Op.iLike || Op.like;
    const hotels = await Hotel.findAll({
      where: {
        Destination: { [likeOp]: `%${q}%` },
        status: 'Active'
      },
      limit: 8,
      order: [['Destination', 'ASC']]
    });

    const seen = new Set();
    const results = [];
    for (const h of hotels) {
      if (!seen.has(h.Destination)) {
        seen.add(h.Destination);
        results.push({
          cityid: String(h.cityid || h.id),
          Destination: h.Destination,
          country: h.country || 'India',
          id: h.cityid || h.id,
          code: h.cityid,
          label: h.Destination,
          subLabel: h.country || 'Hotel Destination'
        });
      }
    }

    res.json(results);
  } catch (err) {
    console.error('Hotels suggest error:', err);
    res.status(500).json([]);
  }
});

// 4. Cab & Package Destination Cities Suggestions
router.get(['/cities/cab', '/cars/suggest'], async (req, res) => {
  try {
    const q = (req.query.query || req.query.q || '').trim();
    if (!q || q.length < 2) {
      return res.json([]);
    }

    // Try live devtunnel proxy first
    const remote = await fetchFromDevtunnel('/api/cities/cab', q);
    if (remote && remote.length > 0) {
      return res.json(remote);
    }

    await ensureDb();
    const likeOp = Op.iLike || Op.like;
    const cities = await Cities.findAll({
      where: {
        city_name: { [likeOp]: `%${q}%` }
      },
      limit: 8,
      order: [['city_name', 'ASC']]
    });

    const results = cities.map(c => ({
      cityid: c.id,
      Destination: c.city_name,
      country: c.state_id || 5,
      id: c.id,
      code: String(c.id),
      label: c.city_name,
      subLabel: 'City / Cab Destination'
    }));

    res.json(results);
  } catch (err) {
    console.error('Cars suggest error:', err);
    res.status(500).json([]);
  }
});

/* =========================================================================
   SEARCH ROUTE HANDLERS
   ========================================================================= */

// SRDV Diagnostics and IP Status
router.get(['/srdv/status', '/srdv/diagnostics', '/srdv/ip-check'], async (req, res) => {
  try {
    const outboundIp = await getOutboundIp();
    const forwarded = req.headers['x-forwarded-for'];
    const clientIp = (forwarded ? forwarded.split(',')[0].trim() : req.ip) || '122.161.76.198';
    const whitelistedIp = '122.161.76.198';
    const srdvHost = 'flight.srdvapi.com';
    const srdvHostIp = '13.233.211.114';
    const clientId = process.env.SRDV_CLIENT_ID || '180189';
    const userName = process.env.SRDV_USERNAME || 'MakeMy91';
    const isIpWhitelistedOnServer = outboundIp === whitelistedIp;

    const emailTemplate = `Subject: Request to Whitelist Server IP for Client ID: ${clientId} (${userName})

Dear SRDV Support Team,

Please whitelist our application server IP address in your firewall for our account credentials:
- Client ID: ${clientId}
- Username: ${userName}
- Server Outbound IP to Whitelist: ${outboundIp}
- Registered Office IP: ${whitelistedIp}

Currently, our API calls are returning: "Error 900: you are not authorized to access" because our cloud server outbound IP (${outboundIp}) needs to be added to the account whitelist.

Kindly confirm once updated.

Thank you,
Team ${userName}`;

    res.json({
      success: true,
      data: {
        serverOutboundIp: outboundIp,
        clientIp,
        whitelistedIp,
        srdvHost,
        srdvHostIp,
        clientId,
        userName,
        isIpAuthorized: isIpWhitelistedOnServer,
        srdvError: isIpWhitelistedOnServer
          ? null
          : `SRDV API Error 900: Server IP ${outboundIp} is not in SRDV account whitelist (registered IP: ${whitelistedIp})`,
        emailTemplate
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Flights Search
router.post(['/flights/search', '/package-services/flights/search'], async (req, res) => {
  try {
    const { origin, destination, allowFallback } = req.body || {};
    if (!origin || !destination) {
      return res.status(400).json({
        success: false,
        error: 'Both origin and destination airport codes/names are required.'
      });
    }

    const forwarded = req.headers['x-forwarded-for'];
    const endUserIp = (forwarded ? forwarded.split(',')[0].trim() : req.ip) || '122.161.76.198';

    try {
      const results = await searchFlights(req.body, endUserIp);
      return res.json({
        success: true,
        total: results.length,
        results,
        flights: results,
        source: 'SRDV_LIVE_API'
      });
    } catch (liveErr) {
      const isIpError =
        liveErr.isIpError ||
        liveErr.message?.includes('Error 900') ||
        liveErr.message?.includes('not authorized');

      // If client explicitly permitted fallback when live API is blocked by IP whitelist:
      if (allowFallback) {
        const fallback = generateNormalizedFallbackFlights({
          origin,
          destination,
          departureDate: req.body.departureDate,
          cabinClass: req.body.flightCabinClass,
          adults: req.body.adultCount
        });
        return res.json({
          success: true,
          isFallback: true,
          fallbackReason: liveErr.message,
          total: fallback.flights?.length || 0,
          results: fallback.flights || [],
          flights: fallback.flights || []
        });
      }

      // Re-throw to be caught and formatted
      const errorToThrow = new Error(liveErr.message);
      errorToThrow.isIpError = isIpError;
      throw errorToThrow;
    }
  } catch (err) {
    console.error('Flight search error:', err);
    const outboundIp = await getOutboundIp();
    res.status(500).json({
      success: false,
      error: err.message,
      isIpError: Boolean(err.isIpError || err.message?.includes('Error 900')),
      whitelistedIp: '122.161.76.198',
      serverOutboundIp: outboundIp
    });
  }
});

// Task 1: Bus Search
router.post(['/buses/search', '/package-services/buses/search'], async (req, res) => {
  try {
    await ensureDb();
    const body = req.body || {};
    const from = body.from || body.fromCity || body.sourceCity;
    const to = body.to || body.toCity || body.destinationCity;

    if (!from || !to) {
      return res.status(400).json({
        success: false,
        error: 'Both from and to locations are required.'
      });
    }

    // Resolve city names to CityId via Bus model if not already provided
    let sourceCode = body.sourceCode || body.sourceId;
    let destinationCode = body.destinationCode || body.destinationId;

    if (!sourceCode) {
      const busFrom = await Bus.findOne({
        where: { CityName: { [Op.like]: `%${from}%` } }
      });
      if (busFrom) sourceCode = busFrom.CityId;
    }

    if (!destinationCode) {
      const busTo = await Bus.findOne({
        where: { CityName: { [Op.like]: `%${to}%` } }
      });
      if (busTo) destinationCode = busTo.CityId;
    }

    const params = {
      ...body,
      sourceCode,
      destinationCode,
      sourceCity: from,
      destinationCity: to,
      fromCity: from,
      toCity: to,
      date: body.date || body.dateOfJourney || body.departDate
    };

    const results = await searchBuses(params);

    res.json({
      success: true,
      total: results.length,
      results,
      buses: results
    });
  } catch (err) {
    console.error('Bus search error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Task 2: Car / Cab Search
router.post(['/cars/search', '/cabs/search', '/package-services/cabs/search'], async (req, res) => {
  try {
    await ensureDb();
    const body = req.body || {};
    const pickup = body.pickup || body.fromCity;
    const drop = body.drop || body.toCity;

    if (!pickup) {
      return res.status(400).json({
        success: false,
        error: 'Pickup location is required.'
      });
    }

    // Resolve pickup/drop city names via Cities model
    let pickupCityId = body.pickupCityId;
    let dropCityId = body.dropCityId;

    if (!pickupCityId && pickup) {
      const city = await Cities.findOne({
        where: { city_name: { [Op.like]: `%${pickup.split(' ')[0]}%` } }
      });
      pickupCityId = city ? city.id : 1;
    }

    if (!dropCityId && drop) {
      const city = await Cities.findOne({
        where: { city_name: { [Op.like]: `%${drop.split(' ')[0]}%` } }
      });
      dropCityId = city ? city.id : 2;
    }

    const endUserIp = req.ip || req.headers['x-forwarded-for'] || '127.0.0.1';
    const params = {
      ...body,
      pickupCityId: pickupCityId || 1,
      dropCityId: dropCityId || 2,
      pickup,
      drop: drop || pickup
    };

    const results = await searchCars(params, endUserIp);

    res.json({
      success: true,
      total: results.length,
      results,
      cabs: results
    });
  } catch (err) {
    console.error('Car search error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Task 3: Hotel Search
router.post(['/hotels/search', '/package-services/hotels/search'], async (req, res) => {
  try {
    await ensureDb();
    const body = req.body || {};
    const destination = body.destination || body.city;

    if (!destination) {
      return res.status(400).json({
        success: false,
        error: 'Destination is required for hotel search.'
      });
    }

    // Resolve destination via Hotel model where status = 'Active'
    let cityId = body.cityId;
    if (!cityId) {
      const hotelMatch = await Hotel.findOne({
        where: {
          Destination: { [Op.like]: `%${destination}%` },
          status: 'Active'
        }
      });

      if (hotelMatch) {
        cityId = hotelMatch.cityid;
      }
    }

    const forwarded = req.headers['x-forwarded-for'];
    const endUserIp = (forwarded ? forwarded.split(',')[0].trim() : req.ip) || '122.161.76.198';
    const params = {
      ...body,
      cityId: cityId || body.cityId,
      destination
    };

    const results = await searchHotels(params, endUserIp);

    res.json({
      success: true,
      total: results.length,
      results,
      hotels: results
    });
  } catch (err) {
    console.error('Hotel search error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/* =========================================================================
   MASTER CATALOG & UTILITY ENDPOINTS
   ========================================================================= */

/* =========================================================================
   SIGHTSEEING CATALOG & MANAGEMENT CRUD ENDPOINTS
   ========================================================================= */

// Helper: Format Sightseeing response object
function formatSightseeingResponse(s) {
  const json = typeof s.toJSON === 'function' ? s.toJSON() : s;
  return {
    id: json.id,
    name: json.name,
    slug: json.slug || `${(json.name || 'place').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')}-${json.id}`,
    city: json.city || json.cityName || '',
    cityName: json.cityName || json.city || '',
    state: json.state || '',
    country: json.country || 'India',
    location: json.location || '',
    latitude: json.latitude || null,
    longitude: json.longitude || null,
    image: json.image || 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?w=800&auto=format&fit=crop&q=80',
    gallery: Array.isArray(json.gallery) ? json.gallery : (json.gallery ? [json.gallery] : []),
    shortDescription: json.shortDescription || (json.description || json.masterDescription || '').slice(0, 180),
    description: json.description || json.masterDescription || '',
    masterDescription: json.masterDescription || json.description || '',
    duration: json.duration || '2 - 3 Hours',
    bestTimeToVisit: json.bestTimeToVisit || 'October to March',
    entryFee: json.entryFee || 'Free Entry',
    openingTime: json.openingTime || '09:00 AM',
    closingTime: json.closingTime || '06:00 PM',
    category: json.category || 'Monument & Heritage',
    status: json.status || 'Active',
    createdAt: json.createdAt,
    updatedAt: json.updatedAt
  };
}

// Helper: Ensure unique slug for Sightseeing
async function ensureUniqueSightseeingSlug(desiredSlug, currentId = null) {
  let slug = (desiredSlug || 'sightseeing-place')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
  if (!slug) slug = 'sightseeing-place';

  let candidate = slug;
  let counter = 1;
  while (true) {
    const existing = await Sightseeing.findOne({
      where: {
        slug: candidate,
        ...(currentId ? { id: { [Op.ne]: currentId } } : {})
      }
    });
    if (!existing) return candidate;
    counter++;
    candidate = `${slug}-${counter}`;
  }
}

// Helper: Check reference safety before deleting
async function checkSightseeingReferences(place) {
  let count = 0;
  const references = [];
  try {
    const allPackages = await Package.findAll();
    for (const pkg of allPackages) {
      const list = pkg.sightseeingList || [];
      const hasDirect = list.some(item => 
        (item && item.id && String(item.id) === String(place.id)) ||
        (item && item.name && item.name.toLowerCase() === place.name.toLowerCase())
      );
      if (hasDirect) {
        count++;
        references.push(`Package: ${pkg.packageName || pkg.name || `ID #${pkg.id}`}`);
      }
    }
  } catch (err) {
    console.warn('Error checking package references:', err.message);
  }

  try {
    const allBlogs = await Blog.findAll();
    for (const b of allBlogs) {
      const placesExplored = Array.isArray(b.placesExplored) ? b.placesExplored : [];
      const placesCovered = Array.isArray(b.placesCovered) ? b.placesCovered : [];
      const hasExplored = placesExplored.some(p => 
        (p && p.name && p.name.toLowerCase() === place.name.toLowerCase()) ||
        (p && p.id && String(p.id) === String(place.id))
      );
      const hasCovered = placesCovered.some(p => 
        (p && p.name && p.name.toLowerCase() === place.name.toLowerCase()) ||
        (p && p.id && String(p.id) === String(place.id))
      );
      if (hasExplored || hasCovered) {
        count++;
        references.push(`Blog: ${b.title || b.slug}`);
      }
    }
  } catch (err) {
    console.warn('Error checking blog references:', err.message);
  }

  return { isReferenced: count > 0, count, references };
}

// 1. Sightseeing Master Search (Public suggestions - strictly Active places)
router.get('/sightseeing/search', async (req, res) => {
  try {
    await ensureDb();
    const city = (req.query.city || '').trim();
    const q = (req.query.q || '').trim();

    const conditions = [];
    // Only return Active places for public suggestions
    conditions.push({
      [Op.or]: [
        { status: 'Active' },
        { status: null }
      ]
    });

    if (city && city !== 'ALL') {
      conditions.push({
        [Op.or]: [
          { cityName: { [Op.like]: `%${city}%` } },
          { city: { [Op.like]: `%${city}%` } }
        ]
      });
    }
    if (q) {
      conditions.push({
        [Op.or]: [
          { name: { [Op.like]: `%${q}%` } },
          { cityName: { [Op.like]: `%${q}%` } },
          { city: { [Op.like]: `%${q}%` } },
          { state: { [Op.like]: `%${q}%` } },
          { masterDescription: { [Op.like]: `%${q}%` } },
          { description: { [Op.like]: `%${q}%` } },
          { location: { [Op.like]: `%${q}%` } },
          { category: { [Op.like]: `%${q}%` } }
        ]
      });
    }

    const where = { [Op.and]: conditions };
    const items = await Sightseeing.findAll({
      where,
      order: [['name', 'ASC']]
    });

    res.json({
      success: true,
      total: items.length,
      sightseeing: items.map(s => ({
        id: s.id,
        name: s.name,
        slug: s.slug,
        city: s.city || s.cityName,
        cityName: s.cityName || s.city,
        state: s.state,
        location: s.location,
        latitude: s.latitude,
        longitude: s.longitude,
        image: s.image,
        masterDescription: s.masterDescription || s.description,
        description: s.description || s.masterDescription,
        shortDescription: s.shortDescription,
        packageDescriptionOverride: s.masterDescription || s.description,
        duration: s.duration,
        category: s.category,
        bestTimeToVisit: s.bestTimeToVisit,
        entryFee: s.entryFee,
        openingTime: s.openingTime,
        closingTime: s.closingTime,
        status: s.status,
        included: true
      }))
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Location Geocoding & Coordinates API (Google Maps API + High Precision Maps Geocoder)
router.get('/places/geocode', async (req, res) => {
  try {
    const q = (req.query.q || '').trim();
    const lat = req.query.lat;
    const lng = req.query.lng;

    if (!q && (!lat || !lng)) {
      return res.status(400).json({ success: false, error: 'Query (q) or coordinates (lat, lng) required' });
    }

    const apiKey = process.env.GOOGLE_MAPS_API_KEY || process.env.VITE_GOOGLE_MAPS_API_KEY;

    // 1. Try Google Maps Geocoding API if key is available
    if (apiKey) {
      try {
        const googleUrl = q 
          ? `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(q)}&key=${apiKey}`
          : `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`;
        
        const gRes = await fetch(googleUrl);
        const gData = await gRes.json();

        if (gData.status === 'OK' && Array.isArray(gData.results) && gData.results.length > 0) {
          const results = gData.results.map(item => {
            const comps = item.address_components || [];
            const getComp = (types) => {
              const c = comps.find(comp => types.some(t => comp.types.includes(t)));
              return c ? c.long_name : '';
            };

            const city = getComp(['locality', 'sublocality_level_1', 'administrative_area_level_2', 'postal_town']) || '';
            const state = getComp(['administrative_area_level_1']) || '';
            const country = getComp(['country']) || 'India';
            const location = item.formatted_address || '';
            const latitude = item.geometry?.location?.lat;
            const longitude = item.geometry?.location?.lng;

            return {
              name: comps[0]?.long_name || q,
              city,
              state,
              country,
              location,
              latitude: typeof latitude === 'number' ? Number(latitude.toFixed(6)) : parseFloat(latitude),
              longitude: typeof longitude === 'number' ? Number(longitude.toFixed(6)) : parseFloat(longitude),
              source: 'google'
            };
          });

          return res.json({ success: true, provider: 'google', results });
        }
      } catch (gErr) {
        console.warn('Google geocoding error, falling back to geocoder:', gErr.message);
      }
    }

    // 2. High-precision Geocoder fallback (Photon based on OpenStreetMap)
    if (q) {
      const photonUrl = `https://photon.komoot.io/api/?q=${encodeURIComponent(q)}&limit=8`;
      const pRes = await fetch(photonUrl, {
        headers: { 'Accept': 'application/json' }
      });
      const pData = await pRes.json();

      if (pData && Array.isArray(pData.features) && pData.features.length > 0) {
        const results = pData.features.map(f => {
          const props = f.properties || {};
          const geom = f.geometry || {};
          const coords = Array.isArray(geom.coordinates) ? geom.coordinates : [0, 0];
          const lon = coords[0];
          const lat = coords[1];

          const name = props.name || q;
          const city = props.city || props.district || props.county || props.locality || props.state || '';
          const state = props.state || '';
          const country = props.country || 'India';

          const addrParts = [
            props.name,
            props.street,
            props.locality,
            props.district && props.district !== props.city ? props.district : null,
            props.city,
            props.state,
            props.postcode,
            props.country
          ].filter(Boolean);

          const uniqueParts = addrParts.filter((item, idx) => addrParts.indexOf(item) === idx);
          const location = uniqueParts.join(', ');

          return {
            name,
            city,
            state,
            country,
            location,
            latitude: Number(lat.toFixed(6)),
            longitude: Number(lon.toFixed(6)),
            source: 'maps'
          };
        });

        return res.json({ success: true, provider: 'maps', results });
      }
    }

    return res.json({ success: true, results: [] });
  } catch (err) {
    console.error('Geocode route error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 2. Sightseeing Full List (Admin CRUD with search & filters)
router.get('/sightseeing', async (req, res) => {
  try {
    await ensureDb();
    const search = (req.query.search || req.query.q || '').trim();
    const city = (req.query.city || '').trim();
    const state = (req.query.state || '').trim();
    const category = (req.query.category || '').trim();
    const status = (req.query.status || '').trim();

    const conditions = [];

    if (status && status !== 'ALL') {
      conditions.push({ status });
    }

    if (city && city !== 'ALL') {
      conditions.push({
        [Op.or]: [
          { city: { [Op.like]: `%${city}%` } },
          { cityName: { [Op.like]: `%${city}%` } }
        ]
      });
    }

    if (state && state !== 'ALL') {
      conditions.push({
        state: { [Op.like]: `%${state}%` }
      });
    }

    if (category && category !== 'ALL') {
      conditions.push({
        category: { [Op.like]: `%${category}%` }
      });
    }

    if (search) {
      conditions.push({
        [Op.or]: [
          { name: { [Op.like]: `%${search}%` } },
          { city: { [Op.like]: `%${search}%` } },
          { cityName: { [Op.like]: `%${search}%` } },
          { state: { [Op.like]: `%${search}%` } },
          { category: { [Op.like]: `%${search}%` } },
          { location: { [Op.like]: `%${search}%` } },
          { slug: { [Op.like]: `%${search}%` } }
        ]
      });
    }

    const where = conditions.length > 0 ? { [Op.and]: conditions } : {};

    const items = await Sightseeing.findAll({
      where,
      order: [['createdAt', 'DESC'], ['id', 'DESC']]
    });

    res.json({
      success: true,
      count: items.length,
      sightseeing: items.map(formatSightseeingResponse)
    });
  } catch (err) {
    console.error('Error fetching sightseeing list:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 3. Sightseeing Details by ID or Slug
router.get('/sightseeing/:id', async (req, res) => {
  try {
    await ensureDb();
    const { id } = req.params;
    let place = null;

    if (/^\d+$/.test(id)) {
      place = await Sightseeing.findByPk(parseInt(id, 10));
    }
    if (!place) {
      place = await Sightseeing.findOne({ where: { slug: id } });
    }

    if (!place) {
      return res.status(404).json({ success: false, error: 'Sightseeing place not found.' });
    }

    res.json({
      success: true,
      sightseeing: formatSightseeingResponse(place)
    });
  } catch (err) {
    console.error('Error fetching sightseeing details:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 4. Create Sightseeing Place (Admin CRUD with validation)
router.post('/sightseeing', async (req, res) => {
  try {
    await ensureDb();
    const data = req.body || {};

    const name = (data.name || '').trim();
    const city = (data.city || data.cityName || '').trim();

    // Required field validation
    if (!name) {
      return res.status(400).json({ success: false, error: 'Sightseeing place name is required.' });
    }
    if (!city) {
      return res.status(400).json({ success: false, error: 'City is required.' });
    }

    // Latitude / Longitude numerical validation
    if (data.latitude !== undefined && data.latitude !== null && String(data.latitude).trim() !== '') {
      const lat = parseFloat(data.latitude);
      if (isNaN(lat) || lat < -90 || lat > 90) {
        return res.status(400).json({ success: false, error: 'Latitude must be a valid number between -90 and 90.' });
      }
    }
    if (data.longitude !== undefined && data.longitude !== null && String(data.longitude).trim() !== '') {
      const lon = parseFloat(data.longitude);
      if (isNaN(lon) || lon < -180 || lon > 180) {
        return res.status(400).json({ success: false, error: 'Longitude must be a valid number between -180 and 180.' });
      }
    }

    // Duplicate prevention: same name + same city
    const existingDuplicate = await Sightseeing.findOne({
      where: {
        [Op.and]: [
          { name: { [Op.like]: name } },
          {
            [Op.or]: [
              { city: { [Op.like]: city } },
              { cityName: { [Op.like]: city } }
            ]
          }
        ]
      }
    });

    if (existingDuplicate) {
      return res.status(409).json({
        success: false,
        error: `A sightseeing place named "${name}" already exists in "${city}". Please modify the place name or edit the existing record.`
      });
    }

    // Slug generation and uniqueness
    const requestedSlug = data.slug && data.slug.trim() ? data.slug.trim() : `${name} ${city}`;
    const slug = await ensureUniqueSightseeingSlug(requestedSlug);

    const description = (data.description || data.masterDescription || '').trim();
    const shortDescription = (data.shortDescription || description).slice(0, 250);

    const created = await Sightseeing.create({
      name,
      slug,
      city,
      cityName: city,
      state: (data.state || '').trim(),
      country: (data.country || 'India').trim(),
      location: (data.location || '').trim(),
      latitude: data.latitude ? String(data.latitude).trim() : null,
      longitude: data.longitude ? String(data.longitude).trim() : null,
      image: data.image || 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?w=800&auto=format&fit=crop&q=80',
      gallery: Array.isArray(data.gallery) ? data.gallery : [],
      shortDescription,
      description,
      masterDescription: description || shortDescription || name,
      duration: data.duration || '2 - 3 Hours',
      bestTimeToVisit: data.bestTimeToVisit || 'October to March',
      entryFee: data.entryFee || 'Free Entry',
      openingTime: data.openingTime || '09:00 AM',
      closingTime: data.closingTime || '06:00 PM',
      category: data.category || 'Monument & Heritage',
      status: data.status === 'Inactive' ? 'Inactive' : 'Active'
    });

    res.status(201).json({
      success: true,
      message: `Sightseeing place "${created.name}" created successfully.`,
      sightseeing: formatSightseeingResponse(created)
    });
  } catch (err) {
    console.error('Error creating sightseeing place:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 5. Update Sightseeing Place (PUT / PATCH)
router.all(['/sightseeing/:id'], async (req, res, next) => {
  if (req.method !== 'PUT' && req.method !== 'PATCH') return next();
  try {
    await ensureDb();
    const { id } = req.params;
    const data = req.body || {};

    const place = await Sightseeing.findByPk(parseInt(id, 10));
    if (!place) {
      return res.status(404).json({ success: false, error: 'Sightseeing place not found.' });
    }

    const name = data.name !== undefined ? String(data.name).trim() : place.name;
    const city = data.city !== undefined ? String(data.city).trim() : (data.cityName !== undefined ? String(data.cityName).trim() : (place.city || place.cityName));

    if (!name) {
      return res.status(400).json({ success: false, error: 'Sightseeing place name cannot be empty.' });
    }
    if (!city) {
      return res.status(400).json({ success: false, error: 'City cannot be empty.' });
    }

    // Latitude / Longitude validation
    if (data.latitude !== undefined && data.latitude !== null && String(data.latitude).trim() !== '') {
      const lat = parseFloat(data.latitude);
      if (isNaN(lat) || lat < -90 || lat > 90) {
        return res.status(400).json({ success: false, error: 'Latitude must be a valid number between -90 and 90.' });
      }
    }
    if (data.longitude !== undefined && data.longitude !== null && String(data.longitude).trim() !== '') {
      const lon = parseFloat(data.longitude);
      if (isNaN(lon) || lon < -180 || lon > 180) {
        return res.status(400).json({ success: false, error: 'Longitude must be a valid number between -180 and 180.' });
      }
    }

    // Duplicate prevention excluding current ID
    if (name !== place.name || city !== (place.city || place.cityName)) {
      const duplicate = await Sightseeing.findOne({
        where: {
          id: { [Op.ne]: place.id },
          [Op.and]: [
            { name: { [Op.like]: name } },
            {
              [Op.or]: [
                { city: { [Op.like]: city } },
                { cityName: { [Op.like]: city } }
              ]
            }
          ]
        }
      });
      if (duplicate) {
        return res.status(409).json({
          success: false,
          error: `Another sightseeing place named "${name}" already exists in "${city}".`
        });
      }
    }

    // Slug management
    let slug = place.slug;
    if (data.slug && data.slug.trim() && data.slug.trim() !== place.slug) {
      slug = await ensureUniqueSightseeingSlug(data.slug.trim(), place.id);
    } else if (!slug || name !== place.name) {
      slug = await ensureUniqueSightseeingSlug(`${name} ${city}`, place.id);
    }

    const description = data.description !== undefined ? data.description : (data.masterDescription !== undefined ? data.masterDescription : place.description);
    const shortDesc = data.shortDescription !== undefined ? data.shortDescription : place.shortDescription;

    await place.update({
      name,
      slug,
      city,
      cityName: city,
      state: data.state !== undefined ? String(data.state).trim() : place.state,
      country: data.country !== undefined ? String(data.country).trim() : place.country,
      location: data.location !== undefined ? String(data.location).trim() : place.location,
      latitude: data.latitude !== undefined ? (data.latitude ? String(data.latitude).trim() : null) : place.latitude,
      longitude: data.longitude !== undefined ? (data.longitude ? String(data.longitude).trim() : null) : place.longitude,
      image: data.image !== undefined ? data.image : place.image,
      gallery: data.gallery !== undefined ? (Array.isArray(data.gallery) ? data.gallery : []) : place.gallery,
      shortDescription: shortDesc || (description ? description.slice(0, 180) : ''),
      description: description,
      masterDescription: description || place.masterDescription,
      duration: data.duration !== undefined ? data.duration : place.duration,
      bestTimeToVisit: data.bestTimeToVisit !== undefined ? data.bestTimeToVisit : place.bestTimeToVisit,
      entryFee: data.entryFee !== undefined ? data.entryFee : place.entryFee,
      openingTime: data.openingTime !== undefined ? data.openingTime : place.openingTime,
      closingTime: data.closingTime !== undefined ? data.closingTime : place.closingTime,
      category: data.category !== undefined ? data.category : place.category,
      status: data.status !== undefined ? (data.status === 'Inactive' ? 'Inactive' : 'Active') : place.status
    });

    res.json({
      success: true,
      message: `Sightseeing place "${place.name}" updated successfully.`,
      sightseeing: formatSightseeingResponse(place)
    });
  } catch (err) {
    console.error('Error updating sightseeing place:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 6. Toggle Status (Active / Inactive)
router.patch('/sightseeing/:id/status', async (req, res) => {
  try {
    await ensureDb();
    const { id } = req.params;
    const place = await Sightseeing.findByPk(parseInt(id, 10));
    if (!place) {
      return res.status(404).json({ success: false, error: 'Sightseeing place not found.' });
    }

    const nextStatus = req.body?.status ? (req.body.status === 'Active' ? 'Active' : 'Inactive') : (place.status === 'Active' ? 'Inactive' : 'Active');
    await place.update({ status: nextStatus });

    res.json({
      success: true,
      status: nextStatus,
      message: `Place "${place.name}" is now ${nextStatus}.`
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 7. Delete Sightseeing Place with Reference Safety Check
router.delete('/sightseeing/:id', async (req, res) => {
  try {
    await ensureDb();
    const { id } = req.params;
    const force = req.query.force === 'true' || req.query.force === true;

    const place = await Sightseeing.findByPk(parseInt(id, 10));
    if (!place) {
      return res.status(404).json({ success: false, error: 'Sightseeing place not found.' });
    }

    const refCheck = await checkSightseeingReferences(place);

    // If referenced and not forcing, prevent accidental deletion and advise deactivation
    if (refCheck.isReferenced && !force) {
      return res.status(409).json({
        success: false,
        isReferenced: true,
        referenceCount: refCheck.count,
        references: refCheck.references,
        error: `Cannot permanently delete "${place.name}" because it is referenced in ${refCheck.count} tour package(s) or blog article(s). Please deactivate it instead, or confirm forced deletion if you are sure.`
      });
    }

    const placeName = place.name;
    await place.destroy();

    res.json({
      success: true,
      message: `Sightseeing place "${placeName}" was deleted successfully.`
    });
  } catch (err) {
    console.error('Error deleting sightseeing place:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Packages CRUD
router.get('/packages', async (req, res) => {
  try {
    await ensureDb();
    const packages = await Package.findAll({
      order: [['createdAt', 'DESC']]
    });
    res.json({
      success: true,
      total: packages.length,
      packages
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/packages/:id', async (req, res) => {
  try {
    await ensureDb();
    const pkg = await Package.findByPk(req.params.id);
    if (!pkg) {
      return res.status(404).json({ success: false, error: 'Package not found' });
    }
    res.json({ success: true, package: pkg });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.delete('/packages/:id', async (req, res) => {
  try {
    await ensureDb();
    const pkg = await Package.findByPk(req.params.id);
    if (!pkg) {
      return res.status(404).json({ success: false, error: 'Package not found' });
    }
    await pkg.destroy();
    res.json({ success: true, message: 'Package deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Helper to extract related services from day-wise itinerary
function extractRelatedServices(days = []) {
  const hotels = [];
  const flights = [];
  const cabs = [];
  const buses = [];
  const meals = [];
  const activities = [];
  const sightseeing = [];

  if (Array.isArray(days)) {
    days.forEach((day, dayIdx) => {
      const services = day.services || [];
      services.forEach((svc) => {
        const item = { ...(svc.data || {}), dayIndex: dayIdx, dayTitle: day.title || `Day ${dayIdx + 1}` };
        if (svc.type === 'hotel') hotels.push(item);
        else if (svc.type === 'flight') flights.push(item);
        else if (svc.type === 'cab') cabs.push(item);
        else if (svc.type === 'bus') buses.push(item);
        else if (svc.type === 'sightseeing') {
          if (Array.isArray(svc.data?.items)) {
            svc.data.items.forEach(it => sightseeing.push({ ...it, dayIndex: dayIdx, dayTitle: day.title }));
          } else {
            sightseeing.push(item);
          }
        } else if (svc.type === 'activity') {
          if (Array.isArray(svc.data?.items)) {
            svc.data.items.forEach(it => activities.push({ ...it, dayIndex: dayIdx, dayTitle: day.title }));
          } else {
            activities.push(item);
          }
        } else if (svc.type === 'meal') {
          if (Array.isArray(svc.data?.items)) {
            svc.data.items.forEach(it => meals.push({ ...it, dayIndex: dayIdx, dayTitle: day.title }));
          } else {
            meals.push(item);
          }
        }
      });
    });
  }

  return { hotels, flights, cabs, buses, meals, activities, sightseeing };
}

// Helper to consolidate all cover locations across primary destination, days, and sightseeing tours
function extractAllCoverLocations(data, daysArray, extractedSightseeing) {
  if (Array.isArray(data.coverLocation) && data.coverLocation.length > 1) {
    return data.coverLocation;
  }
  const locSet = new Set();
  const primary = (data.destination || data.city || '').trim();
  if (primary) locSet.add(primary);

  if (Array.isArray(data.coverLocation)) {
    data.coverLocation.forEach(loc => {
      if (typeof loc === 'string' && loc.trim()) locSet.add(loc.trim());
    });
  }

  if (Array.isArray(daysArray)) {
    daysArray.forEach(day => {
      if (day.location && typeof day.location === 'string' && day.location.trim()) {
        locSet.add(day.location.trim());
      }
      (day.services || []).forEach(svc => {
        if (svc.type === 'sightseeing') {
          (svc.data?.items || []).forEach(item => {
            if (item.location && typeof item.location === 'string') {
              item.location.split(',').map(p => p.trim()).filter(Boolean).forEach(p => locSet.add(p));
            } else if (item.name && typeof item.name === 'string') {
              locSet.add(item.name.trim());
            }
          });
        }
      });
    });
  }

  if (Array.isArray(extractedSightseeing)) {
    extractedSightseeing.forEach(item => {
      if (item.location && typeof item.location === 'string') {
        item.location.split(',').map(p => p.trim()).filter(Boolean).forEach(p => locSet.add(p));
      } else if (item.name && typeof item.name === 'string') {
        locSet.add(item.name.trim());
      }
    });
  }

  const list = Array.from(locSet).filter(Boolean);
  return list.length > 0 ? list : [primary || 'Custom Destination'];
}

// Packages CRUD - Create or Update with Transaction
router.post('/packages', async (req, res) => {
  try {
    await ensureDb();
    const data = req.body || {};

    const packageName = (data.packageName || data.title || '').trim();
    if (!packageName) {
      return res.status(400).json({ success: false, error: 'Package Name / Title is required.' });
    }

    let daysArray = [];
    if (Array.isArray(data.dayWiseItinerary) && data.dayWiseItinerary.length > 0) {
      daysArray = data.dayWiseItinerary;
    } else if (Array.isArray(data.days) && data.days.length > 0) {
      daysArray = data.days;
    } else if (Array.isArray(data.itineraryData?.days) && data.itineraryData.days.length > 0) {
      daysArray = data.itineraryData.days;
    } else if (typeof data.itineraryData === 'string') {
      try {
        const parsed = JSON.parse(data.itineraryData);
        if (Array.isArray(parsed?.days)) daysArray = parsed.days;
      } catch (e) {}
    } else if (typeof data.dayWiseItinerary === 'string') {
      try {
        const parsed = JSON.parse(data.dayWiseItinerary);
        if (Array.isArray(parsed)) daysArray = parsed;
      } catch (e) {}
    }

    const extracted = extractRelatedServices(daysArray);

    const packagePayload = {
      packageName,
      coverLocation: extractAllCoverLocations(data, daysArray, extracted.sightseeing),
      city: data.city || data.destination || 'Custom Destination',
      state: data.state || 'India',
      destination: data.destination || data.city || 'Custom Destination',
      originCity: data.originCity || 'Delhi',
      startDate: data.startDate || null,
      endDate: data.endDate || null,
      nights: Number(data.nights) || (daysArray.length > 0 ? Math.max(daysArray.length - 1, 1) : 1),
      days: typeof data.days === 'string'
        ? data.days
        : `${Math.max(daysArray.length, 1)} Days / ${Math.max(daysArray.length - 1, 1)} Nights`,
      totalPrice: Math.max(Number(data.totalPrice) || 0, 0),
      offerPrice: Math.max(Number(data.offerPrice) || Number(data.totalPrice) || 0, 0),
      hotel: data.hotel || (data.hotelsList && data.hotelsList[0]) || (extracted.hotels[0] || null),
      foodType: data.foodType || data.mealsList || (extracted.meals.length > 0 ? ['Included'] : []),
      totalTransfer: Number(data.totalTransfer) || (extracted.cabs.length + extracted.buses.length) || 1,
      rating: data.rating || '4.8',
      tagType: data.tagType || 'Customized',
      coverImage: data.coverImage || 'https://images.unsplash.com/photo-1506744038136-46273834b3fb',
      description: data.description || '',
      status: data.status || 'Draft',
      travelers: data.travelers || { adults: 2, children: 0, infants: 0 },
      customerInfo: data.customerInfo || null,
      pricingBreakdown: data.pricingBreakdown || null,
      pricingRules: data.pricingRules || data.pricing || null,
      itineraryData: data.itineraryData || (daysArray.length > 0 ? { days: daysArray } : null),
      dayWiseItinerary: daysArray,
      destinationWiseItinerary: data.destinationWiseItinerary || [],
      hotelsList: (Array.isArray(data.hotelsList) && data.hotelsList.length > 0) ? data.hotelsList : extracted.hotels,
      flightsList: (Array.isArray(data.flightsList) && data.flightsList.length > 0) ? data.flightsList : extracted.flights,
      cabsList: (Array.isArray(data.cabsList) && data.cabsList.length > 0) ? data.cabsList : extracted.cabs,
      busesList: (Array.isArray(data.busesList) && data.busesList.length > 0) ? data.busesList : extracted.buses,
      mealsList: (Array.isArray(data.mealsList) && data.mealsList.length > 0) ? data.mealsList : extracted.meals,
      activitiesList: (Array.isArray(data.activitiesList) && data.activitiesList.length > 0) ? data.activitiesList : extracted.activities,
      sightseeingList: (Array.isArray(data.sightseeingList) && data.sightseeingList.length > 0) ? data.sightseeingList : extracted.sightseeing,
      inclusions: data.inclusions || [],
      exclusions: data.exclusions || [],
      termsAndConditions: data.termsAndConditions || data.terms || [],
      cancellationPolicy: data.cancellationPolicy || null,
      dateChangePolicy: data.dateChangePolicy || null,
      otherPolicies: data.otherPolicies || data.policies || [],
      customization: data.customization || null,
      policyVisibility: data.policyVisibility || null,
      priceBreakdownVisibility: data.priceBreakdownVisibility || null,
      highlights: Array.isArray(data.highlights) ? data.highlights : (data.itineraryData?.highlights || []),
      consultantName: data.consultantName || data.itineraryData?.consultantName || '',
      referenceId: data.referenceId || data.itineraryData?.referenceId || '',
      tripId: data.tripId || data.itineraryData?.tripId || '',
      tags: data.tags || [],
      galleryImages: data.galleryImages || []
    };

    // Execute atomic database transaction
    const t = await sequelize.transaction();
    try {
      let savedPackage;
      const targetId = data.id || data.packageId;

      if (targetId) {
        const existing = await Package.findByPk(targetId, { transaction: t });
        if (existing) {
          savedPackage = await existing.update(packagePayload, { transaction: t });
        } else {
          savedPackage = await Package.create({ ...packagePayload, id: targetId }, { transaction: t });
        }
      } else {
        savedPackage = await Package.create(packagePayload, { transaction: t });
      }

      await t.commit();

      return res.json({
        success: true,
        message: targetId ? 'Package updated successfully' : 'Package created successfully',
        package: savedPackage
      });
    } catch (txError) {
      await t.rollback();
      console.error('Transaction rollback in POST /packages:', txError);
      return res.status(500).json({ success: false, error: txError.message });
    }
  } catch (err) {
    console.error('Save package error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Packages PUT - Update existing package
router.put('/packages/:id', async (req, res) => {
  try {
    await ensureDb();
    const pkgId = req.params.id;
    const data = req.body || {};

    const packageName = (data.packageName || data.title || '').trim();
    if (!packageName) {
      return res.status(400).json({ success: false, error: 'Package Name / Title is required.' });
    }

    let daysArray = [];
    if (Array.isArray(data.dayWiseItinerary) && data.dayWiseItinerary.length > 0) {
      daysArray = data.dayWiseItinerary;
    } else if (Array.isArray(data.days) && data.days.length > 0) {
      daysArray = data.days;
    } else if (Array.isArray(data.itineraryData?.days) && data.itineraryData.days.length > 0) {
      daysArray = data.itineraryData.days;
    } else if (typeof data.itineraryData === 'string') {
      try {
        const parsed = JSON.parse(data.itineraryData);
        if (Array.isArray(parsed?.days)) daysArray = parsed.days;
      } catch (e) {}
    } else if (typeof data.dayWiseItinerary === 'string') {
      try {
        const parsed = JSON.parse(data.dayWiseItinerary);
        if (Array.isArray(parsed)) daysArray = parsed;
      } catch (e) {}
    }

    const extracted = extractRelatedServices(daysArray);

    const packagePayload = {
      packageName,
      coverLocation: extractAllCoverLocations(data, daysArray, extracted.sightseeing),
      city: data.city || data.destination || 'Custom Destination',
      state: data.state || 'India',
      destination: data.destination || data.city || 'Custom Destination',
      originCity: data.originCity || 'Delhi',
      startDate: data.startDate || null,
      endDate: data.endDate || null,
      nights: Number(data.nights) || (daysArray.length > 0 ? Math.max(daysArray.length - 1, 1) : 1),
      days: typeof data.days === 'string'
        ? data.days
        : `${Math.max(daysArray.length, 1)} Days / ${Math.max(daysArray.length - 1, 1)} Nights`,
      totalPrice: Math.max(Number(data.totalPrice) || 0, 0),
      offerPrice: Math.max(Number(data.offerPrice) || Number(data.totalPrice) || 0, 0),
      hotel: data.hotel || (data.hotelsList && data.hotelsList[0]) || (extracted.hotels[0] || null),
      foodType: data.foodType || data.mealsList || (extracted.meals.length > 0 ? ['Included'] : []),
      totalTransfer: Number(data.totalTransfer) || (extracted.cabs.length + extracted.buses.length) || 1,
      rating: data.rating || '4.8',
      tagType: data.tagType || 'Customized',
      coverImage: data.coverImage || 'https://images.unsplash.com/photo-1506744038136-46273834b3fb',
      description: data.description || '',
      status: data.status || 'Draft',
      travelers: data.travelers || { adults: 2, children: 0, infants: 0 },
      customerInfo: data.customerInfo || null,
      pricingBreakdown: data.pricingBreakdown || null,
      pricingRules: data.pricingRules || data.pricing || null,
      itineraryData: data.itineraryData || (daysArray.length > 0 ? { days: daysArray } : null),
      dayWiseItinerary: daysArray,
      destinationWiseItinerary: data.destinationWiseItinerary || [],
      hotelsList: (Array.isArray(data.hotelsList) && data.hotelsList.length > 0) ? data.hotelsList : extracted.hotels,
      flightsList: (Array.isArray(data.flightsList) && data.flightsList.length > 0) ? data.flightsList : extracted.flights,
      cabsList: (Array.isArray(data.cabsList) && data.cabsList.length > 0) ? data.cabsList : extracted.cabs,
      busesList: (Array.isArray(data.busesList) && data.busesList.length > 0) ? data.busesList : extracted.buses,
      mealsList: (Array.isArray(data.mealsList) && data.mealsList.length > 0) ? data.mealsList : extracted.meals,
      activitiesList: (Array.isArray(data.activitiesList) && data.activitiesList.length > 0) ? data.activitiesList : extracted.activities,
      sightseeingList: (Array.isArray(data.sightseeingList) && data.sightseeingList.length > 0) ? data.sightseeingList : extracted.sightseeing,
      inclusions: data.inclusions || [],
      exclusions: data.exclusions || [],
      termsAndConditions: data.termsAndConditions || data.terms || [],
      cancellationPolicy: data.cancellationPolicy || null,
      dateChangePolicy: data.dateChangePolicy || null,
      otherPolicies: data.otherPolicies || data.policies || [],
      customization: data.customization || null,
      policyVisibility: data.policyVisibility || null,
      priceBreakdownVisibility: data.priceBreakdownVisibility || null,
      highlights: Array.isArray(data.highlights) ? data.highlights : (data.itineraryData?.highlights || []),
      consultantName: data.consultantName || data.itineraryData?.consultantName || '',
      referenceId: data.referenceId || data.itineraryData?.referenceId || '',
      tripId: data.tripId || data.itineraryData?.tripId || '',
      tags: data.tags || [],
      galleryImages: data.galleryImages || []
    };

    const t = await sequelize.transaction();
    try {
      const existing = await Package.findByPk(pkgId, { transaction: t });
      if (!existing) {
        await t.rollback();
        return res.status(404).json({ success: false, error: 'Package not found' });
      }

      const updated = await existing.update(packagePayload, { transaction: t });
      await t.commit();

      return res.json({
        success: true,
        message: 'Package updated successfully',
        package: updated
      });
    } catch (txError) {
      await t.rollback();
      console.error('Transaction rollback in PUT /packages/:id:', txError);
      return res.status(500).json({ success: false, error: txError.message });
    }
  } catch (err) {
    console.error('Update package error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/* =========================================================================
   BLOGS & CATEGORIES MANAGEMENT ENDPOINTS
   ========================================================================= */

// Helper to generate a clean URL slug
function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[\s\W-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// 1. Get All Blogs (with filters, pagination, search)
router.get('/blogs', async (req, res) => {
  try {
    await ensureDb();
    const {
      search = '',
      category = '',
      blogType = '',
      status = '',
      limit = 50,
      offset = 0,
      sort = 'createdAt',
      order = 'DESC'
    } = req.query;

    const whereConditions = [];

    if (search.trim()) {
      const q = `%${search.trim()}%`;
      whereConditions.push({
        [Op.or]: [
          { title: { [Op.like]: q } },
          { excerpt: { [Op.like]: q } },
          { content: { [Op.like]: q } },
          { category: { [Op.like]: q } }
        ]
      });
    }

    if (category.trim() && category.trim().toLowerCase() !== 'all') {
      const catVal = category.trim();
      whereConditions.push({
        [Op.or]: [
          { category: { [Op.like]: `%${catVal}%` } }
        ]
      });
    }

    if (blogType.trim() && blogType.trim().toLowerCase() !== 'all') {
      whereConditions.push({ blogType: blogType.trim() });
    }

    if (status.trim() && status.trim().toLowerCase() !== 'all') {
      whereConditions.push({ status: status.trim() });
    }

    const where = whereConditions.length > 0 ? { [Op.and]: whereConditions } : {};

    const { count, rows } = await Blog.findAndCountAll({
      where,
      limit: parseInt(limit, 10) || 50,
      offset: parseInt(offset, 10) || 0,
      order: [[sort, order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC']]
    });

    res.json({
      success: true,
      total: count,
      blogs: rows
    });
  } catch (err) {
    console.error('Error fetching blogs:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 2. Get Single Blog by Slug or ID
router.get('/blogs/:slugOrId', async (req, res) => {
  try {
    await ensureDb();
    const { slugOrId } = req.params;

    let blog = null;
    if (/^\d+$/.test(slugOrId)) {
      blog = await Blog.findByPk(parseInt(slugOrId, 10));
    }
    
    if (!blog) {
      blog = await Blog.findOne({
        where: { slug: slugOrId }
      });
    }

    if (!blog) {
      return res.status(404).json({ success: false, error: 'Blog not found' });
    }

    res.json({
      success: true,
      blog
    });
  } catch (err) {
    console.error('Error fetching blog detail:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 3. Create Blog
router.post('/blogs', async (req, res) => {
  try {
    await ensureDb();
    const data = req.body;

    if (!data.title || !data.title.trim()) {
      return res.status(400).json({ success: false, error: 'Blog title is required' });
    }

    let slug = (data.slug || '').trim();
    if (!slug) {
      slug = slugify(data.title);
    } else {
      slug = slugify(slug);
    }

    // Ensure unique slug
    let existingSlug = await Blog.findOne({ where: { slug } });
    let count = 1;
    while (existingSlug) {
      slug = `${slugify(data.title)}-${count}`;
      existingSlug = await Blog.findOne({ where: { slug } });
      count++;
    }

    const newBlog = await Blog.create({
      title: data.title.trim(),
      slug,
      blogType: data.blogType || 'top_list',
      category: data.category || 'Destinations',
      categoryId: data.categoryId || null,
      excerpt: data.excerpt || '',
      content: data.content || '',
      coverImage: data.coverImage || 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?q=80&w=1200&auto=format&fit=crop',
      author: data.author || 'Bharat Yatra Editorial',
      readTime: data.readTime || '6 min read',
      rating: data.rating || '4.8',
      ratingCount: data.ratingCount || 100,
      publishDate: data.publishDate || new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      status: data.status || 'Published',
      topItems: Array.isArray(data.topItems) ? data.topItems : [],
      highlights: Array.isArray(data.highlights) ? data.highlights : [],
      quickInfo: Array.isArray(data.quickInfo) ? data.quickInfo : [],
      placesExplored: Array.isArray(data.placesExplored) ? data.placesExplored : [],
      placesCovered: Array.isArray(data.placesCovered) ? data.placesCovered : [],
      journeyRoute: Array.isArray(data.journeyRoute) ? data.journeyRoute : [],
      journeyStats: data.journeyStats || {},
      foodDishes: Array.isArray(data.foodDishes) ? data.foodDishes : [],
      foodPlaces: Array.isArray(data.foodPlaces) ? data.foodPlaces : [],
      tips: Array.isArray(data.tips) ? data.tips : [],
      tipsImage: data.tipsImage || null,
      experience: data.experience || {},
      tripSnapshot: data.tripSnapshot || {},
      seo: data.seo || {}
    });

    res.status(201).json({
      success: true,
      message: 'Blog created successfully',
      blog: newBlog
    });
  } catch (err) {
    console.error('Error creating blog:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 4. Update Blog
router.put('/blogs/:id', async (req, res) => {
  try {
    await ensureDb();
    const blogId = parseInt(req.params.id, 10);
    const blog = await Blog.findByPk(blogId);

    if (!blog) {
      return res.status(404).json({ success: false, error: 'Blog not found' });
    }

    const data = req.body;
    let slug = (data.slug || blog.slug).trim();
    if (slug !== blog.slug) {
      slug = slugify(slug);
      const existing = await Blog.findOne({ where: { slug, id: { [Op.ne]: blogId } } });
      if (existing) {
        slug = `${slug}-${Date.now()}`;
      }
    }

    const updated = await blog.update({
      title: data.title !== undefined ? data.title.trim() : blog.title,
      slug,
      blogType: data.blogType !== undefined ? data.blogType : blog.blogType,
      category: data.category !== undefined ? data.category : blog.category,
      categoryId: data.categoryId !== undefined ? data.categoryId : blog.categoryId,
      excerpt: data.excerpt !== undefined ? data.excerpt : blog.excerpt,
      content: data.content !== undefined ? data.content : blog.content,
      coverImage: data.coverImage !== undefined ? data.coverImage : blog.coverImage,
      author: data.author !== undefined ? data.author : blog.author,
      readTime: data.readTime !== undefined ? data.readTime : blog.readTime,
      rating: data.rating !== undefined ? data.rating : blog.rating,
      ratingCount: data.ratingCount !== undefined ? data.ratingCount : blog.ratingCount,
      publishDate: data.publishDate !== undefined ? data.publishDate : blog.publishDate,
      status: data.status !== undefined ? data.status : blog.status,
      topItems: data.topItems !== undefined ? data.topItems : blog.topItems,
      highlights: data.highlights !== undefined ? data.highlights : blog.highlights,
      quickInfo: data.quickInfo !== undefined ? data.quickInfo : blog.quickInfo,
      placesExplored: data.placesExplored !== undefined ? data.placesExplored : blog.placesExplored,
      placesCovered: data.placesCovered !== undefined ? data.placesCovered : blog.placesCovered,
      journeyRoute: data.journeyRoute !== undefined ? data.journeyRoute : blog.journeyRoute,
      journeyStats: data.journeyStats !== undefined ? data.journeyStats : blog.journeyStats,
      foodDishes: data.foodDishes !== undefined ? data.foodDishes : blog.foodDishes,
      foodPlaces: data.foodPlaces !== undefined ? data.foodPlaces : blog.foodPlaces,
      tips: data.tips !== undefined ? data.tips : blog.tips,
      tipsImage: data.tipsImage !== undefined ? data.tipsImage : blog.tipsImage,
      experience: data.experience !== undefined ? data.experience : blog.experience,
      tripSnapshot: data.tripSnapshot !== undefined ? data.tripSnapshot : blog.tripSnapshot,
      seo: data.seo !== undefined ? data.seo : blog.seo
    });

    res.json({
      success: true,
      message: 'Blog updated successfully',
      blog: updated
    });
  } catch (err) {
    console.error('Error updating blog:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 5. Delete Blog
router.delete('/blogs/:id', async (req, res) => {
  try {
    await ensureDb();
    const blogId = parseInt(req.params.id, 10);
    const blog = await Blog.findByPk(blogId);

    if (!blog) {
      return res.status(404).json({ success: false, error: 'Blog not found' });
    }

    await blog.destroy();
    res.json({ success: true, message: 'Blog deleted successfully' });
  } catch (err) {
    console.error('Error deleting blog:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 6. Get All Blog Categories
router.get('/blog-categories', async (req, res) => {
  try {
    await ensureDb();
    const categories = await BlogCategory.findAll({
      order: [['id', 'ASC']]
    });

    // Compute live post counts
    const categoriesWithCount = await Promise.all(
      categories.map(async (cat) => {
        const count = await Blog.count({
          where: {
            [Op.or]: [
              { category: cat.name },
              { categoryId: cat.id }
            ]
          }
        });
        return {
          ...cat.toJSON(),
          postCount: count
        };
      })
    );

    res.json({
      success: true,
      categories: categoriesWithCount
    });
  } catch (err) {
    console.error('Error fetching blog categories:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 7. Create Blog Category
router.post('/blog-categories', async (req, res) => {
  try {
    await ensureDb();
    const { name, description, icon = 'Compass', status = 'Active' } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, error: 'Category name is required' });
    }

    const slug = slugify(name);
    const newCat = await BlogCategory.create({
      name: name.trim(),
      slug,
      description: description ? description.trim() : '',
      icon,
      status
    });

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      category: newCat
    });
  } catch (err) {
    console.error('Error creating blog category:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 8. Update Blog Category
router.put('/blog-categories/:id', async (req, res) => {
  try {
    await ensureDb();
    const catId = parseInt(req.params.id, 10);
    const cat = await BlogCategory.findByPk(catId);
    if (!cat) {
      return res.status(404).json({ success: false, error: 'Category not found' });
    }

    const { name, description, icon, status } = req.body;
    await cat.update({
      name: name !== undefined ? name.trim() : cat.name,
      slug: name !== undefined ? slugify(name) : cat.slug,
      description: description !== undefined ? description.trim() : cat.description,
      icon: icon !== undefined ? icon : cat.icon,
      status: status !== undefined ? status : cat.status
    });

    res.json({
      success: true,
      message: 'Category updated successfully',
      category: cat
    });
  } catch (err) {
    console.error('Error updating blog category:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 9. Delete Blog Category
router.delete('/blog-categories/:id', async (req, res) => {
  try {
    await ensureDb();
    const catId = parseInt(req.params.id, 10);
    const cat = await BlogCategory.findByPk(catId);
    if (!cat) {
      return res.status(404).json({ success: false, error: 'Category not found' });
    }

    await cat.destroy();
    res.json({ success: true, message: 'Category deleted successfully' });
  } catch (err) {
    console.error('Error deleting blog category:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 10. Get Real Database Destinations (Aggregated from actual Package and City database models)
router.get('/destinations', async (req, res) => {
  try {
    await ensureDb();

    // Query real packages
    const packages = await Package.findAll({
      attributes: ['id', 'packageName', 'destination', 'city', 'coverImage', 'price', 'duration']
    });

    const destMap = new Map();

    for (const pkg of packages) {
      const destName = (pkg.destination || pkg.city || '').trim();
      if (!destName) continue;
      if (!destMap.has(destName.toLowerCase())) {
        destMap.set(destName.toLowerCase(), {
          id: `DEST-${pkg.id}`,
          name: destName,
          state: pkg.city || destName,
          packagesCount: 1,
          image: pkg.coverImage || 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?w=800&auto=format&fit=crop&q=80',
          startingPrice: pkg.price || null
        });
      } else {
        const item = destMap.get(destName.toLowerCase());
        item.packagesCount += 1;
        if (!item.image && pkg.coverImage) {
          item.image = pkg.coverImage;
        }
      }
    }

    // If no packages yet, query real Cities table from DB
    if (destMap.size === 0) {
      const cities = await Cities.findAll({ limit: 10 });
      for (const c of cities) {
        if (!c.city_name) continue;
        destMap.set(c.city_name.toLowerCase(), {
          id: `DEST-CITY-${c.id}`,
          name: c.city_name,
          state: c.city_name,
          packagesCount: 0,
          image: 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?w=800&auto=format&fit=crop&q=80',
          startingPrice: null
        });
      }
    }

    const destinations = Array.from(destMap.values());
    res.json({
      success: true,
      destinations
    });
  } catch (err) {
    console.error('Error fetching destinations:', err);
    res.status(500).json({ success: false, error: err.message, destinations: [] });
  }
});

/* =========================================================================
   TASK: JOURNEY ROUTE SEARCH & REAL-TIME OSRM DIRECTIONS
   ========================================================================= */

// 1. Combined Journey Route Location Search (Cities + Bus Hubs + Cabs + Sightseeing + Geocoding)
router.get('/route/search', async (req, res) => {
  try {
    const q = (req.query.q || req.query.query || '').trim();
    if (!q || q.length < 2) {
      return res.json({ success: true, results: [] });
    }

    const results = await searchRouteLocations(q);
    res.json({ success: true, results });
  } catch (err) {
    console.error('Error searching route locations:', err);
    res.status(500).json({ success: false, error: err.message, results: [] });
  }
});

// 2. Real Route Directions & Distance Calculation (OSRM Road Polyline + Segments)
router.post('/route/directions', async (req, res) => {
  try {
    const { waypoints } = req.body;
    if (!waypoints || !Array.isArray(waypoints) || waypoints.length < 2) {
      return res.status(400).json({
        success: false,
        error: 'At least 2 waypoints with latitude and longitude are required'
      });
    }

    const directions = await getRouteDirections(waypoints);
    res.json(directions);
  } catch (err) {
    console.error('Error calculating route directions:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/* =========================================================================
   TRAVEL PRO PROVIDER INTEGRATIONS & PAYMENT WORKFLOW
   ========================================================================= */

// 1. Flight Search Session
router.post('/travel/search/flight', async (req, res) => {
  try {
    const outboundIp = await getOutboundIp();
    let resultData = null;
    let isFallback = false;
    let traceId = `TR-${Date.now()}`;

    try {
      resultData = await flightProvider.search(req.body, outboundIp);
      traceId = resultData?.TraceId || resultData?.Response?.TraceId || traceId;
    } catch (apiErr) {
      console.warn('Live SRDV flight search failed, activating normalized fallback:', apiErr.message);
      isFallback = true;
      const origin = req.body.origin || 'DEL';
      const destination = req.body.destination || 'BOM';
      const date = req.body.departureDate || new Date().toISOString().split('T')[0];
      resultData = generateNormalizedFallbackFlights(origin, destination, date);
    }

    // Save search session to database
    const session = await TravelSearchSession.create({
      serviceType: 'FLIGHT',
      provider: isFallback ? 'NORMALIZED_FALLBACK' : 'SRDV',
      searchParams: req.body,
      requestSnapshot: req.body,
      resultSnapshot: resultData,
      traceId,
      resultCount: Array.isArray(resultData?.Results?.[0]) ? resultData.Results[0].length : 5,
      status: 'COMPLETED',
      expiresAt: new Date(Date.now() + 30 * 60 * 1000)
    });

    res.json({
      success: true,
      sessionId: session.id,
      traceId,
      isFallback,
      data: resultData
    });
  } catch (err) {
    console.error('Error in travel flight search:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 2. Hotel Search Session
router.post('/travel/search/hotel', async (req, res) => {
  try {
    const outboundIp = await getOutboundIp();
    let resultData = null;
    let isFallback = false;
    let traceId = `TR-HT-${Date.now()}`;

    try {
      resultData = await hotelProvider.search(req.body, outboundIp);
      traceId = resultData?.TraceId || traceId;
    } catch (apiErr) {
      console.warn('Live SRDV hotel search failed, falling back to local catalog:', apiErr.message);
      isFallback = true;
      const city = req.body.destination || req.body.city || 'Manali';
      const fallbackList = await Hotel.findAll({
        where: {
          [Op.or]: [
            { city: { [Op.like]: `%${city}%` } },
            { destination: { [Op.like]: `%${city}%` } }
          ]
        },
        limit: 15
      });
      resultData = {
        TraceId: traceId,
        ResponseStatus: 1,
        HotelResult: fallbackList.map((h, idx) => ({
          ResultIndex: String(idx + 1),
          HotelCode: `HTL-${h.id}`,
          HotelName: h.name,
          StarRating: h.starRating || 4,
          HotelAddress: h.location || h.city,
          CityName: h.city,
          CountryName: 'India',
          Price: {
            Currency: 'INR',
            RoomPrice: Number(h.pricePerNight || 3500),
            Tax: Math.round(Number(h.pricePerNight || 3500) * 0.12),
            TotalFare: Math.round(Number(h.pricePerNight || 3500) * 1.12)
          },
          HotelPicture: h.image || 'https://images.unsplash.com/photo-1566073771259-6a8506099945'
        }))
      };
    }

    const session = await TravelSearchSession.create({
      serviceType: 'HOTEL',
      provider: isFallback ? 'DATABASE_CATALOG' : 'SRDV',
      searchParams: req.body,
      requestSnapshot: req.body,
      resultSnapshot: resultData,
      traceId,
      resultCount: resultData?.HotelResult?.length || 0,
      status: 'COMPLETED',
      expiresAt: new Date(Date.now() + 30 * 60 * 1000)
    });

    res.json({
      success: true,
      sessionId: session.id,
      traceId,
      isFallback,
      data: resultData
    });
  } catch (err) {
    console.error('Error in travel hotel search:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 3. Bus Search Session
router.post('/travel/search/bus', async (req, res) => {
  try {
    let resultData = null;
    let isFallback = false;
    let traceId = `TR-BS-${Date.now()}`;

    try {
      resultData = await busProvider.search(req.body);
      traceId = resultData?.TraceId || resultData?.Result?.TraceId || traceId;
    } catch (apiErr) {
      console.warn('Live SRDV bus search failed, falling back to local bus routes:', apiErr.message);
      isFallback = true;
      const from = req.body.fromCity || 'Delhi';
      const to = req.body.toCity || 'Manali';
      const localBuses = await Bus.findAll({ limit: 10 });
      resultData = {
        TraceId: traceId,
        Result: localBuses.map((b, idx) => ({
          ResultIndex: String(idx + 1),
          TravelName: b.operator || 'Zingbus Luxury Class',
          BusType: b.busType || 'Volvo A/C Sleeper',
          DepartureTime: b.departureTime || '20:30',
          ArrivalTime: b.arrivalTime || '08:30',
          Duration: '12h 00m',
          FromCity: from,
          ToCity: to,
          Fare: Number(b.fare || 1450),
          AvailableSeats: 18
        }))
      };
    }

    const session = await TravelSearchSession.create({
      serviceType: 'BUS',
      provider: isFallback ? 'DATABASE_ROUTES' : 'SRDV',
      searchParams: req.body,
      requestSnapshot: req.body,
      resultSnapshot: resultData,
      traceId,
      resultCount: Array.isArray(resultData?.Result) ? resultData.Result.length : 0,
      status: 'COMPLETED',
      expiresAt: new Date(Date.now() + 30 * 60 * 1000)
    });

    res.json({
      success: true,
      sessionId: session.id,
      traceId,
      isFallback,
      data: resultData
    });
  } catch (err) {
    console.error('Error in travel bus search:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 4. Car Search Session
router.post('/travel/search/car', async (req, res) => {
  try {
    const outboundIp = await getOutboundIp();
    let resultData = null;
    let isFallback = false;
    let traceId = `TR-CR-${Date.now()}`;

    try {
      resultData = await carProvider.search(req.body, outboundIp);
      traceId = resultData?.TraceId || resultData?.Result?.TraceId || traceId;
    } catch (apiErr) {
      console.warn('Live SRDV car search failed, falling back to fleet catalog:', apiErr.message);
      isFallback = true;
      const from = req.body.fromCity || 'Delhi';
      const to = req.body.toCity || 'Manali';
      resultData = {
        TraceId: traceId,
        Result: [
          {
            ResultIndex: '1',
            VehicleName: 'Dzire / Etios or Equivalent',
            Category: 'SEDAN',
            SeatingCapacity: 4,
            LuggageCapacity: 2,
            BaseFare: 4500,
            DriverAllowance: 350,
            PerKmRate: 12,
            TollIncluded: true,
            TotalFare: 4850,
            FromCity: from,
            ToCity: to
          },
          {
            ResultIndex: '2',
            VehicleName: 'Toyota Innova Crysta Luxury',
            Category: 'INNOVA_CRYSTA',
            SeatingCapacity: 6,
            LuggageCapacity: 4,
            BaseFare: 7200,
            DriverAllowance: 400,
            PerKmRate: 18,
            TollIncluded: true,
            TotalFare: 7600,
            FromCity: from,
            ToCity: to
          },
          {
            ResultIndex: '3',
            VehicleName: 'Force Urbania Executive',
            Category: 'TEMPO_TRAVELLER',
            SeatingCapacity: 12,
            LuggageCapacity: 10,
            BaseFare: 12500,
            DriverAllowance: 500,
            PerKmRate: 24,
            TollIncluded: true,
            TotalFare: 13000,
            FromCity: from,
            ToCity: to
          }
        ]
      };
    }

    const session = await TravelSearchSession.create({
      serviceType: 'CAR',
      provider: isFallback ? 'FLEET_CATALOG' : 'SRDV',
      searchParams: req.body,
      requestSnapshot: req.body,
      resultSnapshot: resultData,
      traceId,
      resultCount: resultData?.Result?.length || 0,
      status: 'COMPLETED',
      expiresAt: new Date(Date.now() + 30 * 60 * 1000)
    });

    res.json({
      success: true,
      sessionId: session.id,
      traceId,
      isFallback,
      data: resultData
    });
  } catch (err) {
    console.error('Error in travel car search:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 5. Get Travel Search Session by ID
router.get('/travel/search/sessions/:id', async (req, res) => {
  try {
    const session = await TravelSearchSession.findByPk(req.params.id);
    if (!session) {
      return res.status(404).json({ success: false, error: 'Search session not found' });
    }
    res.json({ success: true, session });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 6. Detailed Flight Operations: FareCalendar, FareRule, SeatMap, SSR
router.post('/travel/flight/fare-calendar', async (req, res) => {
  try {
    const outboundIp = await getOutboundIp();
    const data = await flightProvider.fareCalendar(req.body, outboundIp);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/travel/flight/fare-rule', async (req, res) => {
  try {
    const outboundIp = await getOutboundIp();
    const data = await flightProvider.fareRule(req.body, outboundIp);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/travel/flight/fare-quote', async (req, res) => {
  try {
    const outboundIp = await getOutboundIp();
    const data = await flightProvider.fareQuote(req.body, outboundIp);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/travel/flight/seat-map', async (req, res) => {
  try {
    const outboundIp = await getOutboundIp();
    const data = await flightProvider.seatMap(req.body, outboundIp);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/travel/flight/ssr', async (req, res) => {
  try {
    const outboundIp = await getOutboundIp();
    const data = await flightProvider.ssr(req.body, outboundIp);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 7. Detailed Hotel Operations: GetHotelInfo, GetHotelRoom
router.post('/travel/hotel/info', async (req, res) => {
  try {
    const outboundIp = await getOutboundIp();
    const data = await hotelProvider.hotelInfo(req.body, outboundIp);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/travel/hotel/room', async (req, res) => {
  try {
    const outboundIp = await getOutboundIp();
    const data = await hotelProvider.hotelRoom(req.body, outboundIp);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 8. Detailed Bus Operations: Boarding Points, Seat Layout
router.post('/travel/bus/boarding-points', async (req, res) => {
  try {
    const data = await busProvider.boardingPointDetails(req.body);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/travel/bus/seat-layout', async (req, res) => {
  try {
    const data = await busProvider.seatLayout(req.body);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 9. Package Service Items (Attaching flight/hotel/bus/car to Itinerary Day)
router.post('/packages/:packageId/services', async (req, res) => {
  try {
    const packageId = parseInt(req.params.packageId, 10);
    const {
      itineraryDayId,
      serviceType,
      selectedResult,
      detailSnapshot,
      fareRuleSnapshot,
      seatMapSnapshot,
      ssrSnapshot,
      roomSnapshot,
      boardingSnapshot,
      selectedOptions = {},
      pricing,
      traceId,
      srdvType,
      srdvIndex,
      resultIndex,
      hotelCode,
      providerReferences = {}
    } = req.body;

    if (!itineraryDayId || !serviceType || !selectedResult) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: itineraryDayId, serviceType, and selectedResult are required'
      });
    }

    const serviceItem = await PackageServiceItem.create({
      packageId,
      itineraryDayId: String(itineraryDayId),
      serviceType,
      status: 'SELECTED',
      provider: 'SRDV',
      traceId: traceId ? String(traceId) : null,
      srdvType: srdvType ? String(srdvType) : null,
      srdvIndex: srdvIndex ? String(srdvIndex) : null,
      resultIndex: resultIndex ? String(resultIndex) : null,
      hotelCode: hotelCode ? String(hotelCode) : null,
      providerReferences,
      selectedResultSnapshot: selectedResult,
      detailSnapshot,
      fareRuleSnapshot,
      seatMapSnapshot,
      ssrSnapshot,
      roomSnapshot,
      boardingSnapshot,
      selectedOptions,
      pricingSnapshot: pricing || { totalAmount: selectedResult.totalFare || selectedResult.fare || 0 }
    });

    res.json({ success: true, serviceItem });
  } catch (err) {
    console.error('Error attaching service to package:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/packages/:packageId/services', async (req, res) => {
  try {
    const packageId = parseInt(req.params.packageId, 10);
    const services = await PackageServiceItem.findAll({
      where: { packageId },
      order: [['createdAt', 'ASC']]
    });
    res.json({ success: true, services });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.delete('/packages/:packageId/services/:serviceItemId', async (req, res) => {
  try {
    const { packageId, serviceItemId } = req.params;
    const item = await PackageServiceItem.findOne({
      where: { id: serviceItemId, packageId }
    });
    if (!item) {
      return res.status(404).json({ success: false, error: 'Service item not found' });
    }
    await item.destroy();
    res.json({ success: true, message: 'Service removed from package successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.put('/packages/:packageId/services/:serviceItemId', async (req, res) => {
  try {
    const { packageId, serviceItemId } = req.params;
    const item = await PackageServiceItem.findOne({
      where: { id: serviceItemId, packageId }
    });
    if (!item) {
      return res.status(404).json({ success: false, error: 'Service item not found' });
    }
    await item.update(req.body);
    res.json({ success: true, serviceItem: item });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/* =========================================================================
   PAYMENT GATEWAY (RAZORPAY TEST MODE) & ATOMIC BOOKING FLOW
   ========================================================================= */

// Get Razorpay Public Config
router.get('/payments/config', (req, res) => {
  res.json({
    success: true,
    keyId: getRazorpayKeyId(),
    testMode: true,
    currency: 'INR'
  });
});

// Get Payment History
router.get('/payments/history', async (req, res) => {
  try {
    const { status, limit = 50 } = req.query;
    const where = {};
    if (status && status !== 'ALL') where.status = status;
    const payments = await Payment.findAll({
      where,
      order: [['createdAt', 'DESC']],
      limit: Math.min(100, Number(limit) || 50)
    });
    res.json({ success: true, payments });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message, payments: [] });
  }
});

// Create Razorpay Order
router.post('/payments/create-order', async (req, res) => {
  try {
    const { amount, currency = 'INR', packageId, serviceItemId, serviceType } = req.body;
    if (!amount || !serviceType) {
      return res.status(400).json({ success: false, error: 'Amount and serviceType are required' });
    }

    const orderData = await createPaymentOrder({
      amount: Number(amount),
      currency,
      packageId: packageId ? parseInt(packageId, 10) : null,
      serviceItemId: serviceItemId || null,
      serviceType
    });

    res.json({ success: true, ...orderData });
  } catch (err) {
    console.error('Error creating payment order:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Verify Payment Signature & Execute Booking Atomically
router.post('/payments/verify-and-book', async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const {
      orderId,
      paymentId,
      signature,
      serviceType,
      packageId,
      serviceItemId,
      itineraryDayId,
      bookingPayload
    } = req.body;

    if (!orderId || !paymentId || !serviceType || !bookingPayload) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        error: 'orderId, paymentId, serviceType, and bookingPayload are required'
      });
    }

    // 1. Verify Razorpay Signature (or generate valid test signature if in dev/test)
    const isValidSignature = verifyPaymentSignature(orderId, paymentId, signature);
    if (!isValidSignature && !paymentId.startsWith('pay_test_')) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        error: 'Invalid payment signature verification'
      });
    }

    // 2. Idempotency Check: Verify Payment Record
    const payment = await Payment.findOne({
      where: { gatewayOrderId: orderId },
      transaction
    });

    if (!payment) {
      await transaction.rollback();
      return res.status(404).json({ success: false, error: 'Payment order record not found' });
    }

    if (payment.status === 'PAID') {
      await transaction.rollback();
      // Payment already processed, return existing booking
      let existingBooking = null;
      if (serviceType === 'FLIGHT') existingBooking = await FlightBooking.findOne({ where: { bookingId: payment.bookingId } });
      else if (serviceType === 'HOTEL') existingBooking = await HotelBooking.findOne({ where: { bookingId: payment.bookingId } });
      else if (serviceType === 'BUS') existingBooking = await BusBooking.findOne({ where: { bookingId: payment.bookingId } });
      else if (serviceType === 'CAR') existingBooking = await CarBooking.findOne({ where: { bookingId: payment.bookingId } });

      return res.json({
        success: true,
        alreadyProcessed: true,
        message: 'This payment was already verified and confirmed',
        booking: existingBooking,
        payment
      });
    }

    // 3. Execute Booking via Dummy Provider (Real SRDV Booking remains disabled as mandated)
    let providerResult = null;
    let createdBooking = null;
    const totalAmount = Number(payment.amount || bookingPayload.totalAmount || 0);

    if (serviceType === 'FLIGHT') {
      providerResult = await flightProvider.book({
        ...bookingPayload,
        totalAmount
      });
      const bookRes = providerResult.Response.Response;
      createdBooking = await FlightBooking.create(
        {
          bookingId: String(bookRes.BookingId),
          pnr: bookRes.PNR,
          ticketNumber: bookRes.FlightItinerary.Ticket.TicketNumber,
          invoiceNumber: bookRes.FlightItinerary.Ticket.InvoiceNumber,
          packageId: packageId ? parseInt(packageId, 10) : null,
          itineraryDayId: itineraryDayId || null,
          serviceItemId: serviceItemId || null,
          status: 'CONFIRMED',
          airline: bookRes.FlightItinerary.AirlineName,
          airlineCode: bookRes.FlightItinerary.ValidatingAirlineCode,
          flightNumber: bookRes.FlightItinerary.FlightNumber,
          origin: bookRes.FlightItinerary.Origin,
          destination: bookRes.FlightItinerary.Destination,
          departureTime: bookRes.FlightItinerary.DepartureTime,
          arrivalTime: bookRes.FlightItinerary.ArrivalTime,
          departureDate: bookRes.FlightItinerary.DepartureDate,
          arrivalDate: bookRes.FlightItinerary.ArrivalDate,
          duration: bookingPayload.flightData?.duration || '2h 15m',
          stops: bookingPayload.flightData?.stops || 'Direct',
          cabinClass: bookingPayload.flightData?.cabinClass || 'Economy',
          isLcc: Boolean(bookRes.FlightItinerary.IsLCC),
          isRefundable: true,
          fare: bookRes.FlightItinerary.Fare.TotalFare,
          baseFare: bookRes.FlightItinerary.Fare.BaseFare,
          tax: bookRes.FlightItinerary.Fare.Tax,
          totalAmount: bookRes.FlightItinerary.Fare.TotalFare,
          currency: 'INR',
          segments: bookRes.FlightItinerary.Segments,
          passengers: bookingPayload.passengers || [],
          seats: bookingPayload.seats || [],
          ssr: bookingPayload.ssr || {},
          traceId: bookingPayload.traceId,
          bookingSnapshot: bookRes
        },
        { transaction }
      );
    } else if (serviceType === 'HOTEL') {
      providerResult = await hotelProvider.book({
        ...bookingPayload,
        totalAmount
      });
      const bookRes = providerResult.BookResult;
      createdBooking = await HotelBooking.create(
        {
          bookingId: String(bookRes.BookingId),
          confirmationNo: bookRes.ConfirmationNo,
          bookingRefNo: bookRes.BookingRefNo,
          invoiceNumber: bookRes.InvoiceNumber,
          packageId: packageId ? parseInt(packageId, 10) : null,
          itineraryDayId: itineraryDayId || null,
          serviceItemId: serviceItemId || null,
          status: 'CONFIRMED',
          hotelName: bookRes.HotelDetails.HotelName,
          hotelCode: bookRes.HotelDetails.HotelCode,
          starRating: bookRes.HotelDetails.StarRating || 4,
          category: '4 Star Luxury',
          address: bookRes.HotelDetails.Address,
          city: bookRes.HotelDetails.CityName,
          checkInDate: bookRes.HotelDetails.CheckInDate,
          checkOutDate: bookRes.HotelDetails.CheckOutDate,
          nights: Number(bookingPayload.nights || 1),
          roomsCount: Number(bookingPayload.rooms || 1),
          guestCount: Array.isArray(bookingPayload.guests) ? bookingPayload.guests.length : 2,
          roomTypeName: bookRes.HotelDetails.RoomTypeName,
          ratePlanCode: bookRes.HotelDetails.RatePlanCode,
          inclusions: bookRes.HotelDetails.Inclusions,
          guests: bookingPayload.guests || [],
          pricePerNight: Math.round(totalAmount / (Number(bookingPayload.nights || 1))),
          basePrice: bookRes.HotelDetails.Price.RoomPrice,
          tax: bookRes.HotelDetails.Price.Tax,
          totalAmount: bookRes.HotelDetails.Price.TotalFare,
          currency: 'INR',
          voucherStatus: 'CONFIRMED',
          traceId: bookingPayload.traceId,
          bookingSnapshot: bookRes
        },
        { transaction }
      );
    } else if (serviceType === 'BUS') {
      providerResult = await busProvider.book({
        ...bookingPayload,
        totalAmount
      });
      const bookRes = providerResult.Result;
      createdBooking = await BusBooking.create(
        {
          bookingId: String(bookRes.BusId || `BUS-${Date.now()}`),
          ticketNo: bookRes.TicketNo,
          operatorPnr: bookRes.TravelOperatorPNR,
          busId: bookRes.BusId,
          packageId: packageId ? parseInt(packageId, 10) : null,
          itineraryDayId: itineraryDayId || null,
          serviceItemId: serviceItemId || null,
          status: 'CONFIRMED',
          operator: bookRes.TravelName,
          busType: bookRes.BusType,
          fromCity: bookRes.FromCity,
          toCity: bookRes.ToCity,
          travelDate: bookRes.TravelDate,
          departureTime: bookRes.DepartureTime,
          arrivalTime: bookRes.ArrivalTime,
          boardingPoint: bookRes.BoardingPointDetails || {},
          droppingPoint: bookRes.DroppingPointDetails || {},
          passengers: bookRes.Passengers || [],
          seats: bookRes.Seats || [],
          fare: totalAmount,
          totalAmount,
          currency: 'INR',
          traceId: bookingPayload.traceId,
          bookingSnapshot: bookRes
        },
        { transaction }
      );
    } else if (serviceType === 'CAR') {
      providerResult = await carProvider.book({
        ...bookingPayload,
        totalAmount
      });
      const bookRes = providerResult.Result;
      createdBooking = await CarBooking.create(
        {
          bookingId: String(bookRes.BookingId),
          confirmationNo: bookRes.ConfirmationNo,
          referenceNo: bookRes.ReferenceNo,
          packageId: packageId ? parseInt(packageId, 10) : null,
          itineraryDayId: itineraryDayId || null,
          serviceItemId: serviceItemId || null,
          status: 'CONFIRMED',
          vehicleName: bookRes.VehicleName,
          category: bookRes.Category,
          pickupCity: bookRes.PickupCity,
          dropCity: bookRes.DropCity,
          pickupLocation: bookRes.PickupLocation,
          dropLocation: bookRes.DropLocation,
          pickupDate: bookRes.PickupDate,
          pickupTime: bookRes.PickupTime,
          passengers: bookRes.Passengers || [],
          driverDetails: bookRes.DriverDetails,
          baseFare: Math.round(totalAmount * 0.9),
          totalAmount,
          currency: 'INR',
          traceId: bookingPayload.traceId,
          bookingSnapshot: bookRes
        },
        { transaction }
      );
    }

    // 4. Update Payment status to PAID
    await payment.update(
      {
        status: 'PAID',
        gatewayPaymentId: paymentId,
        gatewaySignature: signature || 'VERIFIED_SIG',
        paidAt: new Date(),
        bookingId: createdBooking?.bookingId || createdBooking?.id
      },
      { transaction }
    );

    // 5. Update PackageServiceItem if attached to a package
    if (serviceItemId) {
      await PackageServiceItem.update(
        { status: 'BOOKED' },
        { where: { id: serviceItemId }, transaction }
      );
    }

    await transaction.commit();

    res.json({
      success: true,
      booking: createdBooking,
      payment,
      providerResult
    });
  } catch (err) {
    await transaction.rollback();
    console.error('Error verifying payment and booking:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/* =========================================================================
   DIRECT BOOKINGS, LISTINGS, CANCELLATIONS & VOUCHERS
   ========================================================================= */

// Direct Booking Handlers (when booking without prior checkout, e.g. direct admin reservation)
router.post('/bookings/flight/book', async (req, res) => {
  try {
    const providerResult = await flightProvider.book(req.body);
    const bookRes = providerResult.Response.Response;
    const totalAmount = Number(req.body.totalAmount || bookRes.FlightItinerary.Fare.TotalFare);

    const booking = await FlightBooking.create({
      bookingId: String(bookRes.BookingId),
      pnr: bookRes.PNR,
      ticketNumber: bookRes.FlightItinerary.Ticket.TicketNumber,
      invoiceNumber: bookRes.FlightItinerary.Ticket.InvoiceNumber,
      status: 'CONFIRMED',
      airline: bookRes.FlightItinerary.AirlineName,
      airlineCode: bookRes.FlightItinerary.ValidatingAirlineCode,
      flightNumber: bookRes.FlightItinerary.FlightNumber,
      origin: bookRes.FlightItinerary.Origin,
      destination: bookRes.FlightItinerary.Destination,
      departureTime: bookRes.FlightItinerary.DepartureTime,
      arrivalTime: bookRes.FlightItinerary.ArrivalTime,
      departureDate: bookRes.FlightItinerary.DepartureDate,
      fare: totalAmount,
      baseFare: Math.round(totalAmount * 0.8),
      tax: Math.round(totalAmount * 0.2),
      totalAmount,
      passengers: req.body.passengers || [],
      seats: req.body.seats || [],
      ssr: req.body.ssr || {},
      traceId: req.body.traceId,
      bookingSnapshot: bookRes
    });

    res.json({ success: true, booking, providerResult });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/bookings/hotel/book', async (req, res) => {
  try {
    const providerResult = await hotelProvider.book(req.body);
    const bookRes = providerResult.BookResult;
    const totalAmount = Number(req.body.totalAmount || bookRes.HotelDetails.Price.TotalFare);

    const booking = await HotelBooking.create({
      bookingId: String(bookRes.BookingId),
      confirmationNo: bookRes.ConfirmationNo,
      bookingRefNo: bookRes.BookingRefNo,
      invoiceNumber: bookRes.InvoiceNumber,
      status: 'CONFIRMED',
      hotelName: bookRes.HotelDetails.HotelName,
      hotelCode: bookRes.HotelDetails.HotelCode,
      starRating: bookRes.HotelDetails.StarRating || 4,
      city: bookRes.HotelDetails.CityName,
      checkInDate: bookRes.HotelDetails.CheckInDate,
      checkOutDate: bookRes.HotelDetails.CheckOutDate,
      nights: Number(req.body.nights || 1),
      roomTypeName: bookRes.HotelDetails.RoomTypeName,
      guests: req.body.guests || [],
      pricePerNight: Math.round(totalAmount / (Number(req.body.nights || 1))),
      basePrice: bookRes.HotelDetails.Price.RoomPrice,
      tax: bookRes.HotelDetails.Price.Tax,
      totalAmount,
      traceId: req.body.traceId,
      bookingSnapshot: bookRes
    });

    res.json({ success: true, booking, providerResult });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/bookings/bus/book', async (req, res) => {
  try {
    const providerResult = await busProvider.book(req.body);
    const bookRes = providerResult.Result;
    const totalAmount = Number(req.body.totalAmount || bookRes.InvoiceAmount);

    const booking = await BusBooking.create({
      bookingId: String(bookRes.BusId || `BUS-${Date.now()}`),
      ticketNo: bookRes.TicketNo,
      operatorPnr: bookRes.TravelOperatorPNR,
      status: 'CONFIRMED',
      operator: bookRes.TravelName,
      busType: bookRes.BusType,
      fromCity: bookRes.FromCity,
      toCity: bookRes.ToCity,
      travelDate: bookRes.TravelDate,
      departureTime: bookRes.DepartureTime,
      arrivalTime: bookRes.ArrivalTime,
      passengers: bookRes.Passengers || [],
      seats: bookRes.Seats || [],
      fare: totalAmount,
      totalAmount,
      traceId: req.body.traceId,
      bookingSnapshot: bookRes
    });

    res.json({ success: true, booking, providerResult });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/bookings/car/book', async (req, res) => {
  try {
    const providerResult = await carProvider.book(req.body);
    const bookRes = providerResult.Result;
    const totalAmount = Number(req.body.totalAmount || bookRes.TotalAmount);

    const booking = await CarBooking.create({
      bookingId: String(bookRes.BookingId),
      confirmationNo: bookRes.ConfirmationNo,
      referenceNo: bookRes.ReferenceNo,
      status: 'CONFIRMED',
      vehicleName: bookRes.VehicleName,
      category: bookRes.Category,
      pickupCity: bookRes.PickupCity,
      dropCity: bookRes.DropCity,
      pickupDate: bookRes.PickupDate,
      pickupTime: bookRes.PickupTime,
      passengers: bookRes.Passengers || [],
      baseFare: Math.round(totalAmount * 0.9),
      totalAmount,
      traceId: req.body.traceId,
      bookingSnapshot: bookRes
    });

    res.json({ success: true, booking, providerResult });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Cancel a booking (Flight, Hotel, Bus, Car)
router.post('/bookings/:serviceType/:bookingId/cancel', async (req, res) => {
  try {
    const serviceType = req.params.serviceType.toUpperCase();
    const { bookingId } = req.params;
    const { reason = 'Customer Request' } = req.body;

    let bookingRecord = null;
    let cancelProvider = null;

    if (serviceType === 'FLIGHT') {
      bookingRecord = await FlightBooking.findOne({ where: { bookingId } });
      cancelProvider = flightProvider;
    } else if (serviceType === 'HOTEL') {
      bookingRecord = await HotelBooking.findOne({ where: { bookingId } });
      cancelProvider = hotelProvider;
    } else if (serviceType === 'BUS') {
      bookingRecord = await BusBooking.findOne({ where: { bookingId } });
      cancelProvider = busProvider;
    } else if (serviceType === 'CAR') {
      bookingRecord = await CarBooking.findOne({ where: { bookingId } });
      cancelProvider = carProvider;
    }

    if (!bookingRecord) {
      return res.status(404).json({ success: false, error: `Booking ${bookingId} not found` });
    }

    if (bookingRecord.status === 'CANCELLED') {
      return res.status(400).json({ success: false, error: 'Booking is already cancelled' });
    }

    const cancelResult = await cancelProvider.cancel({
      booking: bookingRecord,
      reason
    });

    const refundDetails = {
      changeRequestId: cancelResult.Response.ChangeRequestId,
      cancellationCharge: cancelResult.Response.CancellationCharge,
      refundAmount: cancelResult.Response.RefundAmount,
      refundStatus: cancelResult.Response.RefundStatus,
      cancelledAt: cancelResult.Response.ProcessedAt,
      reason
    };

    await bookingRecord.update({
      status: 'CANCELLED',
      cancellationDetails: cancelResult.Response,
      refundDetails
    });

    // Update associated payment if exists
    const payment = await Payment.findOne({ where: { bookingId } });
    if (payment) {
      await payment.update({
        status: 'REFUNDED',
        refundAmount: cancelResult.Response.RefundAmount,
        refundId: `RFD-${cancelResult.Response.ChangeRequestId}`,
        refundStatus: cancelResult.Response.RefundStatus
      });
    }

    res.json({
      success: true,
      message: 'Booking cancelled successfully',
      booking: bookingRecord,
      cancellation: cancelResult.Response
    });
  } catch (err) {
    console.error('Error cancelling booking:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get Single Booking by ID
router.get('/bookings/:serviceType/:id', async (req, res) => {
  try {
    const serviceType = req.params.serviceType.toUpperCase();
    const { id } = req.params;
    let booking = null;

    if (serviceType === 'FLIGHT') {
      booking = await FlightBooking.findOne({
        where: { [Op.or]: [{ id }, { bookingId: id }, { pnr: id }] }
      });
    } else if (serviceType === 'HOTEL') {
      booking = await HotelBooking.findOne({
        where: { [Op.or]: [{ id }, { bookingId: id }, { confirmationNo: id }] }
      });
    } else if (serviceType === 'BUS') {
      booking = await BusBooking.findOne({
        where: { [Op.or]: [{ id }, { bookingId: id }, { ticketNo: id }] }
      });
    } else if (serviceType === 'CAR') {
      booking = await CarBooking.findOne({
        where: { [Op.or]: [{ id }, { bookingId: id }, { confirmationNo: id }] }
      });
    }

    if (!booking) {
      return res.status(404).json({ success: false, error: 'Booking not found' });
    }

    res.json({ success: true, booking });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Unified Bookings List across Flights, Hotels, Buses, Cars
router.get('/bookings', async (req, res) => {
  try {
    const { serviceType, packageId, status, search } = req.query;

    let flights = [];
    let hotels = [];
    let buses = [];
    let cars = [];

    const buildWhere = () => {
      const w = {};
      if (packageId) w.packageId = parseInt(packageId, 10);
      if (status) w.status = status;
      return w;
    };

    if (!serviceType || serviceType === 'FLIGHT') {
      flights = await FlightBooking.findAll({ where: buildWhere(), order: [['createdAt', 'DESC']] });
    }
    if (!serviceType || serviceType === 'HOTEL') {
      hotels = await HotelBooking.findAll({ where: buildWhere(), order: [['createdAt', 'DESC']] });
    }
    if (!serviceType || serviceType === 'BUS') {
      buses = await BusBooking.findAll({ where: buildWhere(), order: [['createdAt', 'DESC']] });
    }
    if (!serviceType || serviceType === 'CAR') {
      cars = await CarBooking.findAll({ where: buildWhere(), order: [['createdAt', 'DESC']] });
    }

    const unified = [
      ...flights.map(f => ({ ...f.toJSON(), serviceType: 'FLIGHT', displayTitle: `${f.airline} (${f.origin} → ${f.destination})`, refCode: f.pnr })),
      ...hotels.map(h => ({ ...h.toJSON(), serviceType: 'HOTEL', displayTitle: `${h.hotelName} (${h.city})`, refCode: h.confirmationNo })),
      ...buses.map(b => ({ ...b.toJSON(), serviceType: 'BUS', displayTitle: `${b.operator} (${b.fromCity} → ${b.toCity})`, refCode: b.ticketNo })),
      ...cars.map(c => ({ ...c.toJSON(), serviceType: 'CAR', displayTitle: `${c.vehicleName} (${c.pickupCity} → ${c.dropCity})`, refCode: c.confirmationNo }))
    ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({
      success: true,
      totalCount: unified.length,
      counts: {
        flights: flights.length,
        hotels: hotels.length,
        buses: buses.length,
        cars: cars.length
      },
      bookings: unified
    });
  } catch (err) {
    console.error('Error listing bookings:', err);
    res.status(500).json({ success: false, error: err.message, bookings: [] });
  }
});

// Printable Voucher & E-Ticket HTML Endpoints
router.get('/bookings/flight/:id/ticket', async (req, res) => {
  try {
    const booking = await FlightBooking.findOne({
      where: { [Op.or]: [{ id: req.params.id }, { bookingId: req.params.id }, { pnr: req.params.id }] }
    });
    if (!booking) return res.status(404).send('Flight booking not found');
    const html = generateFlightTicketHtml(booking);
    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.get('/bookings/hotel/:id/voucher', async (req, res) => {
  try {
    const booking = await HotelBooking.findOne({
      where: { [Op.or]: [{ id: req.params.id }, { bookingId: req.params.id }, { confirmationNo: req.params.id }] }
    });
    if (!booking) return res.status(404).send('Hotel booking not found');
    const html = generateHotelVoucherHtml(booking);
    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.get('/bookings/bus/:id/ticket', async (req, res) => {
  try {
    const booking = await BusBooking.findOne({
      where: { [Op.or]: [{ id: req.params.id }, { bookingId: req.params.id }, { ticketNo: req.params.id }] }
    });
    if (!booking) return res.status(404).send('Bus booking not found');
    const html = generateBusTicketHtml(booking);
    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.get('/bookings/car/:id/voucher', async (req, res) => {
  try {
    const booking = await CarBooking.findOne({
      where: { [Op.or]: [{ id: req.params.id }, { bookingId: req.params.id }, { confirmationNo: req.params.id }] }
    });
    if (!booking) return res.status(404).send('Car booking not found');
    const html = generateCarVoucherHtml(booking);
    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Service API Logs (Auditing with sanitized passwords & sensitive keys)
const handleGetServiceLogs = async (req, res) => {
  try {
    const { serviceType, action, limit = 50 } = req.query;
    const where = {};
    if (serviceType && serviceType !== 'ALL') where.serviceType = serviceType.toUpperCase();
    if (action) where.action = action;

    const logs = await ServiceApiLog.findAll({
      where,
      order: [['createdAt', 'DESC']],
      limit: Math.min(100, Number(limit) || 50)
    });

    res.json({ success: true, logs });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message, logs: [] });
  }
};

router.get('/service-logs', handleGetServiceLogs);
router.get('/travel/logs', handleGetServiceLogs);

export default router;
