import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { MapPin, Star, Phone, CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react';

export default function HotelDetails() {
  const router = useRouter();
  const { traceId, resultIndex, hotelCode } = router.query;

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    if (!router.isReady || !traceId || !hotelCode) return;

    async function fetchHotelDetails() {
      try {
        setLoading(true);
        const res = await fetch('/api/hotels/info', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ traceId, resultIndex, hotelCode }),
        });
        const result = await res.json();
        if (result.success) {
          setData(result.hotelDetails);
        }
      } catch (err) {
        console.error('Error fetching hotel details:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchHotelDetails();
  }, [router.isReady, traceId, resultIndex, hotelCode]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Header />
        <div className="max-w-6xl mx-auto py-20 text-center text-gray-600 font-semibold">
          Loading Hotel Details...
        </div>
        <Footer />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Header />
        <div className="max-w-6xl mx-auto py-20 text-center text-red-500 font-semibold">
          Hotel information unavailable.
        </div>
        <Footer />
      </div>
    );
  }

  // Extract details
  const hotelName = data.HotelName || 'Smyle Inn';
  const rating = Number(data.StarRating || 2);
  const address = data.Address || '916, Gali Chandi Wali';
  const cityName = data.CityName || 'New Delhi, Delhi N.C.R';
  const pinCode = data.PinCode || '110055';
  const contact = data.HotelContactNo || 'Not Available';

  // Images
  const images = data.Images || data.ImageUrls || [
    "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800",
    "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800",
    "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800",
  ];

  // Rooms list
  const rooms = data.RoomCombinations || data.Rooms || [
    { Name: 'Classic Room', Price: 1440.78, Inclusions: ['Security', 'Clean Washroom', 'Public Transport'] },
    { Name: 'Room STANDARD', Price: 1581.75, Inclusions: ['Security', 'Clean Washroom'] },
    { Name: 'Classic Room (1 Double Bed)', Price: 1931.00, Inclusions: ['Package Rate'] }
  ];

  // Facilities list
  const facilities = data.HotelFacilities || [
    "Dry cleaning/laundry service", "Distance from property (meters) - 500",
    "Train station pickup (surcharge)", "Banquet hall", "Vending machine",
    "Free wired internet", "Television in common areas", "Free WiFi",
    "Designated smoking areas", "Tours/ticket assistance", "24-hour front desk"
  ];

  return (
    <div className="bg-[#f0f2f5] min-h-screen font-sans text-gray-800">
      <Header />

      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">

        {/* 1. Header Card */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h1 className="text-2xl font-bold text-[#1a2b49] mb-4">{hotelName}</h1>
          <div className="flex flex-wrap gap-4">
            <div className="bg-blue-50 border border-blue-100 rounded-lg px-4 py-2 flex items-center gap-3">
              <div className="bg-blue-600 text-white p-2 rounded-full"><MapPin className="w-4 h-4" /></div>
              <div>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Location</p>
                <p className="text-xs font-semibold text-blue-700">{address}</p>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-100 rounded-lg px-4 py-2 flex items-center gap-3">
              <div className="bg-amber-500 text-white p-2 rounded-full"><Star className="w-4 h-4 fill-white" /></div>
              <div>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Rating</p>
                <p className="text-xs font-bold text-amber-700">{rating} Star Rating</p>
              </div>
            </div>

            <div className="bg-emerald-50 border border-emerald-100 rounded-lg px-4 py-2 flex items-center gap-3">
              <div className="bg-emerald-600 text-white p-2 rounded-full"><Phone className="w-4 h-4" /></div>
              <div>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Contact</p>
                <p className="text-xs font-semibold text-emerald-700">{contact}</p>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Gallery & Info Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Main Gallery */}
          <div className="md:col-span-2 bg-white rounded-xl p-4 shadow-sm border border-gray-200 space-y-3">
            <div className="relative h-80 rounded-lg overflow-hidden group">
              <img src={images[selectedImage]} alt="Hotel" className="w-full h-full object-cover" />
              <button 
                onClick={() => setSelectedImage((prev) => (prev > 0 ? prev - 1 : images.length - 1))}
                className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/50 text-white p-1.5 rounded-full hover:bg-black/70"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button 
                onClick={() => setSelectedImage((prev) => (prev < images.length - 1 ? prev + 1 : 0))}
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/50 text-white p-1.5 rounded-full hover:bg-black/70"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Thumbnails */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              {images.map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  alt="thumb"
                  onClick={() => setSelectedImage(idx)}
                  className={`w-16 h-12 object-cover rounded cursor-pointer border-2 transition-all ${
                    selectedImage === idx ? 'border-blue-600 scale-105' : 'border-transparent opacity-70'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Hotel Information Sidebar */}
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200 h-fit space-y-4">
            <h3 className="text-base font-bold text-blue-900 border-b pb-2">Hotel Information</h3>
            
            <div className="space-y-3 text-xs">
              <div>
                <p className="font-bold text-blue-600 flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> Address</p>
                <p className="text-gray-600 mt-0.5">{address}</p>
              </div>

              <div>
                <p className="font-bold text-blue-600 flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> Location</p>
                <p className="text-gray-600 mt-0.5">{cityName} India {pinCode}</p>
              </div>

              <div>
                <p className="font-bold text-blue-600 flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> Contact</p>
                <p className="text-gray-600 mt-0.5">{contact}</p>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Rooms & Rates List */}
        <div className="space-y-4">
          {rooms.map((room, idx) => (
            <div key={idx} className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex gap-4 items-center w-full md:w-auto">
                <img src={images[0]} alt="room" className="w-28 h-20 object-cover rounded-lg border" />
                <div className="space-y-1">
                  <h4 className="font-bold text-sm text-gray-900">{room.Name || room.RoomTypeName}</h4>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {(room.Inclusions || ['Security', 'Clean Room']).map((inc, i) => (
                      <span key={i} className="bg-gray-100 text-[10px] text-gray-600 px-2 py-0.5 rounded font-medium">
                        {inc}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between md:justify-end gap-6 w-full md:w-auto border-t md:border-t-0 pt-3 md:pt-0">
                <div className="text-right">
                  <span className="text-xs text-gray-400 block font-medium">INR</span>
                  <span className="text-lg font-bold text-blue-600">₹{Number(room.Price || room.TotalFare || 1500).toLocaleString()}</span>
                </div>
                <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-5 py-2.5 rounded-lg transition-all shadow-sm cursor-pointer">
                  Select Room
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* 4. More About This Hotel Section */}
        <div className="text-center pt-4">
          <h2 className="text-xl font-bold text-blue-900">More About This Hotel</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* About & Description */}
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200 space-y-4 text-xs">
            <h3 className="text-sm font-bold text-blue-900 border-b pb-2">About the Hotel</h3>
            
            <div>
              <p className="font-bold text-gray-900 mb-1">Amenities</p>
              <p className="text-gray-600 leading-relaxed">
                Enjoy recreation amenities such as bicycles to rent or take in the view from a rooftop terrace. Additional amenities include complimentary wireless internet access and concierge services.
              </p>
            </div>

            <div>
              <p className="font-bold text-gray-900 mb-1">Spoken Languages</p>
              <p className="text-gray-600">Hindi, English</p>
            </div>

            <div>
              <p className="font-bold text-gray-900 mb-1">Attractions</p>
              <ul className="list-disc pl-4 space-y-1 text-gray-600">
                <li>Gole Market - 1.5 km</li>
                <li>Palika Bazaar - 1.7 km</li>
                <li>Gurudwara Bangla Sahib - 2.2 km</li>
                <li>Connaught Place - 2.0 km</li>
              </ul>
            </div>
          </div>

          {/* Hotel Facilities Grid */}
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200 space-y-4">
            <h3 className="text-sm font-bold text-blue-900 border-b pb-2">Hotel Facilities</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {facilities.map((fac, idx) => (
                <div key={idx} className="bg-blue-50/50 border border-blue-100 rounded-lg p-2.5 flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                  <span className="text-[11px] font-medium text-gray-700">{fac}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </main>

      <Footer />
    </div>
  );
}