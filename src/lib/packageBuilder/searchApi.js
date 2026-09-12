/**
 * Client-Side Package Builder Search & Suggestion API
 * Communicates with backend endpoints (/api/*)
 */

export async function searchFlightsApi(params = {}) {
  const res = await fetch('/api/flights/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Flight search failed with status ${res.status}`);
  }
  const data = await res.json();
  return data.results || data.flights || [];
}

export async function searchBusesApi(params = {}) {
  const res = await fetch('/api/buses/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Bus search failed with status ${res.status}`);
  }
  const data = await res.json();
  return data.results || data.buses || [];
}

export async function searchCabsApi(params = {}) {
  const res = await fetch('/api/cars/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Cab search failed with status ${res.status}`);
  }
  const data = await res.json();
  return data.results || data.cabs || [];
}

export async function searchHotelsApi(params = {}) {
  const res = await fetch('/api/hotels/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Hotel search failed with status ${res.status}`);
  }
  const data = await res.json();
  return data.results || data.hotels || [];
}

// Suggestion items normalizer for Devtunnel + Local DB formats
export function normalizeSuggestionItems(rawList = []) {
  if (!Array.isArray(rawList)) return [];
  return rawList.map((item, idx) => {
    // 1. Airports format from devtunnel: { airport_city_name, airport_name, airport_code }
    if (item.airport_city_name || item.airport_code) {
      return {
        id: item.airport_code || item.id || `apt-${idx}`,
        code: item.airport_code || '',
        label: item.airport_city_name || item.airport_name,
        subLabel: item.airport_name || item.airport_city_name
      };
    }
    // 2. Hotel/Cab/Bus format from devtunnel: { cityid, Destination, country }
    if (item.Destination) {
      let sub = 'Destination / City';
      if (item.country) {
        sub = typeof item.country === 'number' ? `Zone #${item.country}` : String(item.country);
      }
      return {
        id: item.cityid ? String(item.cityid) : `dest-${idx}`,
        code: item.cityid ? String(item.cityid) : '',
        label: item.Destination,
        subLabel: sub
      };
    }
    // 3. Standard shape: { id, code, label, subLabel }
    return {
      id: item.id || item.code || `item-${idx}`,
      code: item.code || '',
      label: item.label || item.city_name || item.name || '',
      subLabel: item.subLabel || item.state || item.country || ''
    };
  });
}

// Suggestion endpoints helper with AbortController support
export async function fetchSuggestions(suggestUrl, query, signal) {
  if (!query || query.trim().length < 2) {
    return [];
  }
  const cleanQ = query.trim();
  const sep = suggestUrl.includes('?') ? '&' : '?';
  // Send both query= and q= so any backend or devtunnel accepts it
  const url = `${suggestUrl}${sep}query=${encodeURIComponent(cleanQ)}&q=${encodeURIComponent(cleanQ)}`;
  
  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'X-Tunnel-Skip-Anti-Phishing-Page': 'true'
      },
      signal
    });
    if (!res.ok) {
      throw new Error(`Failed to fetch suggestions (${res.status})`);
    }
    const data = await res.json();
    const list = Array.isArray(data) ? data : (data.results || data.data || []);
    return normalizeSuggestionItems(list);
  } catch (err) {
    if (err.name === 'AbortError') throw err;
    console.warn(`Suggestions error for ${url}:`, err);
    return [];
  }
}
