/**
 * Cities Search API connector
 * Queries the Cities Sequelize model
 */
export async function searchCities(query = '') {
  try {
    const res = await fetch(`/api/cities/search?q=${encodeURIComponent(query)}`);
    if (res.ok) {
      const data = await res.json();
      if (data && data.success) {
        return data.cities || [];
      }
    }
  } catch (err) {
    console.warn('Cities search fallback:', err.message);
  }

  const defaults = [
    { id: 1, cityName: 'Delhi' },
    { id: 2, cityName: 'Manali' },
    { id: 3, cityName: 'Shimla' },
    { id: 4, cityName: 'Jaipur' },
    { id: 5, cityName: 'Mumbai' },
    { id: 6, cityName: 'Goa' },
    { id: 7, cityName: 'Srinagar' },
    { id: 8, cityName: 'Agra' },
    { id: 9, cityName: 'Chandigarh' },
    { id: 10, cityName: 'Bangalore' },
    { id: 11, cityName: 'Udaipur' }
  ];

  if (!query.trim()) return defaults;
  const q = query.toLowerCase().trim();
  return defaults.filter(c => c.cityName.toLowerCase().includes(q));
}
