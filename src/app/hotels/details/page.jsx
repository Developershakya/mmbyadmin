"use client";

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { MapPin, Star, Phone, ChevronLeft, ChevronRight, CheckCircle2, Wifi, Utensils, CarFront, Sparkles, ShieldCheck, ChevronDown } from 'lucide-react';

export default function HotelDetails() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const traceId = searchParams.get('traceId');
  const resultIndex = searchParams.get('resultIndex');
  const hotelCode = searchParams.get('hotelCode');
  const srdvType = searchParams.get('srdvType');
  const srdvIndex = searchParams.get('srdvIndex');

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [roomCategories, setRoomCategories] = useState([]);
  const [roomsLoading, setRoomsLoading] = useState(true);
  const [roomsError, setRoomsError] = useState('');
  const [freshIds, setFreshIds] = useState({ traceId: '', srdvType: '', srdvIndex: '', resultIndex: '' });

  useEffect(() => {
    if (!traceId || !hotelCode) return;

    async function fetchHotelDetailsThenRooms() {
      try {
        setLoading(true);
        const infoRes = await fetch('/api/hotels/info', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ traceId, resultIndex, hotelCode, srdvType, srdvIndex }),
        });
        const infoResult = await infoRes.json();
        if (infoResult.success) {
          setData(infoResult.hotelDetails);
        }
      } catch (err) {
        console.error('Error fetching hotel details:', err);
      } finally {
        setLoading(false);
      }

      try {
        setRoomsLoading(true);
        setRoomsError('');
        const roomRes = await fetch('/api/hotels/room', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ traceId, resultIndex, hotelCode, srdvType, srdvIndex }),
        });
        const roomResult = await roomRes.json();
        if (roomResult.success) {
          setRoomCategories(roomResult.roomCategories || []);
          setFreshIds({
            traceId: roomResult.traceId,
            srdvType: roomResult.srdvType,
            srdvIndex: roomResult.srdvIndex,
            resultIndex: roomResult.resultIndex,
          });
        } else {
          setRoomsError(roomResult.message || 'Rooms fetch nahi ho paayi.');
        }
      } catch (err) {
        console.error('Error fetching rooms:', err);
        setRoomsError('Rooms fetch karte waqt error aaya.');
      } finally {
        setRoomsLoading(false);
      }
    }

    fetchHotelDetailsThenRooms();
  }, [traceId, resultIndex, hotelCode, srdvType, srdvIndex]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100">
        <Header />
        <div className="mx-auto max-w-6xl py-20 text-center text-lg font-bold text-slate-600">Loading Hotel Details...</div>
        <Footer />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-slate-100">
        <Header />
        <div className="mx-auto max-w-6xl py-20 text-center text-lg font-bold text-red-500">Hotel information unavailable.</div>
        <Footer />
      </div>
    );
  }

  const hotelName = data.HotelName || 'Smyle Inn';
  const rating = Number(data.StarRating || 2);
  const address = data.Address || '916, Gali Chandi Wali';
  const cityName = data.City || 'New Delhi, Delhi N.C.R';
  const pinCode = data.PinCode || '110055';
  const contact = data.HotelContactNo || 'Not Available';

  const images = data.Images || data.ImageUrls || [
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200',
    'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=1200',
    'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=1200',
    'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=1200',
  ];

  const facilities = data.HotelFacilities?.length
    ? data.HotelFacilities.map((f) => (typeof f === 'string' ? f : f.Name)).filter(Boolean)
    : [
        'Free WiFi',
        'Parking',
        '24-hour front desk',
        'Room service',
        'Restaurant',
        'Airport transfer',
        'Laundry service',
        'Air conditioning',
      ];

  function handleSelectRoom(room) {
    const payload = {
      traceId: freshIds.traceId || traceId,
      srdvType: freshIds.srdvType || srdvType,
      srdvIndex: freshIds.srdvIndex || srdvIndex,
      resultIndex: freshIds.resultIndex || resultIndex,
      hotelCode,
      hotelName,
      address,
      cityName,
      pinCode,
      contact,
      rating,
      image: images[0],
      guestNationality: 'IN',
      noOfRooms: 1,
      room,
    };
    sessionStorage.setItem('selectedHotelRoom', JSON.stringify(payload));
    router.push('/hotels/booking');
  }

  return (
    <div className="min-h-screen bg-[#f5f7fb] text-slate-800">
      <Header />

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <section className="mb-6 overflow-hidden rounded-[28px] bg-gradient-to-r from-[#0f172a] via-[#152947] to-[#1e3a5f] p-6 text-white shadow-[0_16px_40px_rgba(15,23,42,0.12)]">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-orange-300">Luxury stay</p>
              <h1 className="mt-2 text-3xl font-black md:text-4xl">{hotelName}</h1>
            </div>
            <div className="flex flex-wrap gap-2 text-sm">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-2 backdrop-blur-sm">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" /> {rating} Star Hotel
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-2 backdrop-blur-sm">
                <MapPin className="h-4 w-4 text-orange-300" /> {cityName}
              </span>
            </div>
          </div>
        </section>

        <div className="grid gap-6 xl:grid-cols-[1.6fr_0.9fr]">
          <section className="space-y-6">
            <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm">
              <div className="relative overflow-hidden rounded-[22px]">
                <img src={images[selectedImage]} alt={hotelName} className="h-[420px] w-full object-cover" />
                <button
                  onClick={() => setSelectedImage((prev) => (prev > 0 ? prev - 1 : images.length - 1))}
                  className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-black/45 p-2 text-white transition hover:bg-black/60"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setSelectedImage((prev) => (prev < images.length - 1 ? prev + 1 : 0))}
                  className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-black/45 p-2 text-white transition hover:bg-black/60"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>

              <div className="mt-4 flex gap-3 overflow-x-auto pb-1">
                {images.map((img, idx) => (
                  <button key={idx} onClick={() => setSelectedImage(idx)} className={`shrink-0 overflow-hidden rounded-2xl border-2 ${selectedImage === idx ? 'border-orange-500' : 'border-transparent'}`}>
                    <img src={img} alt={`${hotelName} view ${idx + 1}`} className="h-20 w-28 object-cover" />
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center gap-3">
                <div className="rounded-full bg-orange-100 p-2 text-orange-600"><Sparkles className="h-4 w-4" /></div>
                <h2 className="text-xl font-black text-slate-900">Hotel highlights</h2>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <MapPin className="mb-3 h-5 w-5 text-orange-500" />
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Location</p>
                  <p className="mt-2 text-sm font-semibold text-slate-700">{address}</p>
                </div>

                <div className="rounded-2xl bg-slate-50 p-4">
                  <Phone className="mb-3 h-5 w-5 text-orange-500" />
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Contact</p>
                  <p className="mt-2 text-sm font-semibold text-slate-700">{contact}</p>
                </div>

                <div className="rounded-2xl bg-slate-50 p-4">
                  <ShieldCheck className="mb-3 h-5 w-5 text-orange-500" />
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Confidence</p>
                  <p className="mt-2 text-sm font-semibold text-slate-700">Verified stay experience</p>
                </div>
              </div>
            </div>

            <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-xl font-black text-slate-900">Available rooms</h2>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-slate-500">{roomCategories.length} category</span>
              </div>

              {roomsLoading && (
                <div className="rounded-2xl bg-slate-50 p-8 text-center text-slate-500">Rooms loading...</div>
              )}

              {!roomsLoading && roomsError && (
                <div className="rounded-2xl bg-red-50 p-8 text-center text-red-600">{roomsError}</div>
              )}

              {!roomsLoading && !roomsError && roomCategories.length === 0 && (
                <div className="rounded-2xl bg-slate-50 p-8 text-center text-slate-500">No room availability found for this property.</div>
              )}

              {!roomsLoading && !roomsError && roomCategories.map((category, categoryIndex) => (
                <div key={categoryIndex} className="mb-6 last:mb-0">
                  <h3 className="mb-4 text-sm font-bold uppercase tracking-[0.18em] text-slate-500">{category.CategoryName}</h3>
                  <div className="space-y-4">
                    {(category.Rooms || []).map((room, roomIndex) => (
                      <div key={roomIndex} className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                          <div className="flex flex-1 gap-4">
                            <img src={room.RoomImages?.[0]?.Image || images[0]} alt={room.RoomTypeName} className="h-24 w-28 rounded-2xl object-cover" />
                            <div className="flex-1">
                              <h4 className="text-lg font-bold text-slate-900">{room.RoomTypeName}</h4>
                              <div className="mt-2 flex flex-wrap gap-2">
                                {(room.Amenities || []).slice(0, 4).map((amenity, idx) => (
                                  <span key={idx} className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-600">
                                    {amenity.Name}
                                  </span>
                                ))}
                              </div>
                              {room.HotelSupplements && (
                                <p className="mt-3 text-xs font-bold uppercase tracking-[0.18em] text-orange-500">{room.HotelSupplements}</p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center justify-between gap-4 lg:min-w-[240px] lg:justify-end">
                            <div className="text-right">
                              <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Price</p>
                              <p className="mt-1 text-2xl font-black text-slate-900">₹{Number(room.Price?.OfferedPrice || room.OfferedPrice || 0).toLocaleString()}</p>
                            </div>
                            <button
                              onClick={() => handleSelectRoom(room)}
                              className="rounded-full bg-orange-500 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-orange-500/20 transition hover:bg-orange-600"
                            >
                              Select Room
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <aside className="space-y-6">
            <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm sticky top-24">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Stay summary</p>
              <div className="mt-4 rounded-[22px] bg-gradient-to-r from-[#0f172a] to-[#1e293b] p-4 text-white">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-300">Hotel</p>
                    <h3 className="mt-1 text-lg font-bold">{hotelName}</h3>
                  </div>
                  <span className="rounded-full bg-orange-500/20 px-2 py-1 text-xs font-bold text-orange-200">{rating}★</span>
                </div>
                <div className="mt-4 flex items-start gap-2 text-sm text-slate-200">
                  <MapPin className="mt-0.5 h-4 w-4 text-orange-300" />
                  <span>{address}</span>
                </div>
              </div>

              <div className="mt-5 space-y-4">
                <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-3">
                  <span className="text-sm text-slate-500">Check-in</span>
                  <span className="text-sm font-bold text-slate-800">Flexible</span>
                </div>
                <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-3">
                  <span className="text-sm text-slate-500">Cancellation</span>
                  <span className="text-sm font-bold text-emerald-600">Free upto 48h</span>
                </div>
              </div>

              <div className="mt-6 border-t border-slate-200 pt-5">
                <h3 className="text-lg font-black text-slate-900">Why guests love it</h3>
                <div className="mt-4 space-y-3">
                  {facilities.slice(0, 5).map((facility, idx) => (
                    <div key={idx} className="flex items-center gap-3 rounded-2xl bg-slate-50 px-3 py-2 text-sm text-slate-700">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      {facility}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </aside>
        </div>

        <section className="mt-6 grid gap-6 md:grid-cols-2">
          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-black text-slate-900">About this property</h2>
            <p className="mt-4 text-sm leading-7 text-slate-600">
              Experience a refined stay at {hotelName}. Thoughtfully designed for comfort, convenience, and style, this property offers an excellent mix of modern hospitality and warm service.
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {facilities.map((facility, idx) => (
                <div key={idx} className="flex items-center gap-3 rounded-2xl bg-slate-50 px-3 py-2 text-sm text-slate-700">
                  <CheckCircle2 className="h-4 w-4 text-orange-500" />
                  {facility}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-black text-slate-900">Travel essentials</h2>
            <div className="mt-5 space-y-4">
              <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3 text-sm text-slate-700">
                <Wifi className="h-5 w-5 text-orange-500" />
                High-speed Wi-Fi available across the property
              </div>
              <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3 text-sm text-slate-700">
                <Utensils className="h-5 w-5 text-orange-500" />
                On-site dining and breakfast options
              </div>
              <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3 text-sm text-slate-700">
                <CarFront className="h-5 w-5 text-orange-500" />
                Easy access to city attractions and transport
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
