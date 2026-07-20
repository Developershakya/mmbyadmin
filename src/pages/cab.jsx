"use client";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useState, useRef, useEffect } from "react";
import { Plane, Hotel, Car, Bus, MapPin, Calendar, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar as CalendarIcon } from "lucide-react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";

function CitySearchBox({ label, value, placeholder, onSelect, theme = "light" }) {
  const isDark = theme === "dark"; 
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
  className={
    isDark
      ? "text-xs font-black text-white cursor-pointer truncate"
      : "w-full font-bold text-orange-500 text-sm border rounded-xl px-3 py-4 bg-white shadow-sm cursor-pointer truncate"
  }
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

export default function CabsPage() {
  const router = useRouter();

  const [tripType, setTripType] = useState("airport");
  const [selected, setSelected] = useState(new Date());
  const [open, setOpen] = useState(false);
  const [from, setFrom] = useState(null);
  const [to, setTo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [autoSearched, setAutoSearched] = useState(false);
  const [pickupTime, setPickupTime] = useState("10:00");

  const isResultsView = !!(router.query.from && router.query.to);

  const cabs = [
    { city: "Cabs From Chennai To", cabroutes: "Vellore, Pondicherry, Bangalore, Tirupati, Coimbatore", image: "/flights/Coimbatore.png" },
    { city: "Cabs From Mumbai To", cabroutes: "Pune, Nasik, Shirdi, Lonavala, Mahabaleshwar", image: "/flights/marine drive.jpeg" },
    { city: "Cabs From Chandigarh To", cabroutes: "New Delhi, Shimla, Manali, Dharamshala, Gurgaon, Noida", image: "/hotels/manali.jpg" },
    { city: "Cabs From Delhi To", cabroutes: "Agra, Jaipur, Dehradun, Haridwar, Chandigarh", image: "/flights/delhi.jpg" },
    { city: "Cabs From Pune To", cabroutes: "Mumbai, Shirdi, Mahabaleshwar, Nasik, Aurangabad", image: "/flights/pune.jpeg" },
    { city: "Cabs From Bangalore To", cabroutes: "Ooty, Madikeri, Coorg, Vellore, Mysore", image: "/flights/bangalore.jpeg" },
    { city: "Cabs From Ahmedabad To", cabroutes: "Mumbai, Rajkot, Surat, Pune, Indore", image: "/flights/ahmedabad.jpeg" },
  ];

  function formatDDMMYYYY(date) {
    if (!date) return "";
    const d = String(date.getDate()).padStart(2, "0");
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const y = date.getFullYear();
    return `${d}/${m}/${y}`;
  }

  async function fetchCabResults(fromObj, toObj) {
    setLoading(true);
    setErrorMsg("");
    try {
      const res = await fetch("/api/cabs/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pickupLocationCode: fromObj.cityid,
          dropoffLocationCode: toObj.cityid,
          pickupDate: formatDDMMYYYY(selected),
          tripType: "0",
        }),
      });
      const data = await res.json();
      if (!data.success) {
        setErrorMsg(data.message || "No cabs found.");
        setResults(null);
      } else {
        setResults(data);
      }
    } catch (err) {
      setErrorMsg("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  }

  // URL se prefill + auto-search
 useEffect(() => {
  if (!router.isReady) return;
  const { from: fromCode, to: toCode, fromName, toName } = router.query;
  if (fromCode && toCode && !autoSearched) {
    const fromObj = { cityid: fromCode, Destination: fromName || fromCode, country: "" };
    const toObj = { cityid: toCode, Destination: toName || toCode, country: "" };
    setFrom(fromObj);
    setTo(toObj);
    setAutoSearched(true);
    fetchCabResults(fromObj, toObj);
  }
}, [router.isReady, router.query]);

async function handleSearchCabs() {
  if (!from || !to) {
    setErrorMsg("Please select pickup and drop location.");
    return;
  }
  router.push(
    `/cab?from=${from.cityid}&to=${to.cityid}&fromName=${encodeURIComponent(from.Destination)}&toName=${encodeURIComponent(to.Destination)}&type=oneway`
  );
  await fetchCabResults(from, to);
}

  return (
    <>
      <Header />

 {isResultsView ? (
  <div className="bg-[#F4F6F9] font-sans antialiased text-gray-800 min-h-screen">
    <header className="bg-[#0B1523] text-white p-3 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex-[2.5] min-w-[320px] bg-[#1E2A38] rounded h-[54px] flex items-center relative px-4">
          <div className="flex-1 flex flex-col justify-center pr-4">
            <label className="block text-[9px] uppercase text-orange-500 tracking-wider font-bold mb-0.5">From</label>
            <CitySearchBox
              label=""
              value={from}
              placeholder="Select Pickup"
              onSelect={setFrom}
              theme="dark"
            />
          </div>
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center h-full">
            <div className="h-8 border-l border-gray-600/50 absolute"></div>
            <div className="bg-[#1E2A38] border border-gray-600 rounded-full w-5 h-5 flex items-center justify-center z-10 text-gray-400">
              ↔
            </div>
          </div>
          <div className="flex-1 flex flex-col justify-center pl-8">
            <label className="block text-[9px] uppercase text-orange-500 tracking-wider font-bold mb-0.5">To</label>
            <CitySearchBox
              label=""
              value={to}
              placeholder="Select Drop"
              onSelect={setTo}
              theme="dark"
            />
          </div>
        </div>

        <div className="flex-1 min-w-[140px] bg-[#1E2A38] px-3 py-1.5 rounded h-[54px] flex flex-col justify-center relative">
          <label
            className="block text-[9px] uppercase text-gray-400 tracking-wider font-medium cursor-pointer"
            onClick={() => setOpen(!open)}
          >
            Departure
          </label>
          <div
            className="text-xs font-black mt-0.5 flex justify-between items-center whitespace-nowrap text-white cursor-pointer"
            onClick={() => setOpen(!open)}
          >
            <span>{selected ? formatDDMMYYYY(selected) : '--'}</span>
            <CalendarIcon className="w-3.5 h-3.5 text-orange-500 ml-1" />
          </div>
          {open && (
            <div className="absolute top-full left-0 mt-2 p-2 bg-white shadow-2xl rounded-xl z-30 text-gray-900">
              <DayPicker
                mode="single"
                selected={selected}
                onSelect={(d) => { setSelected(d); setOpen(false); }}
                disabled={{ before: new Date() }}
              />
            </div>
          )}
        </div>

        <button
          onClick={handleSearchCabs}
          className="bg-gradient-to-r from-[#0B1523] to-orange-500 text-white text-base rounded px-6 h-[54px] ml-1.5 font-bold uppercase tracking-wider hover:opacity-95 transition-all"
        >
          Search
        </button>
      </div>
    </header>

    <main className="max-w-7xl mx-auto px-4 py-6 flex gap-6">
      <aside className="w-1/4 bg-white p-5 rounded-lg shadow-sm h-fit hidden md:block">
        <h2 className="text-lg font-bold tracking-wide mb-6">FILTERS</h2>
        <p className="text-xs text-gray-400">Filters yahan aa sakte hain (bus type, price range, etc.)</p>
      </aside>

      <section className="w-full md:w-3/4 space-y-4">
        {loading && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-10 text-center text-gray-500">
            Cabs load ho rahe hain...
          </div>
        )}

        {!loading && errorMsg && (
          <div className="bg-white rounded-lg shadow-sm border border-red-100 p-10 text-center text-red-500">
            {errorMsg}
          </div>
        )}

        {!loading && !errorMsg && results?.cars?.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {results.cars.map((car, i) => (
              <div key={i} className="bg-white border rounded-xl p-4 shadow-sm">
                <pre className="text-xs whitespace-pre-wrap">{JSON.stringify(car, null, 2)}</pre>
              </div>
            ))}
          </div>
        )}

        {!loading && !errorMsg && (!results?.cars || results.cars.length === 0) && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-10 text-center text-gray-500">
            Is route ke liye koi cab nahi mili.
          </div>
        )}
      </section>
    </main>
  </div>
) : (
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
                MAKE MY BHARAT YATRA
              </h1>
              <p className="text-lg text-white font-semibold">
                Flights • Hotels • Holiday Packages • Buses • Cabs
              </p>
            </div>

            <Card>
              <CardContent>
                <Tabs defaultValue="cabs" className="w-full ">
                  <TabsList className="flex justify-around w-full grid-cols-5  mb-6 bg- ">
                    <Link href="/flight">
                      <TabsTrigger value="flights" className="flex items-center gap-2">
                        <Plane className="w-10 h-10" />
                      </TabsTrigger>
                    </Link>
                    <Link href="/hotel">
                      <TabsTrigger value="hotels" className="flex items-center gap-2">
                        <Hotel className="w-10 h-10" />
                      </TabsTrigger>
                    </Link>
                    <Link href="/package">
                      <TabsTrigger value="packages" className="flex items-center gap-2">
                        <MapPin className="w-10 h-10" />
                      </TabsTrigger>
                    </Link>
                    <Link href="/bus">
                      <TabsTrigger value="bus" className="flex items-center gap-2">
                        <Bus className="w-10 h-10" />
                      </TabsTrigger>
                    </Link>
                    <Link href="/cab">
                      <TabsTrigger value="cabs" className="flex items-center gap-2">
                        <Car className="w-10 h-10" />
                      </TabsTrigger>
                    </Link>
                  </TabsList>

                  <TabsContent value="cabs">
                    <div className="w-full max-w-6xl mx-auto bg-white rounded-xl shadow-lg p-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 items-end">
                        <CitySearchBox
                          label="From"
                          value={from}
                          placeholder="Select Pickup Location"
                          onSelect={setFrom}
                        />

                        <CitySearchBox
                          label="To"
                          value={to}
                          placeholder="Select Drop Location"
                          onSelect={setTo}
                        />

                        <div className="relative">
                          <label className="text-xs uppercase font-medium text-slate-500">
                            Departure
                          </label>
                          <div
                            className="flex items-center gap-2 w-full justify-center font-bold text-sm border rounded-xl px-3 p-4 bg-white shadow-sm w-fit cursor-pointer"
                            onClick={() => setOpen(!open)}
                          >
                            <CalendarIcon className="w-5 h-5 text-orange-500" />
                            <span>
                              {selected
                                ? selected.toLocaleDateString("en-GB", {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                  })
                                : "Pick a date"}
                            </span>
                            {selected && (
                              <p className="text-xs text-orange-500">
                                {selected.toLocaleDateString("en-US", { weekday: "long" })}
                              </p>
                            )}
                          </div>

                          {open && (
                            <div className="absolute mt-2 p-2 bg-white shadow-lg rounded-xl z-10">
                              <DayPicker
                                mode="single"
                                selected={selected}
                                onSelect={(date) => {
                                  setSelected(date);
                                  setOpen(false);
                                }}
                              />
                            </div>
                          )}
                        </div>

                        <div className="w-full max-w-md mx-auto space-y-2">
                          <label className="text-xs uppercase font-medium text-slate-500">
                            Pickup Time
                          </label>
                          <div className="flex flex-col sm:flex-row sm:items-center gap-3 font-bold p-2 border rounded-xl shadow-sm text-base sm:text-lg bg-white">
                            <Clock className="w-5 h-5 text-orange-500 flex-shrink-0" />
                            <input
                              type="time"
                              value={pickupTime}
                              onChange={(e) => setPickupTime(e.target.value)}
                              className="w-full sm:w-auto px-3 py-2 text-sm font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                          </div>
                        </div>

                        <div className="col-span-full flex justify-center mt-6">
                          <Button onClick={handleSearchCabs} disabled={loading}>
                            {loading ? "Searching..." : "SEARCH CABS"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </section>
      )}

      <section className="py-10 px-4">
        <div className="max-w-7xl mx-auto rounded-2xl shadow-md p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cabs.map((cab) => (
              <div key={cab.city} className="flex items-center space-x-4">
                <div className="w-14 h-14 rounded-full overflow-hidden">
                  <Image
                    src={cab.image}
                    alt={cab.city}
                    width={56}
                    height={56}
                    className="object-cover w-full h-full"
                  />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{cab.city}</h3>
                  <p className="text-sm text-slate-900">{cab.cabroutes}</p>
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