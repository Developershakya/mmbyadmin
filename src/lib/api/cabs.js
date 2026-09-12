import { mockCabs } from '../mock/mockCabs.js';

/**
 * SRDV Cab Transfers API Connector
 * Calls `/api/package-services/cabs/search` which connects to
 * SRDV Technologies Car v8 REST Search API (`https://car.srdvtest.com/v8/rest/Search`)
 */
export async function searchCabs(params = {}) {
  const {
    pickup = 'Delhi Airport / Station',
    drop = 'Manali Resort',
    cabType = '',
    date = '2025-12-25',
    passengers = 2
  } = params;

  try {
    const res = await fetch('/api/package-services/cabs/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        fromCity: pickup,
        toCity: drop,
        pickupDate: date || '2025-12-25',
        cabType
      })
    });

    if (res.ok) {
      const data = await res.json();
      if (data && data.success && Array.isArray(data.cabs)) {
        let list = data.cabs.map(c => ({
          ...c,
          capacity: `${c.seatingCapacity || 4} Passengers + ${c.luggageCapacity || 3} Bags`,
          basePrice: c.baseFare || c.fare || 4200,
          tollTax: c.tollIncluded ? 0 : 350,
          totalPrice: c.price || c.baseFare || 4200,
          driverAllowance: c.driverAllowance || 350
        }));

        if (cabType && cabType !== 'ALL') {
          const matched = list.filter(c =>
            c.type.toLowerCase().includes(cabType.toLowerCase()) ||
            c.name.toLowerCase().includes(cabType.toLowerCase())
          );
          if (matched.length > 0) list = matched;
        }

        return {
          success: true,
          pickup,
          drop,
          date,
          passengers,
          source: data.source || 'SRDV Car API',
          cabs: list
        };
      }
    }
  } catch (err) {
    console.warn('Backend cab search fallback:', err.message);
  }

  // Local fallback
  let results = [...mockCabs];
  if (cabType && cabType !== 'ALL') {
    const matched = results.filter(c => c.type.toLowerCase().includes(cabType.toLowerCase()));
    if (matched.length > 0) results = matched;
  }

  return {
    success: true,
    pickup: pickup || 'Delhi Airport / Station',
    drop: drop || 'Manali Resort',
    date,
    passengers,
    cabs: results
  };
}
