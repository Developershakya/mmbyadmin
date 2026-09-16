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
  Package
} from '../models/index.js';
import { searchFlights } from '../lib/srdv/flightService.js';
import { searchBuses } from '../lib/srdv/busService.js';
import { searchCars } from '../lib/srdv/carService.js';
import { searchHotels } from '../lib/srdv/hotelService.js';
import { generateNormalizedFallbackFlights } from './srdvService.js';

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

// Sightseeing Master Search
router.get('/sightseeing/search', async (req, res) => {
  try {
    await ensureDb();
    const city = (req.query.city || '').trim();
    const q = (req.query.q || '').trim();

    const conditions = [];
    if (city && city !== 'ALL') {
      conditions.push({ cityName: { [Op.like]: `%${city}%` } });
    }
    if (q) {
      conditions.push({
        [Op.or]: [
          { name: { [Op.like]: `%${q}%` } },
          { masterDescription: { [Op.like]: `%${q}%` } },
          { location: { [Op.like]: `%${q}%` } }
        ]
      });
    }

    const where = conditions.length > 0 ? { [Op.and]: conditions } : {};
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
        cityName: s.cityName,
        location: s.location,
        image: s.image,
        masterDescription: s.masterDescription,
        packageDescriptionOverride: s.masterDescription,
        duration: s.duration,
        category: s.category,
        included: true
      }))
    });
  } catch (err) {
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

// Packages CRUD - Create or Update with Transaction
router.post('/packages', async (req, res) => {
  try {
    await ensureDb();
    const data = req.body || {};

    const packageName = (data.packageName || data.title || '').trim();
    if (!packageName) {
      return res.status(400).json({ success: false, error: 'Package Name / Title is required.' });
    }

    const daysArray = Array.isArray(data.days)
      ? data.days
      : Array.isArray(data.itineraryData?.days)
      ? data.itineraryData.days
      : Array.isArray(data.dayWiseItinerary)
      ? data.dayWiseItinerary
      : [];

    const extracted = extractRelatedServices(daysArray);

    const packagePayload = {
      packageName,
      coverLocation: Array.isArray(data.coverLocation) && data.coverLocation.length > 0
        ? data.coverLocation
        : [data.destination || data.city || 'Custom Destination'],
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

    const daysArray = Array.isArray(data.days)
      ? data.days
      : Array.isArray(data.itineraryData?.days)
      ? data.itineraryData.days
      : Array.isArray(data.dayWiseItinerary)
      ? data.dayWiseItinerary
      : [];

    const extracted = extractRelatedServices(daysArray);

    const packagePayload = {
      packageName,
      coverLocation: Array.isArray(data.coverLocation) && data.coverLocation.length > 0
        ? data.coverLocation
        : [data.destination || data.city || 'Custom Destination'],
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

export default router;
