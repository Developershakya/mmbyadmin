/**
 * Airport Search API connector
 * Queries the AirportList Sequelize model
 */
export async function searchAirports(query = '') {
  try {
    const res = await fetch(`/api/airports/search?q=${encodeURIComponent(query)}`);
    if (res.ok) {
      const data = await res.json();
      if (data && data.success) {
        return data.airports || [];
      }
    }
  } catch (err) {
    console.warn('Airports search fallback:', err.message);
  }

  // Fallback list
  const defaults = [
    { id: 1, code: 'DEL', name: 'Indira Gandhi International Airport', cityName: 'Delhi' },
    { id: 2, code: 'BOM', name: 'Chhatrapati Shivaji Maharaj International Airport', cityName: 'Mumbai' },
    { id: 3, code: 'BLR', name: 'Kempegowda International Airport', cityName: 'Bengaluru' },
    { id: 4, code: 'KUU', name: 'Kullu Manali Airport (Bhuntar)', cityName: 'Kullu / Manali' },
    { id: 5, code: 'IXC', name: 'Chandigarh International Airport', cityName: 'Chandigarh' },
    { id: 6, code: 'JAI', name: 'Jaipur International Airport', cityName: 'Jaipur' },
    { id: 7, code: 'GOI', name: 'Dabolim International Airport', cityName: 'Goa' },
    { id: 8, code: 'SXR', name: 'Sheikh ul-Alam International Airport', cityName: 'Srinagar' }
  ];

  if (!query.trim()) return defaults;
  const q = query.toLowerCase().trim();
  return defaults.filter(a =>
    a.code.toLowerCase().includes(q) ||
    a.cityName.toLowerCase().includes(q) ||
    a.name.toLowerCase().includes(q)
  );
}
