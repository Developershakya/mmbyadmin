"use client";
import { useRouter } from "next/router";
import { useState, useRef, useEffect } from "react";
import {
  Plane,
  Hotel,
  Car,
  Bus,
  MapPin,
  Clock,
  ChevronDown,
  Search,
} from "lucide-react";
import { FaPlane, FaHotel, FaMapMarkerAlt, FaBus, FaCar } from "react-icons/fa";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import LocationSearchBox, { indianCities } from "./LocationSearchBox";

function formatLocalDate(date) {
  if (!date) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

const today = new Date();
today.setHours(0, 0, 0, 0);

function RoomsGuestsBox({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const boxRef = useRef(null);

  const rooms = value?.rooms ?? 1;
  const adults = value?.adults ?? 2;
  const children = value?.children ?? 0;

  useEffect(() => {
    function handleClickOutside(e) {
      if (boxRef.current && !boxRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function update(patch) {
    onChange({ rooms, adults, children, ...patch });
  }

  function Counter({ label, sub, val, min, onDec, onInc }) {
    return (
      <div className="flex items-center justify-between py-2">
        <div>
          <p className="text-sm font-semibold text-gray-800">{label}</p>
          {sub && <p className="text-xs text-gray-400">{sub}</p>}
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onDec(); }}
            disabled={val <= min}
            className="w-8 h-8 rounded-full border border-gray-300 text-gray-600 font-bold disabled:opacity-30 disabled:cursor-not-allowed hover:border-orange-400 hover:text-orange-500 transition"
          >
            –
          </button>
          <span className="w-5 text-center font-semibold text-gray-800">{val}</span>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onInc(); }}
            className="w-8 h-8 rounded-full border border-gray-300 text-gray-600 font-bold hover:border-orange-400 hover:text-orange-500 transition"
          >
            +
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full cursor-pointer" ref={boxRef}>
      <span className="text-xs uppercase text-gray-400 block mb-1">Rooms &amp; Guests</span>
      <div onClick={() => setOpen((p) => !p)}>
        <div className="text-xl font-bold text-gray-800 flex items-center gap-1">
          {rooms} Room{rooms > 1 ? "s" : ""}, {adults} Adult{adults > 1 ? "s" : ""}
          {children > 0 ? `, ${children} Child${children > 1 ? "ren" : ""}` : ""}
          <ChevronDown className="w-3 h-3 text-gray-400" />
        </div>
      </div>

      {open && (
        <div
          className="absolute right-0 mt-2 w-80 bg-white shadow-2xl rounded-xl border border-gray-100 z-30 p-4"
          onClick={(e) => e.stopPropagation()}
        >
          <Counter label="Room" val={rooms} min={1}
            onDec={() => update({ rooms: Math.max(1, rooms - 1) })}
            onInc={() => update({ rooms: Math.min(9, rooms + 1) })} />
          <div className="border-t border-gray-100" />
          <Counter label="Adults" val={adults} min={1}
            onDec={() => update({ adults: Math.max(1, adults - 1) })}
            onInc={() => update({ adults: Math.min(20, adults + 1) })} />
          <div className="border-t border-gray-100" />
          <Counter label="Children" sub="0 - 17 Years Old" val={children} min={0}
            onDec={() => update({ children: Math.max(0, children - 1) })}
            onInc={() => update({ children: Math.min(10, children + 1) })} />
          <p className="text-xs text-gray-400 mt-3 leading-relaxed">
            Please provide the right number of children along with their correct age for the best options and prices.
          </p>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="w-full mt-4 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-lg py-2.5 transition"
          >
            Apply
          </button>
        </div>
      )}
    </div>
  );
}

/* ---------------------------------------------------------
   MAIN COMPONENT
--------------------------------------------------------- */
export default function HeroSection() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("flights");
  const [tripType, setTripType] = useState("oneway");
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);
  const [travelClass, setTravelClass] = useState("");
  const [openMultiDate, setOpenMultiDate] = useState(null);
  const [travelersOpen, setTravelersOpen] = useState(false);

  const displayValue = `${adults} Adult${adults > 1 ? "s" : ""}${
    children > 0 ? `, ${children} Child${children > 1 ? "ren" : ""}` : ""
  }${infants > 0 ? `, ${infants} Infant${infants > 1 ? "s" : ""}` : ""}`;

  const [departureDate, setDepartureDate] = useState(new Date());
  const [returnDate, setReturnDate] = useState(null);
  const [openDeparture, setOpenDeparture] = useState(false);
  const [openReturn, setOpenReturn] = useState(false);

const tomorrow = new Date(today);
tomorrow.setDate(tomorrow.getDate() + 1);

const [checkIn, setCheckIn] = useState(today);
const [checkOut, setCheckOut] = useState(tomorrow);
  const [openCheckIn, setOpenCheckIn] = useState(false);
  const [openCheckOut, setOpenCheckOut] = useState(false);
  const [openPrice, setOpenPrice] = useState(false);

  const [priceRange, setPriceRange] = useState("₹0-₹1500");

  const [travelDate, setTravelDate] = useState(new Date());
  const [openTravelDate, setOpenTravelDate] = useState(false);

  const [from, setFrom] = useState(
    indianCities.find((c) => c.code === "DEL")
  );
  const [to, setTo] = useState(
    indianCities.find((c) => c.code === "BOM")
  );

  const [multiCityLegs, setMultiCityLegs] = useState([
    { from: from, to: to, date: new Date() },
    { from: to, to: null, date: new Date(Date.now() + 86400000) },
  ]);
 const [hotelDestination, setHotelDestination] = useState({
  code: "699356",
  name: "GOA",
});
  const [roomsGuests, setRoomsGuests] = useState({
    rooms: 1,
    adults: 2,
    children: 0,
  });

const [holidaysFrom, setHolidaysFrom] = useState({ code: "DEL", name: "New Delhi" });
const [holidaysTo, setHolidaysTo] = useState({ code: "GOA", name: "Goa" });
  const [holidaysDepartureDate, setHolidaysDepartureDate] = useState("");
  const [holidaysRooms, setHolidaysRooms] = useState({
    rooms: 1,
    adults: 2,
    children: 0,
  });

  const [busFrom, setBusFrom] = useState(null);
  const [busTo, setBusTo] = useState(null);

  const [cabTripType, setCabTripType] = useState("oneway");
  const [cabFrom, setCabFrom] = useState(null);
  const [cabTo, setCabTo] = useState(null);
  const [cabDate, setCabDate] = useState(null);
  const [cabReturnDate, setCabReturnDate] = useState(null);
  const [pickupTime, setPickupTime] = useState("10:00");
  const [dropTime, setDropTime] = useState("");
  const [cabPackage, setCabPackage] = useState("1hr-10km");
  const [openCabDate, setOpenCabDate] = useState(false);
  const [openReturnDate, setOpenReturnDate] = useState(false);
  const [cabTripTypeOpen, setCabTripTypeOpen] = useState(false);
  const cabTripTypeRef = useRef(null);

  const tabs = [
    { id: "flights", label: "Flights", icon: FaPlane },
    { id: "hotels", label: "Hotels", icon: FaHotel },
    { id: "holidays", label: "Holidays", icon: FaMapMarkerAlt },
    { id: "buses", label: "Buses", icon: FaBus },
    { id: "cabs", label: "Cabs", icon: FaCar },
  ];
  const searchLabels = {
    flights: "Search Flights",
    hotels: "Search Hotels",
    holidays: "Search Holidays",
    buses: "Search Buses",
    cabs: "Search Cabs",
  };
  const cabTripTypeLabels = {
    oneway: "Outstation One-Way",
    round: "Outstation Round-Trip",
    airport: "Airport Transfers",
    hourly: "Hourly Rentals",
  };

  useEffect(() => {
    function handleClickOutside(e) {
      if (cabTripTypeRef.current && !cabTripTypeRef.current.contains(e.target)) {
        setCabTripTypeOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSearch() {
    if (activeTab === "flights") {
      if (tripType === "multicity") {
        const incomplete = multiCityLegs.some((leg) => !leg.from || !leg.to || !leg.date);
        if (incomplete) {
          alert("Please fill From, To and Date for all cities.");
          return;
        }

        const legsParam = multiCityLegs
          .map(
            (leg) =>
              `${leg.from.code}-${leg.to.code}-${formatLocalDate(leg.date)}`
          )
          .join(",");

        router.push(`/flights?trip=multicity&legs=${legsParam}`);
      } else {
        if (!from || !to) {
          alert("Please select From and To locations.");
          return;
        }
        if (tripType === "roundtrip" && !returnDate) {
          alert("Please select a return date for round trip.");
          return;
        }
        router.push(
          `/flights?from=${from.code}&to=${to.code}&date=${formatLocalDate(departureDate)}` +
          (tripType === "roundtrip" ? `&returnDate=${formatLocalDate(returnDate)}` : "") +
          `&trip=${tripType}&adults=${adults}&children=${children}&infants=${infants}`
        );
      }
    } else if (activeTab === "hotels") {
      if (!hotelDestination) {
        alert("Please select a destination.");
        return;
      }
      if (!checkIn || !checkOut) {
        alert("Please select check-in and check-out dates.");
        return;
      }

      const nights = Math.round((checkOut - checkIn) / (1000 * 60 * 60 * 24));
      if (nights <= 0) {
        alert("Check-out date must be after check-in date.");
        return;
      }

      router.push(
        `/hotels?cityId=${hotelDestination.code}` +
        `&cityName=${encodeURIComponent(hotelDestination.name)}` +
        `&checkin=${formatLocalDate(checkIn)}` +
        `&nights=${nights}` +
        `&rooms=${roomsGuests.rooms}` +
        `&adults=${roomsGuests.adults}` +
        `&children=${roomsGuests.children}`
      );
    }
else if (activeTab === "holidays") {
  if (!holidaysTo) {
    alert("Please select a destination.");
    return;
  }

  const destinationName = holidaysTo.name || holidaysTo.Destination || "";

  const query = new URLSearchParams({
    destination: destinationName,
  });
  if (holidaysDepartureDate) query.set("startDate", holidaysDepartureDate);
  query.set("guests", `${holidaysRooms.rooms} Room, ${holidaysRooms.adults} Adults`);

  router.push(`/holiday/search?${query.toString()}`);
}

     else if (activeTab === "buses") {
      if (!busFrom || !busTo) {
        alert("Please select From and To cities.");
        return;
      }
      router.push(
        `/bus?from=${busFrom.code}&to=${busTo.code}&date=${formatLocalDate(travelDate)}`
      );
} else if (activeTab === "cabs") {
  if (!cabFrom || !cabTo) {
    alert("Please select pickup and drop locations.");
    return;
  }
  router.push(
    `/cab?from=${cabFrom.code}&to=${cabTo.code}` +
    `&fromName=${encodeURIComponent(cabFrom.name)}` +
    `&toName=${encodeURIComponent(cabTo.name)}` +
    `&type=${cabTripType}`
  );
}
  }

  const formatWeekday = (date) =>
    date ? date.toLocaleDateString("en-US", { weekday: "long" }) : "";

  return (
    <section
      className="relative bg-cover bg-center min-h-[560px] flex items-center pb-16"
      style={{
        backgroundImage:
          "linear-gradient(rgba(0,0,0,0.15), rgba(0,0,0,0.35)), url('https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1920&q=80')",
      }}
    >
      <div className="max-w-7xl mx-auto w-full px-12 relative z-10 -mt-4">
        <h1 className="text-5xl font-bold text-white mb-2 tracking-wide">
          Make My Bharat Yatra
        </h1>
        <p className="text-white text-lg font-light mb-6 opacity-90">
          Flights • Hotels • Holiday Packages • Buses • Cabs
        </p>

        <div className="rounded-2xl shadow-2xl">
          {/* Tab Bar */}
          <div className="border-b border-gray-100">
            <div className="inline-flex bg-gradient-to-r from-[#7a3600]/90 to-[#a84b00]/90 rounded-t-xl overflow-hidden">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-10 py-5 font-semibold transition ${
                      isActive
                        ? "bg-white text-orange-600 border-t-4 border-orange-500"
                        : "text-white hover:bg-white/10"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Panel */}
          <div className="relative rounded-b-xl bg-white p-6 pb-28">
            {/* ---------------- FLIGHTS ---------------- */}
            {activeTab === "flights" && (
              <div>
                <div className="flex flex-wrap space-x-6 mb-4 text-xs font-semibold text-gray-600">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="tripType"
                      checked={tripType === "oneway"}
                      onChange={() => setTripType("oneway")}
                      className="accent-orange-600 w-4 h-4"
                    />
                    <span className={tripType === "oneway" ? "text-orange-600" : ""}>
                      One Way
                    </span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer hover:text-orange-600">
                    <input
                      type="radio"
                      name="tripType"
                      checked={tripType === "roundtrip"}
                      onChange={() => setTripType("roundtrip")}
                      className="accent-orange-600 w-4 h-4"
                    />
                    <span className={tripType === "roundtrip" ? "text-orange-600" : ""}>
                      Round Trip
                    </span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer hover:text-orange-600">
                    <input
                      type="radio"
                      name="tripType"
                      checked={tripType === "multicity"}
                      onChange={() => setTripType("multicity")}
                      className="accent-orange-600 w-4 h-4"
                    />
                    <span className={tripType === "multicity" ? "text-orange-600" : ""}>
                      Multi City
                    </span>
                  </label>
                  <span className="ml-auto text-gray-400 font-normal">
                    Book International and Domestic Flights
                  </span>
                </div>

                {tripType !== "multicity" ? (
                  <div className="grid grid-cols-1 lg:grid-cols-12 border border-gray-200 rounded-xl divide-y lg:divide-y-0 lg:divide-x divide-gray-200 mb-6">
                    <div className="lg:col-span-2 p-4 hover:bg-gray-50/80 transition cursor-pointer">
                      <LocationSearchBox label="From" value={from} placeholder="New Delhi" onSelect={setFrom} citySearchApi="/api/cities/airports" />
                    </div>

                    <div className="lg:col-span-2 p-4 hover:bg-gray-50/80 transition">
                      <LocationSearchBox label="To" value={to} placeholder="Leh" onSelect={setTo} citySearchApi="/api/cities/airports" />
                    </div>

                    {/* Departure */}
                    <div className="lg:col-span-2 p-4 cursor-pointer hover:bg-gray-50/80 transition relative">
                      <span
                        className="text-xs uppercase tracking-wider text-gray-400 mb-1 flex items-center justify-between"
                        onClick={() => { setOpenDeparture(!openDeparture); setOpenReturn(false); }}
                      >
                        Departure <ChevronDown className="w-3 h-3" />
                      </span>
                      <div onClick={() => { setOpenDeparture(!openDeparture); setOpenReturn(false); }}>
                        <div className="text-xl font-bold text-gray-800">
                          {departureDate ? departureDate.getDate() : "--"}{" "}
                          <span className="text-sm font-semibold">
                            {departureDate ? departureDate.toLocaleDateString("en-GB", { month: "short", year: "2-digit" }) : ""}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500">{formatWeekday(departureDate)}</span>
                      </div>
                      {openDeparture && (
                        <div className="absolute mt-2 p-2 bg-white shadow-lg rounded-xl z-20 left-0">
                          <DayPicker
                            mode="single"
                            selected={departureDate}
                            onSelect={(date) => { setDepartureDate(date); setOpenDeparture(false); }}
                            disabled={{ before: today }}
                          />
                        </div>
                      )}
                    </div>

                    {/* Return — sirf roundtrip mein */}
                    {tripType === "roundtrip" && (
                      <div className="lg:col-span-2 p-4 cursor-pointer hover:bg-gray-50/80 transition relative">
                        <span
                          className="text-xs uppercase tracking-wider text-gray-400 mb-1 flex items-center justify-between"
                          onClick={() => { setOpenReturn(!openReturn); setOpenDeparture(false); }}
                        >
                          Return <ChevronDown className="w-3 h-3" />
                        </span>
                        <div onClick={() => { setOpenReturn(!openReturn); setOpenDeparture(false); }}>
                          <div className="text-xl font-bold text-gray-800">
                            {returnDate ? returnDate.getDate() : "--"}{" "}
                            <span className="text-sm font-semibold">
                              {returnDate ? returnDate.toLocaleDateString("en-GB", { month: "short", year: "2-digit" }) : ""}
                            </span>
                          </div>
                          <span className="text-xs text-gray-500">{formatWeekday(returnDate)}</span>
                        </div>
                        {openReturn && (
                          <div className="absolute mt-2 p-2 bg-white shadow-lg rounded-xl z-20 left-0">
                            <DayPicker
                              mode="single"
                              selected={returnDate}
                              onSelect={(date) => { setReturnDate(date); setOpenReturn(false); }}
                              disabled={{ before: departureDate || today }}
                            />
                          </div>
                        )}
                      </div>
                    )}

                    {/* Tap to add return — sirf oneway mein */}
                    {tripType === "oneway" && (
                      <div className="lg:col-span-2 p-4 cursor-pointer hover:bg-gray-50/80 transition" onClick={() => setTripType("roundtrip")}>
                        <span className="text-xs uppercase tracking-wider text-gray-400 mb-1 block">Return</span>
                        <div className="text-xs text-gray-400 font-medium mt-1 leading-tight">
                          Tap to add return date for savings
                        </div>
                      </div>
                    )}

                    {/* Travellers */}
                    <div className="lg:col-span-2 p-4 cursor-pointer hover:bg-gray-50/80 transition relative">
                      <span
                        className="text-xs uppercase tracking-wider text-gray-400 mb-1 flex items-center justify-between"
                        onClick={() => setTravelersOpen(!travelersOpen)}
                      >
                        Travellers <ChevronDown className="w-3 h-3" />
                      </span>
                      <div className="text-base font-bold text-gray-800 mt-0.5" onClick={() => setTravelersOpen(!travelersOpen)}>
                        {displayValue}
                      </div>

                      {travelersOpen && (
                        <div
                          className="absolute right-0 mt-2 w-[420px] p-5 bg-white shadow-2xl rounded-xl border border-gray-100 z-30"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="mb-5">
                            <p className="text-sm font-bold text-gray-800">Adults (12y +)</p>
                            <p className="text-xs text-gray-400 mb-2">on the day of travel</p>
                            <div className="flex flex-wrap gap-2">
                              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                                <button
                                  key={n}
                                  type="button"
                                  onClick={() => setAdults(n)}
                                  className={`w-9 h-9 rounded-md text-sm font-semibold transition ${
                                    adults === n
                                      ? "bg-orange-500 text-white"
                                      : "bg-gray-100 text-gray-700 hover:bg-orange-100"
                                  }`}
                                >
                                  {n}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="flex gap-8 mb-5">
                            <div>
                              <p className="text-sm font-bold text-gray-800">Children (2y - 12y)</p>
                              <p className="text-xs text-gray-400 mb-2">on the day of travel</p>
                              <div className="flex flex-wrap gap-2">
                                {[0, 1, 2, 3, 4, 5, 6].map((n) => (
                                  <button
                                    key={n}
                                    type="button"
                                    onClick={() => setChildren(n)}
                                    className={`w-9 h-9 rounded-md text-sm font-semibold transition ${
                                      children === n
                                        ? "bg-orange-500 text-white"
                                        : "bg-gray-100 text-gray-700 hover:bg-orange-100"
                                    }`}
                                  >
                                    {n}
                                  </button>
                                ))}
                              </div>
                            </div>

                            <div>
                              <p className="text-sm font-bold text-gray-800">Infants (below 2y)</p>
                              <p className="text-xs text-gray-400 mb-2">on the day of travel</p>
                              <div className="flex flex-wrap gap-2">
                                {[0, 1, 2, 3, 4, 5, 6].map((n) => (
                                  <button
                                    key={n}
                                    type="button"
                                    onClick={() => setInfants(n)}
                                    className={`w-9 h-9 rounded-md text-sm font-semibold transition ${
                                      infants === n
                                        ? "bg-orange-500 text-white"
                                        : "bg-gray-100 text-gray-700 hover:bg-orange-100"
                                    }`}
                                  >
                                    {n}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>

                          <div className="flex justify-end">
                            <button
                              onClick={() => setTravelersOpen(false)}
                              className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-md px-8 py-2.5 transition"
                            >
                              Apply
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Cabin Class */}
                    <div className="lg:col-span-2 p-4 hover:bg-gray-50/80 transition">
                      <span className="text-xs uppercase tracking-wider text-gray-400 mb-1 block">Cabin Class</span>
                      <select
                        value={travelClass}
                        onChange={(e) => setTravelClass(e.target.value)}
                        className="text-base font-bold text-gray-800 outline-none bg-transparent w-full"
                      >
                        <option value="Economy">Economy</option>
                        <option value="Premium Economy">Premium Economy</option>
                        <option value="Business">Business</option>
                        <option value="First Class">First Class</option>
                      </select>
                    </div>
                  </div>
                ) : (
                  /* -------- MULTI CITY -------- */
                  <div className="space-y-3 mb-6">
                    {multiCityLegs.map((leg, idx) => (
                      <div key={idx} className="grid grid-cols-1 lg:grid-cols-12 border border-gray-200 rounded-xl divide-y lg:divide-y-0 lg:divide-x divide-gray-200">
                        <div className="lg:col-span-4 p-4 hover:bg-gray-50/80 transition">
                          <LocationSearchBox
                            label="From"
                            value={leg.from}
                            placeholder="Delhi"
                            onSelect={(val) => {
                              const updated = [...multiCityLegs];
                              updated[idx].from = val;
                              setMultiCityLegs(updated);
                            }}
                            citySearchApi="/api/cities/airports"
                          />
                        </div>
                        <div className="lg:col-span-4 p-4 hover:bg-gray-50/80 transition">
                          <LocationSearchBox
                            label="To"
                            value={leg.to}
                            placeholder="Select City"
                            onSelect={(val) => {
                              const updated = [...multiCityLegs];
                              updated[idx].to = val;
                              setMultiCityLegs(updated);
                            }}
                            citySearchApi="/api/cities/airports"
                          />
                        </div>
                        <div className="lg:col-span-3 p-4 cursor-pointer hover:bg-gray-50 relative"
                          onClick={() => setOpenMultiDate(openMultiDate === idx ? null : idx)}>
                          <span className="text-xs uppercase text-gray-400 block mb-1">Departure</span>
                          <div className="text-xl font-bold text-gray-800">
                            {leg.date ? leg.date.getDate() : "--"}{" "}
                            <span className="text-sm font-semibold">
                              {leg.date ? leg.date.toLocaleDateString("en-GB", { month: "short" }) : ""}
                            </span>
                          </div>
                          {openMultiDate === idx && (
                            <div className="absolute mt-2 p-2 bg-white shadow-lg rounded-xl z-20">
                              <DayPicker
                                mode="single"
                                selected={leg.date}
                                onSelect={(d) => {
                                  const updated = [...multiCityLegs];
                                  updated[idx].date = d;
                                  setMultiCityLegs(updated);
                                  setOpenMultiDate(null);
                                }}
                                disabled={{ before: today }}
                              />
                            </div>
                          )}
                        </div>
                        <div className="lg:col-span-1 p-4 flex items-center justify-center">
                          {idx === multiCityLegs.length - 1 && idx > 1 && (
                            <button
                              onClick={() => setMultiCityLegs(multiCityLegs.filter((_, i) => i !== idx))}
                              className="text-red-500 text-xs font-semibold"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                    <button
                      onClick={() =>
                        setMultiCityLegs([...multiCityLegs, { from: multiCityLegs[multiCityLegs.length - 1].to, to: null, date: new Date() }])
                      }
                      className="text-orange-600 border border-orange-500 rounded-lg px-4 py-2 text-sm font-semibold hover:bg-orange-50 transition"
                    >
                      + Add Another City
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* ---------------- HOTELS ---------------- */}
            {activeTab === "hotels" && (
              <div>
                <div className="grid grid-cols-1 lg:grid-cols-12 border border-gray-200 rounded-xl divide-y lg:divide-y-0 lg:divide-x divide-gray-200 mb-6">
                  <div className="lg:col-span-5 p-4 hover:bg-gray-50">
                    <LocationSearchBox
                      label="City, Area or Property Name"
                      value={hotelDestination}
                      placeholder="Goa, India"
                      onSelect={setHotelDestination}
                      showAllSections={false}
                      citySearchApi="/api/cities/hotel"
                    />
                  </div>

                  <div className="lg:col-span-2 p-4 cursor-pointer hover:bg-gray-50 relative">
                    <span
                      className="text-xs uppercase text-gray-400 block mb-1"
                      onClick={() => {
                        setOpenCheckIn(!openCheckIn);
                        setOpenCheckOut(false);
                      }}
                    >
                      Check-In
                    </span>
                    <div
                      className="text-xl font-bold text-gray-800"
                      onClick={() => {
                        setOpenCheckIn(!openCheckIn);
                        setOpenCheckOut(false);
                      }}
                    >
                      {checkIn ? checkIn.getDate() : "--"}{" "}
                      <span className="text-sm font-semibold">
                        {checkIn
                          ? checkIn.toLocaleDateString("en-GB", {
                              month: "short",
                              year: "2-digit",
                            })
                          : ""}
                      </span>
                    </div>
{openCheckIn && (
  <div className="absolute mt-2 p-2 bg-white shadow-lg rounded-xl z-20">
    <DayPicker
      mode="single"
      selected={checkIn}
      onSelect={(date) => {
        if (!date) { setOpenCheckIn(false); return; }
        setCheckIn(date);
        const nextDay = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
        if (!checkOut || checkOut <= date) {
          setCheckOut(nextDay);
        }
        setOpenCheckIn(false);
      }}
      disabled={{ before: today }}
    />
  </div>
)}
                  </div>

                  <div className="lg:col-span-2 p-4 cursor-pointer hover:bg-gray-50 relative">
                    <span
                      className="text-xs uppercase text-gray-400 block mb-1"
                      onClick={() => {
                        setOpenCheckOut(!openCheckOut);
                        setOpenCheckIn(false);
                      }}
                    >
                      Check-Out
                    </span>
                    <div
                      className="text-xl font-bold text-gray-800"
                      onClick={() => {
                        setOpenCheckOut(!openCheckOut);
                        setOpenCheckIn(false);
                      }}
                    >
                      {checkOut ? checkOut.getDate() : "--"}{" "}
                      <span className="text-sm font-semibold">
                        {checkOut
                          ? checkOut.toLocaleDateString("en-GB", {
                              month: "short",
                              year: "2-digit",
                            })
                          : ""}
                      </span>
                    </div>
                    {openCheckOut && (
                      <div className="absolute mt-2 p-2 bg-white shadow-lg rounded-xl z-20 right-0">
<DayPicker
  mode="single"
  selected={checkOut}
  onSelect={(date) => { if (!date) { setOpenCheckOut(false); return; } setCheckOut(date); setOpenCheckOut(false); }}
  disabled={{ before: checkIn ? new Date(checkIn.getFullYear(), checkIn.getMonth(), checkIn.getDate() + 1) : tomorrow }}
/>
                      </div>
                    )}
                  </div>

                  <div className="lg:col-span-3 p-4 hover:bg-gray-50">
                    <RoomsGuestsBox
                      value={roomsGuests}
                      onChange={setRoomsGuests}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ---------------- HOLIDAYS ---------------- */}
            {activeTab === "holidays" && (
              <div>
                <div className="grid grid-cols-1 lg:grid-cols-12 border border-gray-200 rounded-xl divide-y lg:divide-y-0 lg:divide-x divide-gray-200 mb-6">
                  {/* From City */}
                  <div className="lg:col-span-6 p-4 hover:bg-gray-50">
                    <LocationSearchBox
                      label="From City"
                      value={holidaysFrom}
                      placeholder="Noida"
                      onSelect={setHolidaysFrom}
                      showAllSections={false}
                      citySearchApi="/api/cities/airports"
                    />
                  </div>

                  {/* Destination */}
                  <div className="lg:col-span-6 p-4 hover:bg-gray-50">
                    <LocationSearchBox
                      label="To City/Country/Category"
                      value={holidaysTo}
                      placeholder="Goa"
                      onSelect={setHolidaysTo}
                      align="right"
                      showAllSections={false}
                      citySearchApi="/api/cities/holidays"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ---------------- BUSES ---------------- */}
            {activeTab === "buses" && (
              <div>
                <div className="grid grid-cols-1 lg:grid-cols-12 border border-gray-200 rounded-xl divide-y lg:divide-y-0 lg:divide-x divide-gray-200 mb-6">
                  <div className="lg:col-span-4 p-4 hover:bg-gray-50">
                    <LocationSearchBox
                      label="From City"
                      value={busFrom}
                      placeholder="Delhi"
                      onSelect={setBusFrom}
                      showAllSections={false}
                      citySearchApi="/api/cities/bus"
                    />
                  </div>
                  <div className="lg:col-span-4 p-4 hover:bg-gray-50">
                    <LocationSearchBox
                      label="To City"
                      value={busTo}
                      placeholder="Manali"
                      onSelect={setBusTo}
                      showAllSections={false}
                      citySearchApi="/api/cities/bus"
                    />
                  </div>
                  <div className="lg:col-span-4 p-4 cursor-pointer hover:bg-gray-50 relative">
                    <span
                      className="text-xs uppercase text-gray-400 block mb-1"
                      onClick={() => setOpenTravelDate(!openTravelDate)}
                    >
                      Travel Date
                    </span>
                    <div
                      className="text-xl font-bold text-gray-800"
                      onClick={() => setOpenTravelDate(!openTravelDate)}
                    >
                      {travelDate ? travelDate.getDate() : "--"}{" "}
                      <span className="text-sm font-semibold">
                        {travelDate
                          ? travelDate.toLocaleDateString("en-GB", {
                              month: "short",
                              year: "2-digit",
                            })
                          : ""}
                      </span>
                    </div>
{openTravelDate && (
  <div className="absolute mt-2 p-2 bg-white shadow-lg rounded-xl z-20 right-0">
    <DayPicker
      mode="single"
      selected={travelDate}
      onSelect={(date) => { if (!date) { setOpenTravelDate(false); return; } setTravelDate(date); setOpenTravelDate(false); }}
      disabled={{ before: today }}
    />
  </div>
)}
                  </div>
                </div>
              </div>
            )}

            {/* ---------------- CABS ---------------- */}
            {activeTab === "cabs" && (
              <div>
                <div className="grid grid-cols-1 lg:grid-cols-12 border border-gray-200 rounded-xl divide-y lg:divide-y-0 lg:divide-x divide-gray-200 mb-6">
                  {/* Trip Type Dropdown */}
                  <div
                    className="lg:col-span-4 p-4 hover:bg-gray-50/80 transition relative cursor-pointer"
                    ref={cabTripTypeRef}
                  >
                    <span
                      className="text-xs uppercase tracking-wider text-gray-400 mb-1 flex items-center justify-between"
                      onClick={() => setCabTripTypeOpen(!cabTripTypeOpen)}
                    >
                      Trip Type <ChevronDown className="w-3 h-3" />
                    </span>
                    <div
                      className="text-xl font-bold text-gray-800"
                      onClick={() => setCabTripTypeOpen(!cabTripTypeOpen)}
                    >
                      {cabTripTypeLabels[cabTripType]}
                    </div>

                    {cabTripTypeOpen && (
                      <div
                        className="absolute mt-2 w-72 bg-white shadow-2xl rounded-xl border border-gray-100 z-30 left-0 overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {[
                          { id: "oneway", label: "Outstation One-Way" },
                          { id: "round", label: "Outstation Round-Trip" },
                          { id: "hourly", label: "Hourly Rentals" },
                        ].map((opt) => (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => {
                              setCabTripType(opt.id);
                              setCabTripTypeOpen(false);
                            }}
                            className={`w-full text-left px-4 py-3 text-sm font-medium hover:bg-orange-50 transition ${
                              cabTripType === opt.id ? "text-orange-600 bg-orange-50" : "text-gray-700"
                            }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* From Location */}
                  <div className="lg:col-span-4 p-4 hover:bg-gray-50/80 transition cursor-pointer">
                    <LocationSearchBox
                      label="From Location"
                      value={cabFrom}
                      placeholder="Mumbai"
                      onSelect={setCabFrom}
                      showAllSections={false}
                      citySearchApi="/api/cities/cab"
                    />
                  </div>

                  {/* To Location */}
                  <div className="lg:col-span-4 p-4 hover:bg-gray-50/80 transition cursor-pointer">
                    <LocationSearchBox
                      label="To Location"
                      value={cabTo}
                      placeholder="Pune"
                      onSelect={setCabTo}
                      showAllSections={false}
                      citySearchApi="/api/cities/cab"
                    />
                  </div>
                </div>

                {/* -------- OUTSTATION ROUND-TRIP -------- */}
                {cabTripType === "round" && (
                  <div className="grid grid-cols-1 lg:grid-cols-12 border border-gray-200 rounded-xl divide-y lg:divide-y-0 lg:divide-x divide-gray-200 mb-6">
                    <div className="lg:col-span-2 p-4 hover:bg-gray-50/80 transition cursor-pointer">
                      <LocationSearchBox label="From" value={cabFrom} placeholder="Mumbai" onSelect={setCabFrom} showAllSections={false} citySearchApi="/api/cities/cab"/>
                    </div>
                    <div className="lg:col-span-2 p-4 hover:bg-gray-50/80 transition cursor-pointer">
                      <LocationSearchBox label="To" value={cabTo} placeholder="Pune" onSelect={setCabTo} showAllSections={false} citySearchApi="/api/cities/cab" />
                    </div>
                    <div className="lg:col-span-2 p-4 cursor-pointer hover:bg-gray-50 relative" onClick={() => setOpenCabDate(!openCabDate)}>
                      <span className="text-xs uppercase text-gray-400 block mb-1">Departure</span>
                      <div className="text-xl font-bold text-gray-800">
                        {cabDate ? cabDate.getDate() : "--"}{" "}
                        <span className="text-sm font-semibold">
                          {cabDate ? cabDate.toLocaleDateString("en-GB", { month: "short" }) : ""}
                        </span>
                      </div>
                      {openCabDate && (
                        <div className="absolute mt-2 p-2 bg-white shadow-lg rounded-xl z-20">
                          <DayPicker
                            mode="single"
                            selected={cabDate}
                            onSelect={(d) => { setCabDate(d); setOpenCabDate(false); }}
                            disabled={{ before: today }}
                          />
                        </div>
                      )}
                    </div>
                    <div className="lg:col-span-2 p-4 cursor-pointer hover:bg-gray-50 relative" onClick={() => setOpenReturnDate(!openReturnDate)}>
                      <span className="text-xs uppercase text-gray-400 block mb-1">Return</span>
                      <div className="text-xl font-bold text-gray-800">
                        {cabReturnDate ? cabReturnDate.getDate() : "--"}{" "}
                        <span className="text-sm font-semibold">
                          {cabReturnDate ? cabReturnDate.toLocaleDateString("en-GB", { month: "short" }) : ""}
                        </span>
                      </div>
                      {openReturnDate && (
                        <div className="absolute mt-2 p-2 bg-white shadow-lg rounded-xl z-20">
                          <DayPicker mode="single" selected={cabReturnDate} onSelect={(d) => { setCabReturnDate(d); setOpenReturnDate(false); }} disabled={{ before: cabDate || today }} />
                        </div>
                      )}
                    </div>
                    <div className="lg:col-span-2 p-4">
                      <span className="text-xs uppercase text-gray-400 block mb-1">Pickup-Time</span>
                      <input type="time" value={pickupTime} onChange={(e) => setPickupTime(e.target.value)}
                        className="text-xl font-bold text-gray-800 outline-none bg-transparent" />
                    </div>
                    <div className="lg:col-span-2 p-4">
                      <span className="text-xs uppercase text-gray-400 block mb-1">Drop Time</span>
                      <input type="time" value={dropTime} onChange={(e) => setDropTime(e.target.value)}
                        className="text-xl font-bold text-gray-800 outline-none bg-transparent" />
                    </div>
                  </div>
                )}

                {/* -------- HOURLY RENTALS -------- */}
                {cabTripType === "hourly" && (
                  <div className="grid grid-cols-1 lg:grid-cols-12 border border-gray-200 rounded-xl divide-y lg:divide-y-0 lg:divide-x divide-gray-200 mb-6">
                    <div className="lg:col-span-4 p-4 hover:bg-gray-50/80 transition cursor-pointer">
                      <LocationSearchBox label="Pickup Location" value={cabFrom} placeholder="Bangalore" onSelect={setCabFrom} showAllSections={false} citySearchApi="/api/cities/cab" />
                    </div>
                    <div className="lg:col-span-3 p-4 cursor-pointer hover:bg-gray-50 relative" onClick={() => setOpenCabDate(!openCabDate)}>
                      <span className="text-xs uppercase text-gray-400 block mb-1">Pickup Date</span>
                      <div className="text-xl font-bold text-gray-800">
                        {cabDate ? cabDate.getDate() : "--"}{" "}
                        <span className="text-sm font-semibold">
                          {cabDate ? cabDate.toLocaleDateString("en-GB", { month: "short" }) : ""}
                        </span>
                      </div>
                      {openCabDate && (
                        <div className="absolute mt-2 p-2 bg-white shadow-lg rounded-xl z-20">
                          <DayPicker mode="single" selected={cabDate} onSelect={(d) => { setCabDate(d); setOpenCabDate(false); }} />
                        </div>
                      )}
                    </div>
                    <div className="lg:col-span-2 p-4">
                      <span className="text-xs uppercase text-gray-400 block mb-1">Pickup-Time</span>
                      <input type="time" value={pickupTime} onChange={(e) => setPickupTime(e.target.value)}
                        className="text-xl font-bold text-gray-800 outline-none bg-transparent" />
                    </div>
                    <div className="lg:col-span-3 p-4">
                      <span className="text-xs uppercase text-gray-400 block mb-1">Select Package</span>
                      <select
                        value={cabPackage}
                        onChange={(e) => setCabPackage(e.target.value)}
                        className="text-xl font-bold text-gray-800 outline-none bg-transparent w-full"
                      >
                        <option value="1hr-10km">1 hrs 10 kms</option>
                        <option value="4hr-40km">4 hrs 40 kms</option>
                        <option value="8hr-80km">8 hrs 80 kms</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ✅ SINGLE SEARCH BUTTON — sabhi tabs ke liye ek hi jagah */}
          <button
            onClick={handleSearch}
            className="absolute left-1/2 -translate-x-1/2 -bottom-9 bg-gradient-to-r from-[#9b3f00] via-[#c45100] to-[#ff5a00] text-white px-24 py-5 rounded-full font-bold text-2xl tracking-[3px] uppercase shadow-[0_15px_35px_rgba(0,0,0,.25)] hover:scale-105 transition"
          >
            {searchLabels[activeTab]}
          </button>
        </div>
      </div>
    </section>
  );
}