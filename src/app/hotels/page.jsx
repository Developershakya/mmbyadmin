"use client";

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Calendar as CalendarIcon, MapPin, BedDouble, Utensils, Star, SlidersHorizontal, Sparkles, ChevronRight } from 'lucide-react';

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

function extractAmenities(rawAmenities) {
  if (!rawAmenities) return [];

  const list = [];
  const parseItem = (item) => {
    if (!item) return;
    if (typeof item === 'string') {
      list.push(item.trim());
    } else if (Array.isArray(item)) {
      item.forEach(parseItem);
    } else if (typeof item === 'object') {
      if (item.FacilitiesNames) parseItem(item.FacilitiesNames);
      else if (item.Name) parseItem(item.Name);
      else if (item.FacilityName) parseItem(item.FacilityName);
      else if (item.AmenityName) parseItem(item.AmenityName);
      else {
        Object.values(item).forEach((val) => {
          if (typeof val === 'string' || Array.isArray(val)) parseItem(val);
        });
      }
    }
  };

  parseItem(rawAmenities);
  return Array.from(new Set(list)).filter(Boolean);
}

// const indianCities = [
//   'Delhi', 'Mumbai', 'Bengaluru', 'Chennai', 'Kolkata', 'Hyderabad',
//   'Pune', 'Jaipur', 'Ahmedabad', 'Lucknow', 'Chandigarh', 'Goa', 'Agra',
//   'Varanasi', 'Patna', 'Bhopal', 'Indore', 'Nagpur', 'Surat', 'Amritsar',
// ];

function HotelCard({ hotel, traceId, srdvType }) {
  const router = useRouter();

  const name = hotel.HotelName || hotel.Name || 'Hotel Name Unavailable';
  const address = hotel.Address || hotel.HotelAddress || 'Address unavailable';
  const rating = Number(hotel.StarRating || 0);
  const price = Number(hotel.Price?.OfferedPrice || hotel.Price?.PublishedPrice || hotel.Price || 0);
  const image = hotel.HotelPicture || hotel.Images?.[0] || hotel.Image || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=900';
  const propertyType = hotel.PropertyType || hotel.HotelCategory || 'HOTEL';
  const roomType = hotel.RoomTypeName || hotel.RoomType || hotel.Rooms?.[0]?.RoomTypeName || 'Standard Room';
  const mealType = hotel.Inclusion || hotel.MealType || hotel.Inclusions?.[0] || 'ROOM ONLY';
  const amenitiesList = extractAmenities(hotel.Amenities || hotel.Facilities);

  const handleViewDetails = () => {
    const params = new URLSearchParams({
      traceId: traceId || hotel.TraceId || '',
      resultIndex: hotel.ResultIndex || hotel.Index || '1',
      hotelCode: hotel.HotelCode || hotel.Code || '',
      srdvType: srdvType || '',
      srdvIndex: hotel.SrdvIndex || '',
    });
    router.push(`/hotels/details?${params.toString()}`);
  };

  return (
    <article className="group overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_18px_40px_rgba(15,23,42,0.06)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_26px_48px_rgba(15,23,42,0.10)]">
      <div className="flex flex-col lg:flex-row">
        <div className="relative lg:w-[290px]">
          <img src={image} alt={name} className="h-56 w-full object-cover lg:h-full" />
          <div className="absolute left-4 top-4 flex items-center gap-2">
            <span className="rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-700 shadow-sm">
              {propertyType}
            </span>
          </div>
        </div>

        <div className="flex flex-1 flex-col p-5 md:p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-xl font-bold text-slate-900">{name}</h3>
                {rating > 0 && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-1 text-[11px] font-bold text-amber-700">
                    <Star className="h-3.5 w-3.5 fill-current" /> {rating}
                  </span>
                )}
              </div>

              <div className="flex items-start gap-2 text-sm text-slate-500">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-orange-500" />
                <span>{address}</span>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
                <span className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-2.5 py-1.5 font-medium text-blue-700">
                  <BedDouble className="h-4 w-4" /> {roomType}
                </span>
                <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-2.5 py-1.5 font-medium text-emerald-700">
                  <Utensils className="h-4 w-4" /> {mealType}
                </span>
              </div>
            </div>

            <div className="md:text-right">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Starting from</p>
              <div className="mt-1 flex items-end gap-2 md:justify-end">
                <span className="text-3xl font-black text-slate-900">₹{price.toLocaleString()}</span>
                <span className="pb-1 text-xs text-slate-500">/ night</span>
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {amenitiesList.slice(0, 5).map((amenity, index) => (
              <span key={`${amenity}-${index}`} className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-600">
                {amenity}
              </span>
            ))}
            {amenitiesList.length > 5 && (
              <span className="rounded-full bg-slate-900 px-2.5 py-1 text-[11px] font-semibold text-white">
                +{amenitiesList.length - 5} more
              </span>
            )}
          </div>

          <div className="mt-5 flex flex-col gap-3 border-t border-slate-200 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-xs text-slate-500">
              {hotel.HotelDescription ? hotel.HotelDescription.slice(0, 120) : 'Comfortable stay with curated amenities and seamless booking support.'}
            </div>
            <button
              onClick={handleViewDetails}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-orange-500 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-orange-500/20 transition hover:bg-orange-600"
            >
              View Details <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

export default function HotelsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const cityId = searchParams.get('cityId');
  const cityName = searchParams.get('cityName');
  const checkin = searchParams.get('checkin');
  const nights = searchParams.get('nights');
  const rooms = searchParams.get('rooms');
  const adults = searchParams.get('adults');
  const children = searchParams.get('children');

  const [hotels, setHotels] = useState([]);
  const [traceId, setTraceId] = useState('');
  const [srdvType, setSrdvType] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [maxPrice, setMaxPrice] = useState(50000);
  const [selectedStars, setSelectedStars] = useState([]);
  const [selectedPropertyTypes, setSelectedPropertyTypes] = useState([]);
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [sortBy, setSortBy] = useState('recommended');

  const [headerCity, setHeaderCity] = useState('');
  const [selectedCityId, setSelectedCityId] = useState(cityId || '');
  const [headerCheckIn, setHeaderCheckIn] = useState(null);
  const [headerCheckOut, setHeaderCheckOut] = useState(null);
  const [headerRooms, setHeaderRooms] = useState(1);
  const [headerAdults, setHeaderAdults] = useState(2);
  const [headerChildren, setHeaderChildren] = useState(0);

  const [openCheckIn, setOpenCheckIn] = useState(false);
  const [openCheckOut, setOpenCheckOut] = useState(false);
  const [guestSelectorOpen, setGuestSelectorOpen] = useState(false);

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
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  }

  function resetFilters() {
    setMaxPrice(50000);
    setSelectedStars([]);
    setSelectedPropertyTypes([]);
    setSelectedAmenities([]);
  }

  useEffect(() => {
    setSelectedCityId(cityId || '');
  }, [cityId]);

  useEffect(() => {
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
  }, [cityName, checkin, nights, rooms, adults, children]);

  async function resolveCityIdForName(cityValue) {
    const cleanName = (cityValue || '').trim();
    if (!cleanName) return '';

    try {
      const response = await fetch(`/api/cities/hotel?query=${encodeURIComponent(cleanName)}`);
      const rows = await response.json();

      if (!Array.isArray(rows) || rows.length === 0) return '';

      const match = rows.find((row) => {
        const destination = String(row.Destination || '').toLowerCase();
        return destination === cleanName.toLowerCase() || destination.includes(cleanName.toLowerCase());
      });

      if (match && match.cityid) {
        setSelectedCityId(String(match.cityid));
        return String(match.cityid);
      }
    } catch (error) {
      console.error('Resolve city id failed:', error);
    }

    return '';
  }

  useEffect(() => {
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
        if (data.srdvType) setSrdvType(data.srdvType);
      } catch (err) {
        console.error('fetchHotels error:', err);
        setError('Hotels fetch nahi ho paaye. Baad me try karo.');
      } finally {
        setLoading(false);
      }
    }

    fetchHotels();
  }, [cityId, checkin, nights, rooms, adults, children]);

  const propertyTypeCounts = useMemo(() => {
    const counts = {};
    hotels.forEach((h) => {
      const type = h.PropertyType || h.HotelCategory;
      if (!type) return;
      counts[type] = (counts[type] || 0) + 1;
    });
    return Object.entries(counts).map(([type, count]) => ({ type, count }));
  }, [hotels]);

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

  async function handleHeaderSearch() {
    if (!headerCity || !headerCheckIn || !headerCheckOut) {
      alert('Please fill in all required fields.');
      return;
    }

    const nightsDiff = Math.ceil((headerCheckOut - headerCheckIn) / (1000 * 60 * 60 * 24));
    if (nightsDiff <= 0) {
      alert('Check-out date must be after the check-in date.');
      return;
    }

    let resolvedCityId = selectedCityId || cityId || '';
    if (!resolvedCityId) {
      resolvedCityId = await resolveCityIdForName(headerCity);
    }

    if (!resolvedCityId) {
      alert('Please select a valid city.');
      return;
    }

    const params = new URLSearchParams({
      cityId: resolvedCityId,
      cityName: headerCity,
      checkin: toISODate(headerCheckIn),
      nights: String(nightsDiff),
      rooms: String(headerRooms),
      adults: String(headerAdults),
      children: String(headerChildren),
    });

    router.push(`/hotels?${params.toString()}`);
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-[#f3f6fb] text-slate-800">
        <header className="bg-[#0B1523] p-3 text-white sticky top-0 z-40">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2.5">
            <div className="flex-1 min-w-[140px] rounded-xl bg-[#1E2A38] px-3 py-1.5 h-[54px] flex flex-col justify-center relative">
              <label className="block text-[9px] uppercase tracking-[0.2em] text-orange-500 font-bold">City</label>
              <select
                value={headerCity}
                onChange={(e) => setHeaderCity(e.target.value)}
                className="mt-0.5 h-full w-full cursor-pointer bg-transparent text-xs font-bold text-gray-100 outline-none"
              >
                <option value="" className="text-slate-900">Select City</option>
                {indianCities.map((city) => (
                  <option key={city} value={city} className="text-slate-900">
                    {city}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex-1 min-w-[140px] rounded-xl bg-[#1E2A38] px-3 py-1.5 h-[54px] flex flex-col justify-center relative">
              <label
                className="block cursor-pointer text-[9px] uppercase tracking-[0.2em] text-orange-500 font-bold"
                onClick={() => { setOpenCheckIn(!openCheckIn); setOpenCheckOut(false); }}
              >
                Check-In
              </label>
              <div
                className="mt-0.5 flex cursor-pointer items-center justify-between text-xs font-black text-white"
                onClick={() => { setOpenCheckIn(!openCheckIn); setOpenCheckOut(false); }}
              >
                <span>{headerCheckIn ? toISODate(headerCheckIn) : '--'}</span>
                <CalendarIcon className="ml-1 h-3.5 w-3.5 text-orange-500" />
              </div>
              {openCheckIn && (
                <div className="absolute left-0 top-full z-30 mt-2 rounded-2xl bg-white p-2 shadow-2xl text-slate-900">
                  <DayPicker
                    mode="single"
                    selected={headerCheckIn}
                    onSelect={(d) => { setHeaderCheckIn(d); setOpenCheckIn(false); }}
                    disabled={{ before: new Date() }}
                  />
                </div>
              )}
            </div>

            <div className="flex-1 min-w-[140px] rounded-xl bg-[#1E2A38] px-3 py-1.5 h-[54px] flex flex-col justify-center relative">
              <label
                className="block cursor-pointer text-[9px] uppercase tracking-[0.2em] text-orange-500 font-bold"
                onClick={() => { setOpenCheckOut(!openCheckOut); setOpenCheckIn(false); }}
              >
                Check-Out
              </label>
              <div
                className="mt-0.5 flex cursor-pointer items-center justify-between text-xs font-black text-white"
                onClick={() => { setOpenCheckOut(!openCheckOut); setOpenCheckIn(false); }}
              >
                <span>{headerCheckOut ? toISODate(headerCheckOut) : '--'}</span>
                <CalendarIcon className="ml-1 h-3.5 w-3.5 text-orange-500" />
              </div>
              {openCheckOut && (
                <div className="absolute right-0 top-full z-30 mt-2 rounded-2xl bg-white p-2 shadow-2xl text-slate-900">
                  <DayPicker
                    mode="single"
                    selected={headerCheckOut}
                    onSelect={(d) => { setHeaderCheckOut(d); setOpenCheckOut(false); }}
                    disabled={{ before: headerCheckIn || new Date() }}
                  />
                </div>
              )}
            </div>

            <div className="flex-1 min-w-[140px] rounded-xl bg-[#1E2A38] px-3 py-1.5 h-[54px] flex flex-col justify-center relative">
              <label className="block text-[9px] uppercase tracking-[0.2em] text-orange-500 font-bold">Guests</label>
              <div
                className="mt-0.5 flex cursor-pointer items-center justify-between text-xs font-black text-white"
                onClick={() => setGuestSelectorOpen((prev) => !prev)}
              >
                <span>{headerRooms} Room · {headerAdults + headerChildren} Guests</span>
                <span className="text-[10px] text-orange-300">▼</span>
              </div>

              {guestSelectorOpen && (
                <div className="absolute right-0 top-full z-40 mt-2 w-[300px] rounded-2xl border border-slate-200 bg-white p-4 text-slate-900 shadow-2xl">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold">Rooms</span>
                      <div className="flex items-center gap-3">
                        <button type="button" onClick={() => setHeaderRooms((prev) => Math.max(1, prev - 1))} className="h-8 w-8 rounded-full border border-slate-300 text-lg font-semibold hover:border-orange-400 hover:text-orange-500">−</button>
                        <span className="min-w-[18px] text-center text-sm font-bold">{headerRooms}</span>
                        <button type="button" onClick={() => setHeaderRooms((prev) => Math.min(6, prev + 1))} className="h-8 w-8 rounded-full border border-slate-300 text-lg font-semibold hover:border-orange-400 hover:text-orange-500">+</button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold">Adults</span>
                      <div className="flex items-center gap-3">
                        <button type="button" onClick={() => setHeaderAdults((prev) => Math.max(1, prev - 1))} className="h-8 w-8 rounded-full border border-slate-300 text-lg font-semibold hover:border-orange-400 hover:text-orange-500">−</button>
                        <span className="min-w-[18px] text-center text-sm font-bold">{headerAdults}</span>
                        <button type="button" onClick={() => setHeaderAdults((prev) => Math.min(12, prev + 1))} className="h-8 w-8 rounded-full border border-slate-300 text-lg font-semibold hover:border-orange-400 hover:text-orange-500">+</button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold">Children</span>
                      <div className="flex items-center gap-3">
                        <button type="button" onClick={() => setHeaderChildren((prev) => Math.max(0, prev - 1))} className="h-8 w-8 rounded-full border border-slate-300 text-lg font-semibold hover:border-orange-400 hover:text-orange-500">−</button>
                        <span className="min-w-[18px] text-center text-sm font-bold">{headerChildren}</span>
                        <button type="button" onClick={() => setHeaderChildren((prev) => Math.min(8, prev + 1))} className="h-8 w-8 rounded-full border border-slate-300 text-lg font-semibold hover:border-orange-400 hover:text-orange-500">+</button>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setGuestSelectorOpen(false)}
                    className="mt-4 w-full rounded-full bg-orange-500 px-4 py-2 text-sm font-bold text-white hover:bg-orange-600"
                  >
                    Apply
                  </button>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={handleHeaderSearch}
              className="bg-gradient-to-r from-[#0B1523] to-orange-500 text-white text-base rounded px-6 h-[54px] ml-1.5 font-bold uppercase tracking-wider hover:opacity-95 transition-all cursor-pointer"
            >
              Search
            </button>
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-7 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-orange-500">Explore stays</p>
              <h1 className="mt-1 text-3xl font-black text-slate-900">{cityName || 'Popular Hotels'}</h1>
            </div>
            <div className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm">
              {loading ? 'Searching...' : `${visibleHotels.length} properties found`}
            </div>
          </div>

          <div className="grid gap-6 xl:grid-cols-[280px_minmax(0,1fr)]">
            <aside className="space-y-5">
              <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <SlidersHorizontal className="h-4 w-4 text-orange-500" />
                    <h2 className="text-lg font-bold text-slate-900">Filters</h2>
                  </div>
                  <button onClick={resetFilters} className="text-xs font-semibold text-orange-500">Reset</button>
                </div>

                <div className="space-y-5">
                  <div>
                    <label className="mb-3 block text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Price per night</label>
                    <input
                      type="range"
                      min="1000"
                      max="50000"
                      step="500"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(Number(e.target.value))}
                      className="w-full accent-orange-500"
                    />
                    <div className="mt-2 flex items-center justify-between text-sm text-slate-600">
                      <span>₹1,000</span>
                      <span className="font-bold text-slate-900">₹{maxPrice.toLocaleString()}</span>
                    </div>
                  </div>

                  <div>
                    <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Star rating</p>
                    <div className="flex flex-wrap gap-2">
                      {[3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => toggleStar(star)}
                          className={`rounded-full border px-3 py-2 text-sm font-semibold transition ${selectedStars.includes(star) ? 'border-orange-500 bg-orange-500 text-white' : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300'}`}
                        >
                          {star}+ Star
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Property type</p>
                    <div className="space-y-2">
                      {propertyTypeCounts.map(({ type, count }) => (
                        <button
                          key={type}
                          onClick={() => togglePropertyType(type)}
                          className={`flex w-full items-center justify-between rounded-xl border px-3 py-2 text-left text-sm transition ${selectedPropertyTypes.includes(type) ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300'}`}
                        >
                          <span>{type}</span>
                          <span className="rounded-full bg-white px-2 py-0.5 text-xs font-bold">{count}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Popular amenities</p>
                    <div className="flex flex-wrap gap-2">
                      {amenityCounts.slice(0, 8).map(({ type, count }) => (
                        <button
                          key={type}
                          onClick={() => toggleAmenity(type)}
                          className={`rounded-full border px-2.5 py-1.5 text-xs font-semibold transition ${selectedAmenities.includes(type) ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300'}`}
                        >
                          {type} ({count})
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </aside>

            <section className="space-y-5">
              <div className="rounded-[24px] border border-slate-200 bg-gradient-to-r from-orange-500 to-amber-400 p-[1px] shadow-sm">
                <div className="rounded-[23px] bg-slate-950 px-5 py-4 text-white">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                      <div className="rounded-full bg-white/10 p-2">
                        <Sparkles className="h-4 w-4 text-orange-300" />
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-slate-300">Recommended</p>
                        <p className="text-lg font-bold">Curated stays for your dates</p>
                      </div>
                    </div>

                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="rounded-full border border-white/15 bg-white/5 px-3 py-2 text-sm font-medium text-white outline-none"
                    >
                      <option value="recommended" className="text-slate-900">Recommended</option>
                      <option value="price_low" className="text-slate-900">Price: low to high</option>
                      <option value="rating" className="text-slate-900">Guest rating</option>
                    </select>
                  </div>
                </div>
              </div>

              {loading && (
                <div className="rounded-[24px] border border-slate-200 bg-white p-10 text-center text-slate-500 shadow-sm">
                  Loading hotels...
                </div>
              )}

              {!loading && error && (
                <div className="rounded-[24px] border border-red-200 bg-red-50 p-10 text-center text-red-600 shadow-sm">
                  {error}
                </div>
              )}

              {!loading && !error && visibleHotels.length === 0 && (
                <div className="rounded-[24px] border border-slate-200 bg-white p-10 text-center text-slate-500 shadow-sm">
                  No hotels match your filters. Please adjust filters and try again.
                </div>
              )}

              {!loading && !error && visibleHotels.map((hotel) => (
                <HotelCard key={`${hotel.HotelCode || hotel.Code || hotel.HotelName}-${hotel.ResultIndex}`} hotel={hotel} traceId={traceId} srdvType={srdvType} />
              ))}
            </section>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
}