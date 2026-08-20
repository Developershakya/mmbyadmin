"use client";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useState, useRef, useEffect } from "react";
import { Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";

function CitySearchBox({ label, value, placeholder, onSelect }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const boxRef = useRef(null);
  const debounceRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (boxRef.current && !boxRef.current.contains(e.target)) {
        setOpen(false);
        setQuery("");
        setResults([]);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query || query.trim().length < 2) {
      setResults([]);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/cities/cab?query=${encodeURIComponent(query.trim())}`);
        const data = await res.json();
        setResults(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("City search error:", err);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [query]);

  function handleSelect(item) {
    onSelect(item);
    setOpen(false);
    setQuery("");
    setResults([]);
  }

  return (
    <div className="relative" ref={boxRef}>
      <label className="text-xs uppercase font-medium text-slate-500">{label}</label>
      <div
        onClick={() => setOpen(!open)}
        className="w-full font-bold text-orange-500 text-sm border rounded-xl px-3 py-4 bg-white shadow-sm cursor-pointer truncate"
      >
        {value ? value.Destination : placeholder}
      </div>

      {open && (
        <div className="absolute mt-2 w-72 bg-white shadow-2xl rounded-xl border border-gray-100 z-30 overflow-hidden">
          <div className="p-2">
            <input
              autoFocus
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`Search ${label.toLowerCase()}`}
              className="w-full text-sm border rounded-lg px-3 py-2 outline-none"
            />
          </div>
          <div className="max-h-60 overflow-y-auto px-2 pb-2">
            {loading ? (
              <p className="text-sm text-gray-400 px-1 py-4 text-center">Searching...</p>
            ) : query.trim().length < 2 ? (
              <p className="text-xs text-gray-400 px-1 py-4 text-center">Type at least 2 letters</p>
            ) : results.length === 0 ? (
              <p className="text-sm text-gray-400 px-1 py-4 text-center">No cities found</p>
            ) : (
              results.map((item, idx) => (
                <button
                  key={item.cityid || idx}
                  type="button"
                  onClick={() => handleSelect(item)}
                  className="w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-orange-50 transition"
                >
                  <span className="block font-semibold text-gray-800">{item.Destination}</span>
                  <span className="block text-[11px] text-gray-400">{item.country}</span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// TripType codes as per SRDV docs — confirm exact numbers from your API docs
const TRIP_TYPES = [
  { label: "One-Way", value: "0" },
  { label: "Round Trip", value: "1" },
  { label: "Local (8hr/80km)", value: "2" },
];

export default function CabsPage() {
  const router = useRouter();
  const [tripType, setTripType] = useState("0");
  const [selected, setSelected] = useState(new Date());
  const [open, setOpen] = useState(false);
  const [from, setFrom] = useState(null);
  const [to, setTo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [pickupTime, setPickupTime] = useState("10:00");

  useEffect(() => {
    if (!router.isReady) return;
    const { from: fromCode, to: toCode } = router.query;
    if (fromCode) {
      setFrom({ cityid: fromCode, Destination: fromCode, country: "" });
    }
    if (toCode) {
      setTo({ cityid: toCode, Destination: toCode, country: "" });
    }
  }, [router.isReady, router.query]);

  const cabs = [
    {
      city: "Cabs from Chennai",
      cabroutes: "Vellore, Puducherry, Bengaluru, Tirupati, Coimbatore",
      image: "/flights/Coimbatore.png",
    },
    {
      city: "Cabs from Mumbai",
      cabroutes: "Pune, Nashik, Shirdi, Lonavala, Mahabaleshwar",
      image: "/flights/marine drive.jpeg",
    },
    {
      city: "Cabs from Chandigarh",
      cabroutes: "New Delhi, Shimla, Manali, Dharamshala, Gurugram, Noida",
      image: "/hotels/manali.jpg",
    },
    {
      city: "Cabs from Delhi",
      cabroutes: "Agra, Jaipur, Dehradun, Haridwar, Chandigarh",
      image: "/flights/delhi.jpg",
    },
    {
      city: "Cabs from Pune",
      cabroutes: "Mumbai, Shirdi, Mahabaleshwar, Nashik, Aurangabad",
      image: "/flights/pune.jpeg",
    },
    {
      city: "Cabs from Bengaluru",
      cabroutes: "Ooty, Madikeri, Coorg, Vellore, Mysuru",
      image: "/flights/bangalore.jpeg",
    },
    {
      city: "Cabs from Ahmedabad",
      cabroutes: "Mumbai, Rajkot, Surat, Pune, Indore",
      image: "/flights/ahmedabad.jpeg",
    },
  ];

  function formatDDMMYYYY(date) {
    if (!date) return "";
    const d = String(date.getDate()).padStart(2, "0");
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const y = date.getFullYear();
    return `${d}/${m}/${y}`;
  }

  async function handleSearchCabs() {
    if (!from || !to) {
      setErrorMsg("Please select both pickup and drop-off locations.");
      return;
    }
    setLoading(true);
    setErrorMsg("");
    setResults(null);
    try {
      const res = await fetch("/api/cabs/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pickupLocationCode: from.cityid,
          dropoffLocationCode: to.cityid,
          pickupDate: formatDDMMYYYY(selected),
          pickupTime,
          tripType,
        }),
      });
      const data = await res.json();
      if (!data.success) {
        setErrorMsg(data.message || "No cabs found for the selected route.");
        setResults(null);
      } else {
        setResults(data);
      }
    } catch (err) {
      setErrorMsg("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleBookNow(cab, traceId) {
    router.push({
      pathname: "/cabs/book",
      query: {
        pricingId: cab.Fare?.PricingId,
        srdvIndex: cab.SrdvIndex,
        traceId,
        from: from?.cityid,
        to: to?.cityid,
        pickupDate: formatDDMMYYYY(selected),
        pickupTime,
        tripType,
      },
    });
  }

  return (
    <>
      <Header />

      <section
        className="relative bg-center py-16"
        style={{ backgroundImage: "url('/img/bg/map.png')" }}
      >
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-fill z-[-1]"
        >
          <source src="/images/video/cab.MP4" type="video/MP4" />
        </video>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl lg:text-6xl font-bold text-white mb-4">
              India Travel Cab Booking
            </h1>
            <p className="text-lg text-white font-semibold">
              Flights • Hotels • Holiday Packages • Buses • Cabs
            </p>
          </div>

          {/* Search Form */}
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-5xl mx-auto">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Book a Cab</h2>

            {/* Trip Type */}
            <div className="mb-6 flex gap-2">
              {TRIP_TYPES.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setTripType(t.value)}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold border transition ${
                    tripType === t.value
                      ? "bg-orange-600 text-white border-orange-600"
                      : "bg-white text-gray-700 border-gray-300 hover:border-orange-400"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
              {/* From */}
              <div className="lg:col-span-2">
                <CitySearchBox
                  label="From"
                  value={from}
                  placeholder="Select a city"
                  onSelect={setFrom}
                />
              </div>

              {/* To */}
              <div className="lg:col-span-2">
                <CitySearchBox
                  label="To"
                  value={to}
                  placeholder="Select a city"
                  onSelect={setTo}
                />
              </div>

              {/* Date */}
              <div className="relative">
                <label className="text-xs uppercase font-medium text-slate-500 block mb-2">
                  Date
                </label>

                <div
                  onClick={() => setOpen(!open)}
                  className="w-full font-bold text-orange-500 text-sm border rounded-xl px-3 py-4 bg-white shadow-sm cursor-pointer flex items-center justify-between"
                >
                  <span>
                    {selected.toLocaleDateString("en-US", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                  <CalendarIcon className="w-4 h-4" />
                </div>

                {open && (
                  <div className="absolute mt-2 p-2 bg-white shadow-lg rounded-xl z-10 border-2 border-orange-200">
                    <DayPicker
                      mode="single"
                      selected={selected}
                      onSelect={(date) => {
                        setSelected(date);
                        setOpen(false);
                      }}
                      disabled={{ before: new Date() }}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Time */}
            <div className="mb-6">
              <label className="text-xs uppercase font-medium text-slate-500 block mb-2">
                Pickup Time
              </label>
              <input
                type="time"
                value={pickupTime}
                onChange={(e) => setPickupTime(e.target.value)}
                className="w-full font-bold text-orange-500 text-sm border rounded-xl px-3 py-4 bg-white shadow-sm"
              />
            </div>

            {errorMsg && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {errorMsg}
              </div>
            )}

            <Button
              onClick={handleSearchCabs}
              disabled={loading}
              className="w-full px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-lg uppercase tracking-wide transition-colors disabled:opacity-50"
            >
              {loading ? "Searching..." : "Search Cabs"}
            </Button>
          </div>
        </div>
      </section>

      {/* Results */}
      {results && (
        <section className="py-10 px-4">
          <div className="max-w-7xl mx-auto rounded-2xl shadow-md p-6 bg-white">
            <h2 className="text-2xl font-bold mb-6">Available Cabs</h2>

            {results.cars && results.cars.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {results.cars.map((cab) => (
                  <div
                    key={cab.SrdvIndex}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition"
                  >
                    {cab.Image && (
                      <img
                        src={cab.Image}
                        alt={cab.Category}
                        className="w-full h-32 object-contain mb-3"
                      />
                    )}

                    <h3 className="font-semibold text-lg mb-2">
                      {cab.Category?.replaceAll("_", " ")}
                    </h3>

                    <p className="text-sm text-gray-600 mb-1">
                      Seats: {cab.SeatingCapacity} • {cab.AirConditioner ? "AC" : "Non-AC"}
                    </p>

                    <p className="text-lg font-bold text-orange-600 mb-1">
                      ₹{cab.Fare?.TotalAmount?.toFixed(0)}
                    </p>

                    <p className="text-xs text-gray-500 mb-4">
                      Advance: ₹{cab.Fare?.AdvanceAmount?.toFixed(0)}
                    </p>

                    <Button
                      onClick={() => handleBookNow(cab, results.traceId)}
                      className="w-full bg-orange-600 hover:bg-orange-700 text-white rounded-lg"
                    >
                      Book Now
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500">No cabs available.</p>
            )}
          </div>
        </section>
      )}

      {/* Popular Routes */}
      <section className="py-10 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto rounded-2xl shadow-md p-6 bg-white">
          <h2 className="text-2xl font-bold mb-6">Popular Cab Routes</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cabs.map((cab) => (
              <div key={cab.city} className="flex items-center space-x-4">
                <div className="w-14 h-14 rounded-full overflow-hidden">
                  <Image
                    src={cab.image}
                    alt={cab.city}
                    width={400}
                    height={300}
                    className="object-cover w-full h-full"
                  />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{cab.city}</h3>
                  <p className="text-sm text-slate-600">{cab.cabroutes}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}