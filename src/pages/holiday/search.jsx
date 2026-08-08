"use client";
import { useRouter } from 'next/router';
import { useEffect, useState, useMemo, useRef } from 'react';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import LocationSearchBox from '@/components/LocationSearchBox'; // apna actual path check kar lena

function toISODate(d) {
  if (!d) return '';
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export default function HolidaySearchPage() {
  const router = useRouter();
  const { destination, startDate, guests } = router.query;

  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [maxPrice, setMaxPrice] = useState(100000);
  const [sortBy, setSortBy] = useState('recommended');

  // ---- Header (interactive) state ----
const [headerFrom, setHeaderFrom] = useState(null);
const [headerDestination, setHeaderDestination] = useState(null);

  // Jab page pehli baar load ho, URL params se header ko prefill karo
useEffect(() => {
  if (!router.isReady) return;
  if (destination) {
    setHeaderDestination({ name: destination, code: destination });
  }
}, [router.isReady, destination]);

  // ---- Fetch holidays jab bhi destination badle ----
  useEffect(() => {
    if (!router.isReady) return;
    if (!destination) return;

    async function fetchHolidays() {
      try {
        setLoading(true);
        setError('');

        const res = await fetch('/api/holidays/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            destination: destination,
            limit: 50
          })
        });

        if (!res.ok) {
          const body = await res.text();
          console.error('API status:', res.status, 'body:', body);
          throw new Error('Failed to fetch');
        }

        const data = await res.json();

        if (!data.success) {
          setError(data.message || 'Holidays fetch nahi ho paaye. Baad me try karo.');
          setHolidays([]);
          return;
        }

        setHolidays(data.results || []);
      } catch (err) {
        console.error('fetchHolidays error:', err);
        setError('Holidays fetch nahi ho paaye. Baad me try karo.');
        setHolidays([]);
      } finally {
        setLoading(false);
      }
    }

    fetchHolidays();
  }, [router.isReady, destination]);

  const visibleHolidays = useMemo(() => {
    let result = [...holidays];
    result = result.filter((h) => Number(h.offer_price) <= maxPrice);

    if (sortBy === 'price_low') {
      result.sort((a, b) => Number(a.offer_price) - Number(b.offer_price));
    } else if (sortBy === 'price_high') {
      result.sort((a, b) => Number(b.offer_price) - Number(a.offer_price));
    }

    return result;
  }, [holidays, maxPrice, sortBy]);

  const handleBooking = (slug) => {
    router.push(`/holiday/${slug}`);
  };

  // ---- Header ka "Search" button dabne par naya search trigger karo ----
function handleHeaderSearch() {
  if (!headerDestination) {
    alert('Kripya destination select karein.');
    return;
  }

  const query = new URLSearchParams({
    destination: headerDestination.name,
  });

  router.push(`/holiday/search?${query.toString()}`);
}

  return (
    <div className="bg-[#F4F6F9] font-sans antialiased text-gray-800 min-h-screen">

{/* ---- Interactive Header ---- */}
<header className="bg-[#0B1523] text-white p-3 sticky top-0 z-50">
  <div className="max-w-7xl mx-auto flex flex-wrap items-center gap-2.5">

    {/* From City */}
    <div className="flex-1 min-w-[180px] bg-[#1E2A38] px-3 py-1.5 rounded h-[54px] flex flex-col justify-center relative">
      <LocationSearchBox
        label="From City"
        value={headerFrom}
        placeholder="Noida"
        onSelect={setHeaderFrom}
        showAllSections={false}
        citySearchApi="/api/cities/airports"
        theme="dark"
      />
    </div>

    {/* To City */}
    <div className="flex-1 min-w-[180px] bg-[#1E2A38] px-3 py-1.5 rounded h-[54px] flex flex-col justify-center relative">
      <LocationSearchBox
        label="To City/Country/Category"
        value={headerDestination}
        placeholder="Goa"
        onSelect={setHeaderDestination}
        showAllSections={false}
        citySearchApi="/api/cities/holidays"
        theme="dark"
      />
    </div>

    {/* Search Button */}
    <button
      onClick={handleHeaderSearch}
      className="bg-gradient-to-r from-[#0B1523] to-orange-500 text-white text-base rounded px-8 h-[54px] font-bold uppercase tracking-wider hover:opacity-95 transition-all"
    >
      Search
    </button>
  </div>
</header>

      <main className="max-w-7xl mx-auto px-4 py-6 flex gap-6">
        {/* Sidebar Filters */}
        <aside className="w-1/4 bg-white p-5 rounded-lg shadow-sm h-fit hidden md:block">
          <h2 className="text-lg font-bold tracking-wide mb-6">FILTERS</h2>

          <div className="mb-6">
            <h3 className="text-sm font-bold mb-2">Max Price</h3>
            <div className="text-xs text-gray-500 mb-2">Up to ₹ {maxPrice.toLocaleString('en-IN')}</div>
            <input
              type="range"
              className="w-full accent-orange-500"
              min="1000"
              max="100000"
              step="1000"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
            />
          </div>

          <hr className="my-4 border-gray-100" />

          <div>
            <h3 className="text-sm font-bold mb-3">Sort By</h3>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded text-sm"
            >
              <option value="recommended">Recommended</option>
              <option value="price_low">Price: Low to High</option>
              <option value="price_high">Price: High to Low</option>
            </select>
          </div>
        </aside>

        {/* Main Content */}
        <section className="flex-1">
          {loading && (
            <div className="bg-white rounded-lg p-8 text-center">
              <p className="text-gray-600">Holidays ko search kar rahe hain...</p>
            </div>
          )}

          {error && !loading && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
              {error}
            </div>
          )}

          {!loading && visibleHolidays.length > 0 && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600 mb-4">
                {visibleHolidays.length} holiday package{visibleHolidays.length > 1 ? 's' : ''} found
              </p>

              {visibleHolidays.map((holiday) => (
                <div
                  key={holiday.id}
                  className="bg-white rounded-lg shadow hover:shadow-lg transition overflow-hidden"
                >
                  <div className="flex flex-col md:flex-row">
                    <div className="md:w-1/3 h-64 md:h-auto bg-gray-200 overflow-hidden">
                      {holiday.photo && (
                        <img
                          src={`https://makemybharatyatra.com/uploads/packages/${holiday.photo}`}
                          alt={holiday.package_name}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>

                    <div className="flex-1 p-6 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="text-xl font-bold text-gray-900">{holiday.package_name}</h3>
                            <div className="text-sm text-gray-600 line-clamp-1">
                              {holiday.city_name || destination}
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-3 text-xs text-gray-600 my-3">
                          <span className="bg-gray-100 px-3 py-1 rounded">{holiday.duration}</span>
                        </div>

                        <div
                          className="text-sm text-gray-700 line-clamp-2"
                          dangerouslySetInnerHTML={{ __html: holiday.short_description }}
                        />
                      </div>

                      <div className="flex items-center justify-between mt-4 pt-4 border-t">
                        <div>
                          {holiday.ragular_price && (
                            <p className="text-sm line-through text-gray-500">
                              ₹{Number(holiday.ragular_price).toLocaleString('en-IN')}
                            </p>
                          )}
                          <p className="text-2xl font-bold text-green-600">
                            ₹{Number(holiday.offer_price).toLocaleString('en-IN')}
                            <span className="text-sm text-gray-600"> / Person</span>
                          </p>
                        </div>
                        <button
                          onClick={() => handleBooking(holiday.slug)}
                          className="bg-gradient-to-r from-orange-400 to-pink-500 text-white px-6 py-2 rounded-lg font-semibold hover:opacity-90 transition"
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && visibleHolidays.length === 0 && !error && (
            <div className="bg-white rounded-lg p-8 text-center">
              <p className="text-gray-600">Is criteria ke hisaab se koi holiday nahi mila.</p>
              <p className="text-sm text-gray-500 mt-2">Kuch aur destinations try karo ya filter ko adjust karo.</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}