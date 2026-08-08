import { useRouter } from 'next/router';
import { useEffect, useState, useMemo } from 'react';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Calendar as CalendarIcon, ChevronDown, MapPin, BedDouble, Utensils } from 'lucide-react';

function buildRoomGuests(rooms, adults, children) {
  const roomGuests = [];
  let remainingAdults = adults;
  let remainingChildren = children;

  for (let i = 0; i < rooms; i++) {
    const roomsLeft = rooms - i;
    const adultsThisRoom = Math.max(1, Math.ceil(remainingAdults / roomsLeft));
    const childrenThisRoom = Math.floor(remainingChildren / roomsLeft);

    roomGuests.push({
      adults: adultsThisRoom,
      children: childrenThisRoom,
      childAge: Array(childrenThisRoom).fill(10),
    });

    remainingAdults -= adultsThisRoom;
    remainingChildren -= childrenThisRoom;
  }
  return roomGuests;
}

// Deeply extract clean string names from complex nested Amenities structures
function extractAmenities(rawAmenities) {
  if (!rawAmenities) return [];
  
  let list = [];

  const parseItem = (item) => {
    if (!item) return;
    if (typeof item === 'string') {
      list.push(item.trim());
    } else if (Array.isArray(item)) {
      item.forEach(parseItem);
    } else if (typeof item === 'object') {
      if (item.FacilitiesNames) {
        parseItem(item.FacilitiesNames);
      } else if (item.Name) {
        parseItem(item.Name);
      } else if (item.FacilityName) {
        parseItem(item.FacilityName);
      } else if (item.AmenityName) {
        parseItem(item.AmenityName);
      } else {
        Object.values(item).forEach(val => {
          if (typeof val === 'string' || Array.isArray(val)) {
            parseItem(val);
          }
        });
      }
    }
  };

  parseItem(rawAmenities);
  return Array.from(new Set(list)).filter(Boolean);
}

const indianCities = [
  "Delhi", "Mumbai", "Bengaluru", "Chennai", "Kolkata", "Hyderabad",
  "Pune", "Jaipur", "Ahmedabad", "Lucknow", "Chandigarh", "Goa", "Agra",
  "Varanasi", "Patna", "Bhopal", "Indore", "Nagpur", "Surat", "Amritsar",
];

// UPDATED: Added traceId to HotelCard props
function HotelCard({ hotel, isExpanded, onToggle, traceId, srdvType }) {
  const router = useRouter();

  const name = hotel.HotelName || hotel.Name || 'Hotel Name Unavailable';
  const address = hotel.Address || hotel.HotelAddress || 'Address unavailable';
  const rating = Number(hotel.StarRating || 0);
  const price = Number(hotel.Price?.OfferedPrice || hotel.Price?.PublishedPrice || hotel.Price || 0);
  const image = hotel.HotelPicture || hotel.Images?.[0] || hotel.Image || "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=500";
  const propertyType = hotel.PropertyType || hotel.HotelCategory || 'HOTEL';
  const roomType = hotel.RoomTypeName || hotel.RoomType || hotel.Rooms?.[0]?.RoomTypeName || 'Standard Room';
  const mealType = hotel.Inclusion || hotel.MealType || hotel.Inclusions?.[0] || 'ROOM ONLY';

  const amenitiesList = extractAmenities(hotel.Amenities || hotel.Facilities);

  // UPDATED: View Details handler for navigation
  const handleViewDetails = () => {
    router.push({
      pathname: '/hotel-details',
      query: {
        traceId: traceId || hotel.TraceId || '',
        resultIndex: hotel.ResultIndex || hotel.Index || '1',
        hotelCode: hotel.HotelCode || hotel.Code || '',
        srdvType: srdvType || '',
        srdvIndex: hotel.SrdvIndex || '',
      },
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden transition-all relative">
      <div className="p-4 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        
        {/* Image Section */}
        <div className="relative flex-shrink-0">
          <img
            src={image}
            alt={name}
            className="w-full md:w-44 h-32 md:h-32 object-cover rounded-md bg-gray-100"
          />
          <span className="absolute top-2 left-2 bg-black/70 text-white text-[10px] font-semibold px-2 py-0.5 rounded uppercase tracking-wider">
            {propertyType}
          </span>
        </div>

        {/* Details Section */}
        <div className="space-y-2 flex-1 w-full">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-base font-bold text-gray-900 leading-snug">{name}</h3>
            {rating > 0 && (
              <span className="bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5">
                {rating} ★
              </span>
            )}
          </div>

          <p className="text-xs text-gray-500 flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
            <span className="truncate">{address}</span>
          </p>

          <div className="text-xs text-gray-600 flex items-center gap-1.5 font-medium pt-1">
            <BedDouble className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
            <span>{roomType}</span>
          </div>

          <div className="text-[11px] text-blue-600 font-semibold flex items-center gap-1.5 uppercase tracking-wide">
            <Utensils className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
            <span>{mealType}</span>
          </div>
        </div>

        {/* Price & Action Section */}
        <div className="flex flex-row md:flex-col items-end justify-between w-full md:w-auto gap-3 pt-2 md:pt-0 border-t md:border-t-0 border-gray-100">
          <div className="text-left md:text-right">
            <span className="text-base md:text-xl font-bold text-blue-600">₹{price.toLocaleString()}</span>
            <span className="text-[10px] text-gray-400 block">/night</span>
          </div>
          
          {/* UPDATED: Directly navigate to detail page */}
          <button
            onClick={handleViewDetails}
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded transition-colors cursor-pointer"
          >
            View Details
          </button>
        </div>
      </div>

      {/* Quick Info Accordion Section (If needed) */}
      {isExpanded && (
        <div className="p-5 bg-gray-50 text-xs text-gray-600 border-t border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="font-bold text-gray-900 uppercase text-[10px] tracking-wider mb-2">
                Hotel Info
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between"><span>Name</span><span className="font-medium text-gray-900 text-right">{name}</span></div>
                <div className="flex justify-between"><span>Address</span><span className="font-medium text-gray-900 text-right max-w-[60%]">{address}</span></div>
                <div className="flex justify-between"><span>Star Rating</span><span className="font-medium text-gray-900">{rating > 0 ? `${rating} Star` : 'N/A'}</span></div>
                {hotel.HotelDescription && (
                  <div className="pt-2 text-gray-500 leading-relaxed">{hotel.HotelDescription}</div>
                )}
              </div>
            </div>

            <div>
              <div className="font-bold text-gray-900 uppercase text-[10px] tracking-wider mb-2">
                Price Details
              </div>
              <div className="space-y-1.5 bg-white rounded border border-gray-200 p-3">
                <div className="flex justify-between"><span>Per Night</span><span className="font-medium text-gray-900">₹ {price.toLocaleString()}</span></div>
                {hotel.Price?.TaxAmount && (
                  <div className="flex justify-between"><span>Taxes</span><span className="font-medium text-gray-900">₹ {Number(hotel.Price.TaxAmount).toLocaleString()}</span></div>
                )}
                <div className="border-t border-gray-200 pt-1.5 flex justify-between font-bold text-gray-900">
                  <span>Total</span><span>₹ {(price + Number(hotel.Price?.TaxAmount || 0)).toLocaleString()}</span>
                </div>
              </div>

              {amenitiesList.length > 0 && (
                <div className="mt-4">
                  <div className="font-bold text-gray-900 uppercase text-[10px] tracking-wider mb-2">
                    Amenities
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {amenitiesList.map((a, i) => (
                      <span key={i} className="bg-blue-50 text-blue-600 text-[10px] font-semibold px-2 py-1 rounded">
                        {a}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function HotelsPage() {
  const router = useRouter();
  const { cityId, cityName, checkin, nights, rooms, adults, children } = router.query;

  const [hotels, setHotels] = useState([]);
  const [traceId, setTraceId] = useState('');
  const [srdvType, setSrdvType] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedId, setExpandedId] = useState(null);

  // Filters
  const [maxPrice, setMaxPrice] = useState(50000);
  const [selectedStars, setSelectedStars] = useState([]);
  const [selectedPropertyTypes, setSelectedPropertyTypes] = useState([]);
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [sortBy, setSortBy] = useState('recommended');

  // Header search states
  const [headerCity, setHeaderCity] = useState('');
  const [headerCheckIn, setHeaderCheckIn] = useState(null);
  const [headerCheckOut, setHeaderCheckOut] = useState(null);
  const [headerRooms, setHeaderRooms] = useState(1);
  const [headerAdults, setHeaderAdults] = useState(2);
  const [headerChildren, setHeaderChildren] = useState(0);

  const [openCheckIn, setOpenCheckIn] = useState(false);
  const [openCheckOut, setOpenCheckOut] = useState(false);
  const [openGuestDropdown, setOpenGuestDropdown] = useState(false);

  function toggleStar(star) {
    setSelectedStars((prev) =>
      prev.includes(star) ? prev.filter((s) => s !== star) : [...prev, star]
    );
  }

  function togglePropertyType(type) {
    setSelectedPropertyTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  }

  function toggleAmenity(type) {
    setSelectedAmenities((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, t]
    );
  }

  function resetFilters() {
    setMaxPrice(50000);
    setSelectedStars([]);
    setSelectedPropertyTypes([]);
    setSelectedAmenities([]);
  }

  // Sync Header Inputs with URL Query
  useEffect(() => {
    if (!router.isReady) return;

    if (cityName) setHeaderCity(cityName);
    if (rooms) setHeaderRooms(Number(rooms));
    if (adults) setHeaderAdults(Number(adults));
    if (children) setHeaderChildren(Number(children));

    if (checkin && !isNaN(new Date(checkin).getTime())) {
      const checkInDate = new Date(checkin);
      setHeaderCheckIn(checkInDate);
      
      if (nights) {
        const checkOutDate = new Date(checkInDate);
        checkOutDate.setDate(checkOutDate.getDate() + Number(nights));
        setHeaderCheckOut(checkOutDate);
      }
    }
  }, [router.isReady, cityName, checkin, nights, rooms, adults, children]);

  // Fetch hotels
  useEffect(() => {
    if (!router.isReady) return;
    if (!cityId || !checkin || !nights) return;

    async function fetchHotels() {
      try {
        setLoading(true);
        setError('');

        const roomGuests = buildRoomGuests(
          Number(rooms) || 1,
          Number(adults) || 2,
          Number(children) || 0
        );

        const res = await fetch('/api/hotels/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            checkInDate: checkin,
            noOfNights: Number(nights),
            cityId,
            guestNationality: 'IN',
            noOfRooms: Number(rooms) || 1,
            roomGuests,
          }),
        });

        if (!res.ok) {
          const body = await res.text();
          console.error('API status:', res.status, 'body:', body);
          throw new Error('Failed to fetch');
        }

        const data = await res.json();

        if (!data.success) {
          setError(data.message || 'Hotels fetch nahi ho paaye. Baad me try karo.');
          setHotels([]);
          return;
        }

        setHotels(data.results || []);
        if (data.traceId) setTraceId(data.traceId);
        if (data.srdvType) setSrdvType(data.srdvType); // UPDATED: Store srdvType
      } catch (err) {
        console.error('fetchHotels error:', err);
        setError('Hotels fetch nahi ho paaye. Baad me try karo.');
      } finally {
        setLoading(false);
      }
    }

    fetchHotels();
  }, [router.isReady, cityId, checkin, nights, rooms, adults, children]);

  // Property types count for sidebar
  const propertyTypeCounts = useMemo(() => {
    const counts = {};
    hotels.forEach((h) => {
      const type = h.PropertyType || h.HotelCategory;
      if (!type) return;
      counts[type] = (counts[type] || 0) + 1;
    });
    return Object.entries(counts).map(([type, count]) => ({ type, count }));
  }, [hotels]);

  // Amenities count for sidebar
  const amenityCounts = useMemo(() => {
    const counts = {};
    hotels.forEach((h) => {
      const amenities = extractAmenities(h.Amenities || h.Facilities);
      amenities.forEach((a) => {
        counts[a] = (counts[a] || 0) + 1;
      });
    });
    return Object.entries(counts).map(([type, count]) => ({ type, count }));
  }, [hotels]);

  // Filtered & Sorted Hotels
  const visibleHotels = useMemo(() => {
    let result = [...hotels];

    result = result.filter((h) => Number(h.Price?.OfferedPrice || h.Price?.PublishedPrice || h.Price || 0) <= maxPrice);

    if (selectedStars.length > 0) {
      result = result.filter((h) => selectedStars.includes(Number(h.StarRating || 0)));
    }

    if (selectedPropertyTypes.length > 0) {
      result = result.filter((h) => selectedPropertyTypes.includes(h.PropertyType || h.HotelCategory));
    }

    if (selectedAmenities.length > 0) {
      result = result.filter((h) => {
        const hotelAmenities = extractAmenities(h.Amenities || h.Facilities);
        return selectedAmenities.every((a) => hotelAmenities.includes(a));
      });
    }

    if (sortBy === 'price_low') {
      result.sort((a, b) => Number(a.Price?.OfferedPrice || a.Price?.PublishedPrice || a.Price || 0) - Number(b.Price?.OfferedPrice || b.Price?.PublishedPrice || b.Price || 0));
    } else if (sortBy === 'rating') {
      result.sort((a, b) => Number(b.StarRating || 0) - Number(a.StarRating || 0));
    }

    return result;
  }, [hotels, maxPrice, selectedStars, selectedPropertyTypes, selectedAmenities, sortBy]);

  function toISODate(d) {
    if (!d) return '';
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  function handleHeaderSearch() {
    if (!headerCity || !headerCheckIn || !headerCheckOut) {
      alert('कृपया सभी विवरण भरें');
      return;
    }

    const nightsDiff = Math.ceil((headerCheckOut - headerCheckIn) / (1000 * 60 * 60 * 24));
    if (nightsDiff <= 0) {
      alert('Check-out date must be after the check-in date.');
      return;
    }

    const checkinStr = toISODate(headerCheckIn);
    
    router.push({
      pathname: '/hotels',
      query: {
        cityId: cityId || '',
        cityName: headerCity,
        checkin: checkinStr,
        nights: nightsDiff,
        rooms: headerRooms,
        adults: headerAdults,
        children: headerChildren,
      }
    });
  }

  return (
    <>
      <Header />
      <div className="bg-[#F4F6F9] font-sans antialiased text-gray-800 min-h-screen">

        {/* Header Search Bar */}
        <header className="bg-[#0B1523] text-white p-3 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2.5">
            
            {/* City Select */}
            <div className="flex-1 min-w-[140px] bg-[#1E2A38] px-3 py-1.5 rounded h-[54px] flex flex-col justify-center relative">
              <label className="block text-[9px] uppercase text-orange-500 tracking-wider font-bold">City</label>
              <select
                value={headerCity}
                onChange={(e) => setHeaderCity(e.target.value)}
                className="bg-transparent text-xs font-bold mt-0.5 outline-none cursor-pointer text-gray-200 w-full h-full"
              >
                <option value="" style={{ color: '#000' }}>Select City</option>
                {indianCities.map((city) => (
                  <option key={city} value={city} style={{ color: '#000' }}>
                    {city}
                  </option>
                ))}
              </select>
            </div>

            {/* Check-In */}
            <div className="flex-1 min-w-[140px] bg-[#1E2A38] px-3 py-1.5 rounded h-[54px] flex flex-col justify-center relative">
              <label
                className="block text-[9px] uppercase text-orange-500 tracking-wider font-bold cursor-pointer"
                onClick={() => { setOpenCheckIn(!openCheckIn); setOpenCheckOut(false); setOpenGuestDropdown(false); }}
              >
                Check-In
              </label>
              <div
                className="text-xs font-black mt-0.5 flex justify-between items-center whitespace-nowrap text-white cursor-pointer"
                onClick={() => { setOpenCheckIn(!openCheckIn); setOpenCheckOut(false); setOpenGuestDropdown(false); }}
              >
                <span>{headerCheckIn ? toISODate(headerCheckIn) : '--'}</span>
                <CalendarIcon className="w-3.5 h-3.5 text-orange-500 ml-1" />
              </div>
              {openCheckIn && (
                <div className="absolute top-full left-0 mt-2 p-2 bg-white shadow-2xl rounded-xl z-30 text-gray-900">
                  <DayPicker
                    mode="single"
                    selected={headerCheckIn}
                    onSelect={(d) => { setHeaderCheckIn(d); setOpenCheckIn(false); }}
                    disabled={{ before: new Date() }}
                  />
                </div>
              )}
            </div>

            {/* Check-Out */}
            <div className="flex-1 min-w-[140px] bg-[#1E2A38] px-3 py-1.5 rounded h-[54px] flex flex-col justify-center relative">
              <label
                className="block text-[9px] uppercase text-orange-500 tracking-wider font-bold cursor-pointer"
                onClick={() => { setOpenCheckOut(!openCheckOut); setOpenCheckIn(false); setOpenGuestDropdown(false); }}
              >
                Check-Out
              </label>
              <div
                className="text-xs font-black mt-0.5 flex justify-between items-center whitespace-nowrap text-white cursor-pointer"
                onClick={() => { setOpenCheckOut(!openCheckOut); setOpenCheckIn(false); setOpenGuestDropdown(false); }}
              >
                <span>{headerCheckOut ? toISODate(headerCheckOut) : '--'}</span>
                <CalendarIcon className="w-3.5 h-3.5 text-orange-500 ml-1" />
              </div>
              {openCheckOut && (
                <div className="absolute top-full right-0 mt-2 p-2 bg-white shadow-2xl rounded-xl z-30 text-gray-900">
                  <DayPicker
                    mode="single"
                    selected={headerCheckOut}
                    onSelect={(d) => { setHeaderCheckOut(d); setOpenCheckOut(false); }}
                    disabled={{ before: headerCheckIn || new Date() }}
                  />
                </div>
              )}
            </div>

            {/* Rooms & Guests */}
            <div className="flex-1 min-w-[140px] bg-[#1E2A38] px-3 py-1.5 rounded h-[54px] flex flex-col justify-center relative">
              <label className="block text-[9px] uppercase text-gray-400 tracking-wider font-medium cursor-pointer"
                onClick={() => { setOpenGuestDropdown(!openGuestDropdown); setOpenCheckIn(false); setOpenCheckOut(false); }}>
                Rooms & Guests
              </label>
              <div
                className="flex justify-between items-center mt-0.5 cursor-pointer"
                onClick={() => { setOpenGuestDropdown(!openGuestDropdown); setOpenCheckIn(false); setOpenCheckOut(false); }}
              >
                <span className="text-xs font-black text-white">
                  {headerRooms} Room{headerRooms > 1 ? 's' : ''} • {headerAdults} Adult{headerAdults > 1 ? 's' : ''}
                </span>
                <ChevronDown className="w-3 h-3 text-gray-400" />
              </div>

              {openGuestDropdown && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-white shadow-2xl rounded-xl z-30 p-3 text-gray-900">
                  <div className="mb-3">
                    <label className="text-xs font-bold text-gray-700 block mb-2">Rooms</label>
                    <div className="flex items-center gap-2">
                      <button onClick={() => setHeaderRooms(Math.max(1, headerRooms - 1))} className="bg-orange-500 text-white w-6 h-6 rounded">-</button>
                      <span className="text-sm font-bold flex-1 text-center">{headerRooms}</span>
                      <button onClick={() => setHeaderRooms(headerRooms + 1)} className="bg-orange-500 text-white w-6 h-6 rounded">+</button>
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="text-xs font-bold text-gray-700 block mb-2">Adults</label>
                    <div className="flex items-center gap-2">
                      <button onClick={() => setHeaderAdults(Math.max(1, headerAdults - 1))} className="bg-orange-500 text-white w-6 h-6 rounded">-</button>
                      <span className="text-sm font-bold flex-1 text-center">{headerAdults}</span>
                      <button onClick={() => setHeaderAdults(headerAdults + 1)} className="bg-orange-500 text-white w-6 h-6 rounded">+</button>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-2">Children</label>
                    <div className="flex items-center gap-2">
                      <button onClick={() => setHeaderChildren(Math.max(0, headerChildren - 1))} className="bg-orange-500 text-white w-6 h-6 rounded">-</button>
                      <span className="text-sm font-bold flex-1 text-center">{headerChildren}</span>
                      <button onClick={() => setHeaderChildren(headerChildren + 1)} className="bg-orange-500 text-white w-6 h-6 rounded">+</button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Search Button */}
            <button
              onClick={handleHeaderSearch}
              className="bg-gradient-to-r from-[#0B1523] to-orange-500 text-white text-base rounded px-6 h-[54px] ml-1.5 font-bold uppercase tracking-wider hover:opacity-95 transition-all cursor-pointer"
            >
              Search
            </button>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 py-6 flex gap-6">

          {/* Sidebar Filters */}
          <aside className="w-1/4 bg-white p-5 rounded-lg shadow-sm h-fit hidden md:block sticky top-24 self-start max-h-[calc(100vh-100px)] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold tracking-wide">FILTERS</h2>
              <button onClick={resetFilters} className="text-xs font-semibold text-orange-500 uppercase cursor-pointer">Reset</button>
            </div>

            <div className="mb-6">
              <h3 className="text-sm font-bold mb-2">Max Price / Night</h3>
              <div className="text-xs text-gray-500 mb-2">Up to ₹ {maxPrice.toLocaleString()}</div>
              <input
                type="range"
                className="w-full accent-orange-500"
                min="1000"
                max="50000"
                step="500"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
              />
            </div>

            <hr className="my-4 border-gray-100" />

            <div className="mb-6">
              <h3 className="text-sm font-bold mb-3">Star Rating</h3>
              <div className="space-y-2 text-sm">
                {[5, 4, 3, 2, 1, 0].map((star) => (
                  <label key={star} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      className="accent-orange-500"
                      checked={selectedStars.includes(star)}
                      onChange={() => toggleStar(star)}
                    />
                    {star > 0 ? (
                      <span className="text-orange-400">{'★'.repeat(star)}</span>
                    ) : (
                      <span>0 Stars</span>
                    )}
                    {star > 0 && <span className="ml-1">{star} Star{star > 1 ? 's' : ''}</span>}
                  </label>
                ))}
              </div>
            </div>

            <hr className="my-4 border-gray-100" />

            <div className="mb-6">
              <h3 className="text-sm font-bold mb-3">Property Type</h3>
              <div className="space-y-2 text-sm max-h-40 overflow-y-auto pr-1">
                {propertyTypeCounts.length === 0 && (
                  <p className="text-xs text-gray-400">It will appear here after you search</p>
                )}
                {propertyTypeCounts.map(({ type, count }) => (
                  <label key={type} className="flex items-center justify-between cursor-pointer">
                    <span className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        className="accent-orange-500"
                        checked={selectedPropertyTypes.includes(type)}
                        onChange={() => togglePropertyType(type)}
                      />
                      {type}
                    </span>
                    <span className="text-gray-400">{count}</span>
                  </label>
                ))}
              </div>
            </div>

            <hr className="my-4 border-gray-100" />

            <div className="mb-6">
              <h3 className="text-sm font-bold mb-3">Amenities</h3>
              <div className="space-y-2 text-sm max-h-48 overflow-y-auto pr-1">
                {amenityCounts.length === 0 && (
                  <p className="text-xs text-gray-400">Results will appear here after you search.</p>
                )}
                {amenityCounts.map(({ type, count }) => (
                  <label key={type} className="flex items-center justify-between cursor-pointer">
                    <span className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        className="accent-orange-500"
                        checked={selectedAmenities.includes(type)}
                        onChange={() => toggleAmenity(type)}
                      />
                      <span className="truncate max-w-[150px]" title={type}>{type}</span>
                    </span>
                    <span className="text-gray-400">{count}</span>
                  </label>
                ))}
              </div>
            </div>
          </aside>

          {/* Hotel List Section */}
          <section className="w-full md:w-3/4 space-y-4">
            <div className="flex justify-between items-center text-sm">
              <p className="text-xs text-gray-500">{visibleHotels.length} hotels found</p>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="border border-gray-200 rounded p-1.5 bg-white text-xs font-semibold outline-none"
                >
                  <option value="recommended">Recommended</option>
                  <option value="price_low">Price: Low to High</option>
                  <option value="rating">Star Rating</option>
                </select>
              </div>
            </div>

            {loading && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-10 text-center text-gray-500">
               Loading hotels...
              </div>
            )}

            {!loading && error && (
              <div className="bg-white rounded-lg shadow-sm border border-red-100 p-10 text-center text-red-500">
                {error}
              </div>
            )}

            {!loading && !error && visibleHotels.length === 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-10 text-center text-gray-500">
               No hotels found for this city.
              </div>
            )}

            {/* UPDATED: Passing traceId into HotelCard */}
            {!loading && !error && visibleHotels.map((hotel, idx) => (
              <HotelCard
                key={hotel.HotelCode || idx}
                hotel={hotel}
                traceId={traceId}
                srdvType={srdvType}
                isExpanded={expandedId === (hotel.HotelCode || idx)}
                onToggle={() => setExpandedId(expandedId === (hotel.HotelCode || idx) ? null : (hotel.HotelCode || idx))}
              />
            ))}
          </section>
        </main>
      </div>
      <Footer />
    </>
  );
}