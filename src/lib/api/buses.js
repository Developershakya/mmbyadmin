import { mockBuses } from '../mock/mockBuses.js';

/**
 * SRDV Intercity Bus API Connector
 * Calls `/api/package-services/buses/search` which connects to
 * SRDV Technologies Bus v9 REST Search API (`https://bus.srdvtest.com/v9/rest/Search`)
 */
export async function searchBuses(params = {}) {
  const {
    from = 'Delhi',
    to = 'Manali',
    busType = '',
    date = '2025-12-25',
    passengers = 2
  } = params;

  try {
    const res = await fetch('/api/package-services/buses/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        fromCity: from,
        toCity: to,
        travelDate: date || '2025-12-25',
        busType
      })
    });

    if (res.ok) {
      const data = await res.json();
      if (data && data.success && Array.isArray(data.buses)) {
        let list = data.buses.map(b => ({
          ...b,
          departureTime: b.depTime || b.departureTime || '20:00',
          arrivalTime: b.arrTime || b.arrivalTime || '08:00',
          price: b.fare || b.price || 1350,
          seatType: b.busType?.includes('Sleeper') ? 'Luxury Sleeper' : 'Semi-Sleeper Recliner'
        }));

        if (busType && busType !== 'ALL') {
          const matched = list.filter(b => b.busType.toLowerCase().includes(busType.toLowerCase()));
          if (matched.length > 0) list = matched;
        }

        return {
          success: true,
          from,
          to,
          date,
          passengers,
          source: data.source || 'SRDV Bus API',
          buses: list
        };
      }
    }
  } catch (err) {
    console.warn('Backend bus search fallback:', err.message);
  }

  // Local fallback
  let results = [...mockBuses];
  if (busType && busType !== 'ALL') {
    const matched = results.filter(b => b.busType.toLowerCase().includes(busType.toLowerCase()));
    if (matched.length > 0) results = matched;
  }

  return {
    success: true,
    from: from || 'Delhi',
    to: to || 'Manali',
    date,
    passengers,
    buses: results
  };
}
