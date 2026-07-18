import { useRouter } from 'next/router';
import { useEffect, useState, useMemo } from 'react';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Calendar as CalendarIcon, ChevronDown } from 'lucide-react';

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

const indianCities = [
  "Delhi", "Mumbai", "Bengaluru", "Chennai", "Kolkata", "Hyderabad",
  "Pune", "Jaipur", "Ahmedabad", "Lucknow", "Chandigarh", "Goa", "Agra",
  "Varanasi", "Patna", "Bhopal", "Indore", "Nagpur", "Surat", "Amritsar",
];

export default function HotelsPage() {
  const router = useRouter();
  const { cityId, cityName, checkin, nights, rooms, adults, children } = router.query;

  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedId, setExpandedId] = useState(null);

  // Filters
  const [maxPrice, setMaxPrice] = useState(50000);
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState('recommended');

  // Header search states
  const [headerCity, setHeaderCity] = useState(cityName || '');
  const [headerCheckIn, setHeaderCheckIn] = useState(null);
  const [headerCheckOut, setHeaderCheckOut] = useState(null);
  const [headerRooms, setHeaderRooms] = useState(Number(rooms) || 1);
  const [headerAdults, setHeaderAdults] = useState(Number(adults) || 2);
  const [headerChildren, setHeaderChildren] = useState(Number(children) || 0);

  const [openCheckIn, setOpenCheckIn] = useState(false);
  const [openCheckOut, setOpenCheckOut] = useState(false);
  const [openGuestDropdown, setOpenGuestDropdown] = useState(false);

  // Parse initial dates from query
  useEffect(() => {
    if (checkin && !isNaN(new Date(checkin).getTime())) {
      setHeaderCheckIn(new Date(checkin));
      
      if (nights) {
        const checkOutDate = new Date(checkin);
        checkOutDate.setDate(checkOutDate.getDate() + Number(nights));
        setHeaderCheckOut(checkOutDate);
      }
    }
  }, [checkin, nights]);

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
      } catch (err) {
        console.error('fetchHotels error:', err);
        setError('Hotels fetch nahi ho paaye. Baad me try karo.');
      } finally {
        setLoading(false);
      }
    }

    fetchHotels();
  }, [router.isReady, cityId, checkin, nights, rooms, adults, children]);

  const visibleHotels = useMemo(() => {
    let result = [...hotels];

    result = result.filter((h) => Number(h.Price?.OfferedPrice || h.Price || 0) <= maxPrice);
    result = result.filter((h) => Number(h.StarRating || 0) >= minRating);

    if (sortBy === 'price_low') {
      result.sort((a, b) => Number(a.Price?.OfferedPrice || a.Price || 0) - Number(b.Price?.OfferedPrice || b.Price || 0));
    } else if (sortBy === 'rating') {
      result.sort((a, b) => Number(b.StarRating || 0) - Number(a.StarRating || 0));
    }

    return result;
  }, [hotels, maxPrice, minRating, sortBy]);

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
      alert('चेक-आउट तारीख चेक-इन से बाद की होनी चाहिए');
      return;
    }

    const checkinStr = toISODate(headerCheckIn);
    
    router.push(
      `/hotels?cityName=${encodeURIComponent(headerCity)}&checkin=${checkinStr}&nights=${nightsDiff}&rooms=${headerRooms}&adults=${headerAdults}&children=${headerChildren}`
    );
  }

  return (
    <>
      <Header />
      <div className="bg-[#F4F6F9] font-sans antialiased text-gray-800 min-h-screen">

        {/* Interactive Header */}
        <header className="bg-[#0B1523] text-white p-3 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2.5">
            
            {/* City */}
            <div className="flex-1 min-w-[140px] bg-[#1E2A38] px-3 py-1.5 rounded h-[54px] flex flex-col justify-center relative">
              <label className="block text-[9px] uppercase text-orange-500 tracking-wider font-bold">City</label>
              <select
                value={headerCity}
                onChange={(e) => setHeaderCity(e.target.value)}
                className="bg-transparent text-white text-xs font-bold mt-0.5 outline-none cursor-pointer text-gray-200 w-full h-full"
              >
                <option value="">Select City</option>
                {indianCities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>

            {/* Check-In */}
            <div className="flex-1 min-w-[140px] bg-[#1E2A38] px-3 py-1.5 rounded h-[54px] flex flex-col justify-center relative">
              <label
                className="block text-[9px] uppercase text-orange-500 tracking-wider font-bold cursor-pointer"
                onClick={() => { setOpenCheckIn(!openCheckIn); setOpenCheckOut(false); }}
              >
                Check-In
              </label>
              <div
                className="text-xs font-black mt-0.5 flex justify-between items-center whitespace-nowrap text-white cursor-pointer"
                onClick={() => { setOpenCheckIn(!openCheckIn); setOpenCheckOut(false); }}
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
                onClick={() => { setOpenCheckOut(!openCheckOut); setOpenCheckIn(false); }}
              >
                Check-Out
              </label>
              <div
                className="text-xs font-black mt-0.5 flex justify-between items-center whitespace-nowrap text-white cursor-pointer"
                onClick={() => { setOpenCheckOut(!openCheckOut); setOpenCheckIn(false); }}
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
                onClick={() => setOpenGuestDropdown(!openGuestDropdown)}>
                Rooms & Guests
              </label>
              <div
                className="flex justify-between items-center mt-0.5 cursor-pointer"
                onClick={() => setOpenGuestDropdown(!openGuestDropdown)}
              >
                <span className="text-xs font-black text-white">
                  {headerRooms} Room{headerRooms > 1 ? 's' : ''} • {headerAdults} Adult{headerAdults > 1 ? 's' : ''}
                </span>
                <ChevronDown className="w-3 h-3 text-gray-400" />
              </div>

              {openGuestDropdown && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-white shadow-2xl rounded-xl z-30 p-3">
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
              className="bg-gradient-to-r from-[#0B1523] to-orange-500 text-white text-base rounded px-6 h-[54px] ml-1.5 font-bold uppercase tracking-wider hover:opacity-95 transition-all"
            >
              Search
            </button>
          </div>
        </header>

      <main className="max-w-7xl mx-auto px-4 py-6 flex gap-6">

        <aside className="w-1/4 bg-white p-5 rounded-lg shadow-sm h-fit hidden md:block">
          <h2 className="text-lg font-bold tracking-wide mb-6">FILTERS</h2>

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

          <div>
            <h3 className="text-sm font-bold mb-3">Star Rating</h3>
            <div className="space-y-2 text-sm">
              {[5, 4, 3, 2, 1].map((star) => (
                <label key={star} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="minRating"
                    className="accent-orange-500"
                    checked={minRating === star}
                    onChange={() => setMinRating(star)}
                  />
                  {star}+ Star
                </label>
              ))}
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="minRating"
                  className="accent-orange-500"
                  checked={minRating === 0}
                  onChange={() => setMinRating(0)}
                />
                Any
              </label>
            </div>
          </div>
        </aside>

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
              Hotels load ho rahe hain...
            </div>
          )}

          {!loading && error && (
            <div className="bg-white rounded-lg shadow-sm border border-red-100 p-10 text-center text-red-500">
              {error}
            </div>
          )}

          {!loading && !error && visibleHotels.length === 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-10 text-center text-gray-500">
              Is city ke liye koi hotel nahi mila.
            </div>
          )}

          {!loading && !error && visibleHotels.map((hotel, idx) => (
            <HotelCard
              key={hotel.HotelCode || idx}
              hotel={hotel}
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

function HotelCard({ hotel, isExpanded, onToggle }) {
  // TODO: field names guessed hain, actual API response se confirm karke fix karenge
  const name = hotel.HotelName || 'Hotel';
  const price = hotel.Price?.OfferedPrice || hotel.Price || 0;
  const rating = hotel.StarRating || 0;
  const address = hotel.Address || hotel.HotelAddress || '';
  const image = hotel.HotelPicture || hotel.Images?.[0] || null;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden mb-3">
      <div className="p-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4 min-w-[220px]">
          {image ? (
            <img src={image} alt={name} className="w-20 h-20 object-cover rounded" />
          ) : (
            <div className="w-20 h-20 bg-gray-100 rounded flex items-center justify-center text-gray-400 text-xs">
              No Image
            </div>
          )}
          <div>
            <div className="font-bold text-blue-900 text-base">{name}</div>
            <div className="text-xs text-gray-400 mt-0.5">{address}</div>
            <div className="text-xs text-orange-500 font-semibold mt-1">
              {'★'.repeat(Math.round(rating))} {rating > 0 ? `(${rating})` : ''}
            </div>
          </div>
        </div>

        <div className="text-right">
          <div className="text-lg font-bold text-gray-900">₹ {Number(price).toLocaleString()}</div>
          <div className="text-[10px] text-gray-400">per night + taxes</div>
        </div>

        <div className="flex flex-col items-end gap-1">
          <button className="bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold px-5 py-2 rounded uppercase tracking-wider transition-colors">
            View Deal
          </button>
          <button
            onClick={onToggle}
            className="text-[10px] text-orange-500 font-bold mt-1 flex items-center gap-0.5"
          >
            {isExpanded ? 'Hide' : 'View'} Details
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="p-5 bg-gray-50 text-xs text-gray-600 border-t border-gray-100">
          <pre className="whitespace-pre-wrap break-words">{JSON.stringify(hotel, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}