/**
 * Authentic SRDV City and Airport Mappings
 * Verified against live SRDV v5 and v8 databases and documentation.
 */

export const SRDV_BUS_CITIES = [
  { CityId: 230, CityName: 'Delhi', state: 'Delhi', aliases: ['delhi', 'new delhi', 'isbt kashmiri gate', 'majnu ka tila'] },
  { CityId: 4845, CityName: 'Manali', state: 'Himachal Pradesh', aliases: ['manali', 'kullu manali', 'mall road'] },
  { CityId: 5641, CityName: 'Shimla', state: 'Himachal Pradesh', aliases: ['shimla', 'tutikandi'] },
  { CityId: 7365, CityName: 'Chandigarh', state: 'Chandigarh', aliases: ['chandigarh', 'sector 43 isbt'] },
  { CityId: 5222, CityName: 'Jaipur', state: 'Rajasthan', aliases: ['jaipur', 'sindhi camp'] },
  { CityId: 1562, CityName: 'Mumbai', state: 'Maharashtra', aliases: ['mumbai', 'bombay'] },
  { CityId: 7681, CityName: 'Pune', state: 'Maharashtra', aliases: ['pune'] },
  { CityId: 6395, CityName: 'Bangalore', state: 'Karnataka', aliases: ['bangalore', 'bengaluru'] },
  { CityId: 5900, CityName: 'Goa', state: 'Goa', aliases: ['goa', 'panjim', 'madgaon'] },
  { CityId: 115, CityName: 'Haridwar', state: 'Uttarakhand', aliases: ['haridwar'] },
  { CityId: 2516, CityName: 'Rishikesh', state: 'Uttarakhand', aliases: ['rishikesh'] },
  { CityId: 780, CityName: 'Dharamshala', state: 'Himachal Pradesh', aliases: ['dharamshala', 'mcleodganj'] },
  { CityId: 8102, CityName: 'Amritsar', state: 'Punjab', aliases: ['amritsar'] },
  { CityId: 125, CityName: 'Agra', state: 'Uttar Pradesh', aliases: ['agra'] },
  { CityId: 8380, CityName: 'Udaipur', state: 'Rajasthan', aliases: ['udaipur'] },
  { CityId: 6287, CityName: 'Jodhpur', state: 'Rajasthan', aliases: ['jodhpur'] },
  { CityId: 9331, CityName: 'Ahmedabad', state: 'Gujarat', aliases: ['ahmedabad'] },
  { CityId: 7485, CityName: 'Hyderabad', state: 'Telangana', aliases: ['hyderabad'] },
  { CityId: 2069, CityName: 'Chennai', state: 'Tamil Nadu', aliases: ['chennai', 'madras'] },
  { CityId: 938, CityName: 'Kullu', state: 'Himachal Pradesh', aliases: ['kullu', 'bhuntar'] },
  { CityId: 7481, CityName: 'Kolkata', state: 'West Bengal', aliases: ['kolkata', 'calcutta'] },
  { CityId: 9591, CityName: 'Varanasi', state: 'Uttar Pradesh', aliases: ['varanasi', 'banaras', 'kashi'] },
  { CityId: 5318, CityName: 'Lucknow', state: 'Uttar Pradesh', aliases: ['lucknow'] },
  { CityId: 7319, CityName: 'Dehradun', state: 'Uttarakhand', aliases: ['dehradun'] },
  { CityId: 6553, CityName: 'Jammu', state: 'Jammu and Kashmir', aliases: ['jammu'] },
  { CityId: 8273, CityName: 'Srinagar', state: 'Jammu and Kashmir', aliases: ['srinagar'] },
  { CityId: 4252, CityName: 'Indore', state: 'Madhya Pradesh', aliases: ['indore'] },
  { CityId: 3594, CityName: 'Bhopal', state: 'Madhya Pradesh', aliases: ['bhopal'] },
  { CityId: 2851, CityName: 'Surat', state: 'Gujarat', aliases: ['surat'] },
  { CityId: 8569, CityName: 'Vadodara', state: 'Gujarat', aliases: ['vadodara', 'baroda'] },
  { CityId: 1330, CityName: 'Nagpur', state: 'Maharashtra', aliases: ['nagpur'] },
  { CityId: 3983, CityName: 'Nashik', state: 'Maharashtra', aliases: ['nashik'] }
];

export const SRDV_HOTEL_CITIES = [
  { cityid: '130443', Destination: 'New Delhi', stateprovince: 'Delhi', aliases: ['delhi', 'new delhi', 'ncr'] },
  { cityid: '126388', Destination: 'Manali', stateprovince: 'Himachal Pradesh', aliases: ['manali'] },
  { cityid: '138673', Destination: 'Shimla', stateprovince: 'Himachal Pradesh', aliases: ['shimla'] },
  { cityid: '122175', Destination: 'Jaipur', stateprovince: 'Rajasthan', aliases: ['jaipur'] },
  { cityid: '119805', Destination: 'Goa', stateprovince: 'Goa', aliases: ['goa', 'panaji', 'calangute', 'candolim', 'baga'] },
  { cityid: '144306', Destination: 'Mumbai', stateprovince: 'Maharashtra', aliases: ['mumbai', 'bombay'] },
  { cityid: '114107', Destination: 'Chandigarh', stateprovince: 'Chandigarh', aliases: ['chandigarh'] },
  { cityid: '111124', Destination: 'Bangalore', stateprovince: 'Karnataka', aliases: ['bangalore', 'bengaluru'] },
  { cityid: '146047', Destination: 'Kullu', stateprovince: 'Himachal Pradesh', aliases: ['kullu', 'bhuntar'] },
  { cityid: '140522', Destination: 'Udaipur', stateprovince: 'Rajasthan', aliases: ['udaipur'] },
  { cityid: '145836', Destination: 'Jodhpur', stateprovince: 'Rajasthan', aliases: ['jodhpur'] },
  { cityid: '100589', Destination: 'Agra', stateprovince: 'Uttar Pradesh', aliases: ['agra'] },
  { cityid: '101129', Destination: 'Amritsar', stateprovince: 'Punjab', aliases: ['amritsar'] },
  { cityid: '139456', Destination: 'Srinagar', stateprovince: 'Jammu and Kashmir', aliases: ['srinagar'] },
  { cityid: '121186', Destination: 'Haridwar', stateprovince: 'Uttarakhand', aliases: ['haridwar'] },
  { cityid: '134932', Destination: 'Rishikesh', stateprovince: 'Uttarakhand', aliases: ['rishikesh'] },
  { cityid: '141618', Destination: 'Varanasi', stateprovince: 'Uttar Pradesh', aliases: ['varanasi', 'banaras'] },
  { cityid: '145710', Destination: 'Hyderabad', stateprovince: 'Telangana', aliases: ['hyderabad'] },
  { cityid: '127343', Destination: 'Chennai', stateprovince: 'Tamil Nadu', aliases: ['chennai'] },
  { cityid: '133133', Destination: 'Pune', stateprovince: 'Maharashtra', aliases: ['pune'] },
  { cityid: '100263', Destination: 'Ahmedabad', stateprovince: 'Gujarat', aliases: ['ahmedabad'] },
  { cityid: '126666', Destination: 'Lucknow', stateprovince: 'Uttar Pradesh', aliases: ['lucknow'] },
  { cityid: '101204', Destination: 'Kochi', stateprovince: 'Kerala', aliases: ['kochi', 'cochin'] }
];

/**
 * Resolves a city name or code to its verified SRDV Bus city code and standardized name.
 */
export function resolveBusCity(nameOrCode) {
  if (!nameOrCode) return { code: '230', name: 'Delhi' };
  const str = String(nameOrCode).trim().toLowerCase();
  
  // Try exact ID match
  const byId = SRDV_BUS_CITIES.find(c => String(c.CityId) === str);
  if (byId) return { code: String(byId.CityId), name: byId.CityName };

  // Try alias / name match
  const byName = SRDV_BUS_CITIES.find(c => 
    c.CityName.toLowerCase() === str || 
    c.aliases.some(a => str.includes(a) || a.includes(str))
  );
  if (byName) return { code: String(byName.CityId), name: byName.CityName };

  // If numeric code provided directly
  if (/^\d+$/.test(str)) {
    return { code: str, name: String(nameOrCode).trim() };
  }

  // Default fallback to Delhi
  return { code: '230', name: String(nameOrCode).trim() || 'Delhi' };
}

/**
 * Resolves a destination name or code to its verified SRDV Hotel city ID.
 */
export function resolveHotelCity(nameOrCode) {
  if (!nameOrCode) return { cityid: '130443', destination: 'New Delhi' };
  const str = String(nameOrCode).trim().toLowerCase();

  // Try exact ID match
  const byId = SRDV_HOTEL_CITIES.find(c => c.cityid === str);
  if (byId) return { cityid: byId.cityid, destination: byId.Destination };

  // Try alias / name match
  const byName = SRDV_HOTEL_CITIES.find(c => 
    c.Destination.toLowerCase() === str ||
    c.aliases.some(a => str.includes(a) || a.includes(str))
  );
  if (byName) return { cityid: byName.cityid, destination: byName.Destination };

  // If numeric code provided directly
  if (/^\d+$/.test(str)) {
    return { cityid: str, destination: String(nameOrCode).trim() };
  }

  // Default fallback to New Delhi
  return { cityid: '130443', destination: 'New Delhi' };
}
