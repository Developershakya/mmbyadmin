import { initialMasterSightseeing } from '../mock/mockSightseeing.js';

const STORAGE_KEY = 'mmby_master_sightseeing_catalog';

export function getMasterSightseeingList() {
  if (typeof window === 'undefined') return initialMasterSightseeing;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Failed to read master sightseeing from localStorage:', err);
  }
  return initialMasterSightseeing;
}

export function saveMasterSightseeingList(list) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch (err) {
    console.error('Failed to save master sightseeing to localStorage:', err);
  }
}

/**
 * Searches master sightseeing catalog by city and query from Sequelize DB + catalog
 */
export async function searchSightseeing(query = '', city = '') {
  try {
    const params = new URLSearchParams();
    if (city && city !== 'ALL') params.set('city', city);
    if (query) params.set('q', query);

    const res = await fetch(`/api/sightseeing/search?${params.toString()}`);
    if (res.ok) {
      const data = await res.json();
      if (data && data.success && Array.isArray(data.sightseeing) && data.sightseeing.length > 0) {
        return {
          success: true,
          total: data.sightseeing.length,
          results: data.sightseeing.map(s => ({
            id: s.id,
            name: s.name,
            location: s.location,
            city: s.cityName || city || 'Manali',
            category: s.category || 'Sightseeing',
            duration: s.duration || '2 - 3 Hours',
            image: s.image,
            masterDescription: s.masterDescription,
            description: s.packageDescriptionOverride || s.masterDescription,
            shortDescription: s.masterDescription ? s.masterDescription.slice(0, 95) + '...' : '',
            ticketPrice: 0
          }))
        };
      }
    }
  } catch (err) {
    console.warn('Backend sightseeing search fallback:', err.message);
  }

  // Fallback to local catalog
  const list = getMasterSightseeingList();
  const q = (query || '').toLowerCase().trim();
  const c = (city || '').toLowerCase().trim();

  let filtered = list.filter(item => {
    const matchQuery = !q ||
      item.name.toLowerCase().includes(q) ||
      item.location.toLowerCase().includes(q) ||
      (item.category && item.category.toLowerCase().includes(q)) ||
      (item.shortDescription && item.shortDescription.toLowerCase().includes(q));

    const matchCity = !c || item.city.toLowerCase().includes(c);
    return matchQuery && matchCity;
  });

  if (filtered.length === 0 && q) {
    filtered = list.filter(item =>
      item.name.toLowerCase().includes(q) ||
      item.location.toLowerCase().includes(q)
    );
  }

  return {
    success: true,
    total: filtered.length,
    results: filtered
  };
}

/**
 * Adds a new sightseeing record into the master catalog
 */
export async function addMasterSightseeing(newRecord) {
  const list = getMasterSightseeingList();

  const record = {
    id: `SGHT-${Date.now()}`,
    name: newRecord.name,
    location: newRecord.location || newRecord.name,
    city: newRecord.city || 'Manali',
    state: newRecord.state || 'Himachal Pradesh',
    category: newRecord.category || 'Sightseeing',
    duration: newRecord.duration || '2 Hours',
    image: newRecord.image || 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=600&auto=format&fit=crop&q=80',
    shortDescription: newRecord.shortDescription || newRecord.description?.slice(0, 90) + '...',
    description: newRecord.description || '',
    ticketPrice: Number(newRecord.ticketPrice) || 0,
    status: 'Active'
  };

  const updated = [record, ...list];
  saveMasterSightseeingList(updated);

  return {
    success: true,
    record
  };
}
