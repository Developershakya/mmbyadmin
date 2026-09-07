"use client";
import Header from "@/components/Header";
import {
  ArrowLeft,
  Bed,
  CalendarDays,
  CarFrontIcon,
  MapPin,
  Search,
  SoupIcon,
  StarIcon,
} from "lucide-react";
import { forwardRef, useEffect, useMemo, useRef, useState } from "react";

const SearchBox = forwardRef(
  ({ searchOpen, value, onValueChange, setSearchOpen }, ref) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [filterData, setFilterData] = useState([]);

    useEffect(() => {
      const fetchCities = async () => {
        try {
          if (!searchTerm || searchTerm.trim().length < 2) {
            setFilterData([]);
            return;
          }

          const response = await fetch(`../api/cities/cab?query=${searchTerm}`);
          const data = await response.json();
          setFilterData(data);
        } catch (error) {
          console.log(error);
        }
      };
      fetchCities();
      if (searchOpen && ref && ref.current) {
        ref.current.focus();
      }
    }, [searchOpen, ref, searchTerm]);

    return (
      <div
        className={` ${searchOpen ? "" : "hidden"} fixed inset-0 sm:inset-auto p-3 min-w-[350px]  z-9999 sm:absolute top-0 sm:top-6 sm:-left-8 bg-white shadow-md rounded-lg border   border-gray-200 gap-2 flex flex-col transition-all duration-150`}
      >
        {" "}
        <ArrowLeft
          className="text-gray-600 sm:hidden"
          onClick={() => setSearchOpen(null)}
        />
        <div className="flex  rounded-lg border border-gray-300 p-3 sm:p-2 items-center gap-2">
          <Search size={16} className="text-gray-400" />
          <input
            ref={ref}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            type="text"
            className="outline-none w-full text-sm text-gray-800 "
            placeholder="Search from city"
          />
        </div>
        {searchTerm.length < 2 ? (
          <div className="p-2 text-xs text-gray-400 flex justify-center py-6">
            Type at least 2 letters to search cities
          </div>
        ) : filterData.length > 0 ? (
          <div className="sm:max-h-60 overflow-y-auto">
            {filterData.map((item) => (
              <div
                key={item.cityid || item.code}
                onClick={() => {
                  onValueChange(item.Destination);
                  setSearchTerm(item.Destination);
                  setSearchOpen(null);
                }}
                className="p-2 rounded-xl border-b border-gray-50  text-md capitalize flex items-center gap-4 hover:bg-amber-100 cursor-pointer  text-gray-700"
              >
                <div className=" p-2 w-12 h-12 items-center flex justify-center rounded-xl bg-gray-500 text-white font-semibold">
                  {item.cityid}
                </div>
                <div className="flex flex-col ">
                  <span className=""> {item.Destination} </span>
                  <span className="text-xs text-gray-600"> {item.country} </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-2 text-xs text-gray-400 flex justify-center py-6">
            No cities found
          </div>
        )}
      </div>
    );
  },
);
SearchBox.displayName = "SearchBox";

function PriceSlider({ min, max, initialValue, onFilterChange }) {
  const [localPrice, setLocalPrice] = useState(initialValue);

  useEffect(() => {
    setLocalPrice(initialValue);
  }, [initialValue]);

  const progressPercent =
    max === min ? 0 : ((localPrice - min) / (max - min)) * 100;

  const handleDragEnd = () => {
    if (onFilterChange) {
      onFilterChange(localPrice);
    }
  };

  return (
    <div className="w-[200px] max-w-xs p">
      <div className="flex justify-between text-sm font-semibold text-gray-700 mb-3">
        <span>Max Budget:</span>
        <span className="text-orange-600 font-bold text-base tabular-nums">
          ₹{localPrice.toLocaleString()}
        </span>
      </div>

      <div className="relative w-full h-2 bg-gray-200 rounded-lg flex items-center">
        <div
          className="absolute h-2 bg-orange-600 rounded-lg left-0 top-0 pointer-events-none"
          style={{ width: `${progressPercent}%` }}
        ></div>

        <input
          type="range"
          min={min}
          max={max}
          step="1"
          value={localPrice}
          onChange={(e) => setLocalPrice(Number(e.target.value))}
          onMouseUp={handleDragEnd}
          onTouchEnd={handleDragEnd}
          className="absolute w-full h-4 opacity-0 cursor-pointer z-10 top-1/2 -translate-y-1/2"
        />

        <div
          className="absolute w-5 h-5 bg-white border-2 border-orange-600 rounded-full shadow pointer-events-none transform -translate-x-1/2"
          style={{ left: `${progressPercent}%` }}
        ></div>
      </div>
    </div>
  );
}

const DURATION_OPTIONS = Array.from({ length: 9 }, (_, i) => {
  const days = i + 2;
  return { days, label: `${days - 1}N / ${days}D` };
});

export default function Packages() {
  const [selectOption, setSelect] = useState(null);
  const [searchOpen, setSearchOpen] = useState(null);
  const [destination, setDestination] = useState("Goa");
  const [passenger, setPassanger] = useState(false);
  const [origin, setOrigin] = useState("Delhi");
  const [adult, setAdult] = useState(1);
  const [child, setChild] = useState(0);
  const [infant, setInfant] = useState(0);
  const [budget, setBudget] = useState();
  const [sortOrder, setSortOrder] = useState("");
  const [selectedStates, setSelectedStates] = useState([]);

  const [duration, setDuration] = useState(4);
  const [durationOpen, setDurationOpen] = useState(false);
  const [customDays, setCustomDays] = useState("");
  const [searchFrom ,setSearchForm] = useState({
    
  })
  const searchOpenRef = useRef();
  const passengerRef = useRef();
  const durationRef = useRef();
  const label = "text-[12px] text-gray-600 tracking-widest uppercase";

  const pack = [
    {
      packageName: "Manali Package Trip",
      coverLocation: ["solang valley", "rohtang"],
      city: "Manali",
      state: "Himachal",
      totalPrice: 39000,
      offerPrice: 38000,
      hotel: ["manali luxury hotel"],
      foodType: ["Breakfast"],
      totalTransfer: 3,
      rating: "5",
      days: 4,
      tagType: "Best",
      coverImage: "https://i.ytimg.com/vi/7NKk41YVWyA/maxresdefault.jpg",
    },

    {
      packageName: "Manali Premium Adventure",
      coverLocation: ["kasol", "manikaran"],
      city: "Manali",
      state: "Himachal",
      totalPrice: 40000,
      offerPrice: 36000,
      hotel: ["mountain view resort"],
      foodType: ["Breakfast", "Lunch"],
      totalTransfer: 2,
      rating: "1",
      days: 5,
      tagType: "Popular",
      coverImage:
        "https://i.pinimg.com/736x/c4/1b/24/c41b245b832fffa9e3ea316f8bcec015.jpg",
    },
    {
      packageName: "Shimla & Kufri Explorer",
      coverLocation: ["mall road", "kufri"],
      city: "Shimla",
      state: "Himachal",
      totalPrice: 32000,
      offerPrice: 28000,
      hotel: ["shimla grand residency"],
      foodType: ["Breakfast", "Dinner"],
      totalTransfer: 4,
      rating: "4",
      days: 3,
      tagType: "Trending",
      coverImage:
        "https://i.pinimg.com/736x/61/76/11/617611ac168f92de98f485c0bcece2db.jpg",
    },
    {
      packageName: "Goa Beach Party Trip",
      coverLocation: ["baga beach", "calangute"],
      city: "North Goa",
      state: "Goa",
      totalPrice: 45000,
      offerPrice: 41000,
      hotel: ["goa beach resort"],
      foodType: ["Breakfast", "Lunch", "Dinner"],
      totalTransfer: 5,
      rating: "5",
      days: 6,
      tagType: "Best Seller",
      coverImage:
        "https://i.pinimg.com/1200x/f5/df/90/f5df90f664d65b29009c6e91cadd1f24.jpg",
    },
    {
      packageName: "Kerala Backwaters & Hills",
      coverLocation: ["munnar", "alleppey"],
      city: "Munnar",
      state: "Kerala",
      totalPrice: 50000,
      offerPrice: 46000,
      hotel: ["tea valley resort", "houseboat"],
      foodType: ["Breakfast", "Dinner"],
      totalTransfer: 3,
      rating: "5",
      days: 5,
      tagType: "Recommended",
      coverImage:
        "https://i.pinimg.com/736x/3a/48/77/3a4877acae3645a2199e34afe8fc14fc.jpg",
    },
  ];
  const { minOfferPrice, maxOfferPrice } = useMemo(() => {
    const min = pack.reduce(
      (min, p) => (min.offerPrice < p.offerPrice ? min : p),
      pack[0],
    );
    const max = pack.reduce(
      (max, p) => (max.offerPrice > p.offerPrice ? max : p),
      pack[0],
    );

    return {
      minOfferPrice: min.offerPrice,
      maxOfferPrice: max.offerPrice,
    };
  }, []);
  const currentBudget = budget ?? maxOfferPrice;
  const filterData = pack
    .filter((item) => {
      const matchesBudget = item.offerPrice <= currentBudget;
      const matchesState =
        selectedStates.length === 0 || selectedStates.includes(item.city);
      return matchesBudget && matchesState;
    })
    .sort((a, b) => {
      if (sortOrder === "low") {
        return a.offerPrice - b.offerPrice;
      }
      if (sortOrder === "high") {
        return b.offerPrice - a.offerPrice;
      }
      return 0;
    });

  const getAllDestinations = (pack) => {
    const location = {};
    const destinationList = [];
    let i = 0;

    while (i < pack.length) {
      const cityName = pack[i].city;

      if (!location[cityName]) {
        location[cityName] = true;
        destinationList.push(cityName);
      }
      i++;
    }
    return destinationList;
  };

  const allDestination = getAllDestinations(pack);

  function foodTag(f) {
    if (f.length >= 3) {
      return "All Include";
    } else if (f.length == 2) {
      return "Lunch";
    } else {
      return "BreakFast";
    }
  }

  function cardTagColor(t) {
    if (!t) return "bg-gray-600";
    if (t.toLowerCase() == "best") {
      return "bg-orange-600";
    } else {
      return "bg-green-600";
    }
  }

  function fiveStar(c) {
    const rating = parseInt(c) || 0;
    const stars = [];

    for (let i = 1; i <= 5; i++) {
      if (i <= rating) {
        stars.push(<StarIcon key={i} size={16} className="text-yellow-500" />);
      } else {
        stars.push(<StarIcon key={i} size={16} className="text-gray-200" />);
      }
    }

    return <div className="flex">{stars}</div>;
  }
  const handleCheckboxChange = (stateName) => {
    setSelectedStates((prev) => {
      if (prev.includes(stateName)) {
        return prev.filter((s) => s !== stateName);
      } else {
        return [...prev, stateName];
      }
    });
  };

  useEffect(() => {
    function handleOutClick(e) {
      if (searchOpenRef.current && !searchOpenRef.current.contains(e.target)) {
        setSearchOpen(null);
      }
      if (passengerRef.current && !passengerRef.current.contains(e.target)) {
        setPassanger(false);
      }

      if (durationRef.current && !durationRef.current.contains(e.target)) {
        setDurationOpen(false);
      }
    }
    document.addEventListener("mousedown", handleOutClick);
    return () => document.removeEventListener("mousedown", handleOutClick);
  });
  useEffect(()=>{
    async function fetchPackage(){
      try{

      }
    }
    fetchPackage()
  },[])

  return (
    <>
      <Header />

      <div className=" flex py-12   flex-col bg-gradient-to-r from-emerald-900 to-emerald-800 ">
        <div className="flex flex-col mx-auto p-6">
          <div className="">
            <p className="text-sm text-gray-300 tracking-widest">
              ------ MMBY PACKAGE · PACKAGE FARES
            </p>
            <h3 className="text-white font-serif text-5xl font-semibold my-4">
              Find your next trip,
              <br />
              <span className="text-orange-600  italic ">
                price like a ticket.
              </span>
            </h3>

            <p className="text-gray-300 mt-4 mb-12 max-w-lg">
              Every package here shows two honest fares: join the trip yourself,
              or fly in from home with the flight already booked.
            </p>
          </div>
          <div
            ref={searchOpenRef}
            className="w-full grid grid-cols-1  md:grid-cols-6   bg-white    shadow-md rounded-2xl "
          >
            <div className="flex   relative flex-col md:border-r md:border-dashed border-gray-300">
              <SearchBox
                searchOpen={searchOpen === "origin"}
                value={origin}
                onValueChange={(val) => setOrigin(val)}
                setSearchOpen={setSearchOpen}
              />
              <div
                onClick={() => setSearchOpen("origin")}
                className="flex flex-col hover:bg-gray-100 rounded-tl-2xl rounded-bl-2xl transition-all px-8 py-4"
              >
                <label htmlFor="" className={label}>
                  Traveling from
                </label>
                <div className="text-lg capitalize font-semibold tracking-wider text-gray-600">
                  {origin}
                </div>
              </div>
            </div>
            {/* <Ellipsis /> */}
            <div className="flex relative flex-col md:border-r md:border-dashed border-gray-300">
              <SearchBox
                searchOpen={searchOpen === "destination"}
                value={destination}
                onValueChange={(val) => setDestination(val)}
                setSearchOpen={setSearchOpen}
              />
              <div
                onClick={() => setSearchOpen("destination")}
                className="flex flex-col hover:bg-gray-100 transition-all px-8 py-4 "
              >
                <label htmlFor="" className={label}>
                  Destination
                </label>
                <div className="text-lg capitalize font-semibold tracking-wider text-gray-600">
                  {destination}
                </div>
              </div>
            </div>

            <div className="flex hover:bg-gray-100 transition-all px-8 py-4 flex-col md:border-r md:border-dashed border-gray-300">
              <label htmlFor="" className={label}>
                Date
              </label>
              <input
                type="date"
                className="outline-none text-gray-600 text-sm min-w-[65px]"
              />
            </div>

            <div
              ref={durationRef}
              className="flex relative flex-col md:border-r md:border-dashed border-gray-300"
            >
              <div
                className="flex flex-col hover:bg-gray-100 transition-all px-8 py-4 cursor-pointer select-none"
                onClick={() => setDurationOpen((prev) => !prev)}
              >
                <label htmlFor="" className={label}>
                  Duration
                </label>
                <span className="flex items-center gap-1 text-lg font-semibold tracking-wider text-gray-600">
                  <CalendarDays size={16} className="text-orange-600" />
                  {duration - 1}N / {duration}D
                </span>
              </div>

              <div
                className={`${
                  durationOpen ? "" : "hidden"
                } absolute z-20 top-[calc(100%+4px)] left-1/2 -translate-x-1/2 sm:left-0 sm:translate-x-0 w-[85vw] max-w-[260px] sm:w-[240px] p-3 bg-white shadow-md rounded-lg border border-gray-200 transition-all duration-150`}
              >
                <h3 className="text-xs text-gray-500 font-semibold uppercase tracking-widest mb-2">
                  Select trip length
                </h3>
                <div className="grid grid-cols-3 gap-2">
                  {DURATION_OPTIONS.map((opt) => (
                    <button
                      key={opt.days}
                      type="button"
                      onClick={() => {
                        setDuration(opt.days);
                        setCustomDays("");
                        setDurationOpen(false);
                      }}
                      className={`text-xs font-semibold rounded-lg py-2 px-1 border transition-all ${
                        duration === opt.days && customDays === ""
                          ? "bg-orange-600 text-white border-orange-600"
                          : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-orange-100 hover:border-orange-300"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>

                <div className="mt-3 pt-3 border-t border-dashed border-gray-200">
                  <label className="text-[11px] text-gray-500 font-semibold uppercase tracking-widest">
                    Need 10+ days? Enter here
                  </label>
                  <div className="flex gap-2 mt-2">
                    <input
                      type="number"
                      min={1}
                      max={90}
                      placeholder="e.g. 15"
                      value={customDays}
                      onChange={(e) => setCustomDays(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && customDays) {
                          setDuration(Number(customDays));
                          setDurationOpen(false);
                        }
                      }}
                      className="w-full text-sm px-3 py-2 rounded-lg border border-gray-300 outline-none focus:border-orange-500"
                    />
                    <button
                      type="button"
                      disabled={!customDays || Number(customDays) < 1}
                      onClick={() => {
                        setDuration(Number(customDays));
                        setDurationOpen(false);
                      }}
                      className="text-xs font-semibold px-3 rounded-lg bg-orange-600 text-white disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Set
                    </button>
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1">
                    Enter the total number of days (e.g. "15" for a 15-day trip)
                  </p>
                </div>
              </div>
            </div>

            <div
              ref={passengerRef}
              className="flex relative  flex-col md:border-r md:border-dashed border-gray-300"
            >
              <div
                className="flex flex-col hover:bg-gray-100 transition-all px-8 py-4"
                onClick={() => setPassanger((prev) => (prev = !prev))}
              >
                <label htmlFor="" className={label}>
                  Travellers
                </label>
                <span>
                  {adult} Adult {child >= 1 && `,${child} Child`}{" "}
                  {infant >= 1 && `,${infant} Infant`}
                </span>
              </div>
              <div
                className={`${passenger ? "" : "hidden"} p-2 transition-all duration-300  min-w-[200px] max-w-[85vw] absolute top-[calc(100%+4px)] z-20 left-1/2 -translate-x-1/2 sm:left-1 sm:translate-x-0 bg-white shadow-md rounded-lg border  border-gray-200`}
              >
                <div className="flex flex-col gap-4 p-2">
                  <div className="flex justify-between items-center">
                    <button
                      onClick={() =>
                        setAdult((prev) => (prev <= 1 ? 1 : prev - 1))
                      }
                      className="cursor-pointer select-none py-1 px-2 bg-orange-600 text-white font-semibold rounded-xl "
                    >
                      -
                    </button>
                    <span className="text-sm text-gray-800">{adult} Adult</span>
                    <button
                      onClick={() => setAdult((prev) => prev + 1)}
                      className="cursor-pointer select-none py-1 px-2 bg-orange-600 text-white font-semibold rounded-xl"
                    >
                      +
                    </button>
                  </div>
                  <div className="flex justify-between items-center">
                    <button
                      onClick={() =>
                        setChild((prev) => (prev <= 1 ? 0 : prev - 1))
                      }
                      className="cursor-pointer select-none py-1 px-2 bg-orange-600 text-white font-semibold rounded-xl"
                    >
                      -
                    </button>
                    <span className="text-sm text-gray-800">{child} Child</span>
                    <button
                      onClick={() => setChild((prev) => prev + 1)}
                      className="cursor-pointer select-none py-1 px-2 bg-orange-600 text-white font-semibold rounded-xl"
                    >
                      +
                    </button>
                  </div>
                  <div className="flex justify-between items-center">
                    <button
                      onClick={() =>
                        setInfant((prev) => (prev <= 1 ? 0 : prev - 1))
                      }
                      className="cursor-pointer select-none py-1 px-2 bg-orange-600 text-white font-semibold rounded-xl"
                    >
                      -
                    </button>
                    <span className="text-sm text-gray-800">
                      {infant} Infant
                    </span>
                    <button
                      onClick={() => setInfant((prev) => prev + 1)}
                      className="cursor-pointer select-none py-1 px-2 bg-orange-600 text-white font-semibold rounded-xl"
                    >
                      +
                    </button>
                  </div>
                </div>
                <div className="p-2"></div>
              </div>
            </div>

            <div className="flex justify-center items-center">
              <button className="bg-orange-600 cursor-pointer select-none text-white p-4 rounded-lg">
                Search
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-amber-50 p-4 sm:p-4 ">
        <div className="flex max-w-7xl mx-auto ">
          <div className="sticky top-25 z-50 h-fit  hidden lg:flex flex-col lg:min-w-[200px] p-2">
            <div className="flex w-full justify-between">
              <h3 className="uppercase text-gray-800 text-sm tracking-widest">
                Filter
              </h3>
              <h3 className="uppercase text-orange-600 text-sm tracking-widest cursor-pointer select-none ">
                Reset
              </h3>
            </div>
            <div className="border-b py-2">
              <h3 className="py-4 text-sm font-semibold uppercase font-mono tracking-wider">
                Budget per person
              </h3>
              <PriceSlider
                min={minOfferPrice}
                max={maxOfferPrice}
                initialValue={currentBudget}
                onFilterChange={(selectBudget) => setBudget(selectBudget)}
              />

              <div className="flex justify-between my-2 select-none">
                <span className="text-xs text-gray-500">₹{minOfferPrice}</span>
                <span className="text-xs text-gray-500">₹{maxOfferPrice}</span>
              </div>
            </div>
            <div className="gap-2 border-b py-4">
              <h3 className="py-4 text-sm font-semibold uppercase font-mono tracking-wider">
                Destination
              </h3>
              {allDestination.map((des) => {
                return (
                  <div key={des} className="flex space-y-2 space-x-2 text-sm ">
                    <input
                      type="checkbox"
                      value={des}
                      checked={selectedStates.includes(des)}
                      onChange={() => handleCheckboxChange(des)}
                      className="w-5 h-5 cursor-pointer accent-orange-600 rounded"
                    />
                    <span>{des}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex-1 sm:p-2">
            <div className="flex justify-between items-center">
              <span className="text-gray-800 font-semibold text-sm">
                {filterData.length} package found
              </span>

              <div className="flex gap-4 items-center">
                <span className="text-sm tracking-wider font-thin ">Sort:</span>
                <select
                  name=""
                  id=""
                  className="py-2 px-4 text-sm rounded-xl bg-white border"
                  onChange={(e) => setSortOrder(e.target.value)}
                >
                  <option value="">Recommended</option>
                  <option
                    value="high"
                    className="text-sm tracking-wider font-thin "
                  >
                    Price high to low
                  </option>
                  <option
                    value="low"
                    className="text-sm tracking-wider font-thin "
                  >
                    Price low to high
                  </option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 p-2 gap-8">
              {filterData.map((p, i) => {
                const TAG_COLOR = cardTagColor(p.tagType);
                return (
                  <div
                    key={`${p.packageName}-${i}`}
                    onClick={() => setSelect((prev) => (prev === i ? null : i))}
                    className={` bg-white min-w-[350px]  relative rounded-xl  shadow-md overflow-hidden`}
                  >
                    <div
                      className={`p-4 z-8 absolute bottom-0 left-0 w-full h-full  rounded-t-2xl border
                       duration-100 ease-out
                      
                      
                      bg-black/10 backdrop-blur-xs border-white/20
                      
                      ${selectOption === i ? "translate-y-0" : "translate-y-full"}`}
                    ></div>

                    <div
                      className={`  p-4 z-10 absolute  transition-all duration-300 left-0 bottom-0 w-full bg-white rounded-2xl border
                       ${selectOption === i ? "translate-y-0" : "translate-y-full"}`}
                    >
                      <h3 className={`${label} mb-4`}>
                        please select an option
                      </h3>
                      <div className="gap-4 flex flex-col">
                        <div className="p-4 border rounded-xl">
                          <h2>With Flight</h2>
                          <p>Starting from </p>
                        </div>
                        <div className="p-4 border rounded-xl">
                          <h2>Without Flight</h2>
                          <p>Starting from </p>
                        </div>
                      </div>
                    </div>
                    <div className="relative">
                      <span
                        className={`${TAG_COLOR}  absolute top-4 left-4  text-white  text-xs font-semibold p-1 px-2 rounded-md`}
                      >
                        {p.tagType && p.tagType}
                      </span>
                      <span className="absolute top-4 right-4 bg-gray-600 text-white  text-[10px] font-semibold p-1 px-2 rounded-md">
                        {p.days - 1}N/{p.days}D
                      </span>
                      <p className="absolute flex bottom-2 left-8 items-center justify-between font-mono  text-white  font-thin text-xs gap-1">
                        <MapPin size={14} />
                        {p.city}{" "}
                        <span className="w-1 h-1 mx-1 flex bg-gray-300 rounded-full"></span>{" "}
                        {p.state}
                      </p>
                      <img
                        src={p.coverImage}
                        alt={p.packageName}
                        style={{
                          height: "200px",
                          width: "100%",
                          objectFit: "cover",
                        }}
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold font-serif  capitalize text-xl">
                        {p.packageName}
                      </h3>
                      <div className="flex gap-2 font-mono">
                        {p.coverLocation.map((c, index) => {
                          return (
                            <div
                              key={index}
                              className="flex items-center gap-2"
                            >
                              <p className="text-gray-400 text-xs ">{c}</p>
                              <span className="w-1 h-1 flex bg-gray-300  rounded-full"></span>
                            </div>
                          );
                        })}
                      </div>

                      <div className="flex my-2 gap-3">
                        {p.hotel && (
                          <div className="flex gap-1 items-center text-gray-500 text-sm">
                            <Bed size={14} className="" /> <span>hotel</span>
                          </div>
                        )}

                        <div className="flex gap-1 items-center text-gray-500 text-sm">
                          <SoupIcon size={14} className="" />{" "}
                          <span>{foodTag(p.foodType)}</span>
                        </div>
                        <div className="flex gap-1 items-center text-gray-500 text-sm">
                          <CarFrontIcon size={14} className="" />
                          <span>{p.totalTransfer}</span>
                        </div>
                      </div>
                      <div className="flex items-center  gap-2 mb-4">
                        {fiveStar(p.rating)}

                        <span className="text-[10px] text-gray-800 font-semibold bg-orange-300 px-2 py-0.5 rounded-md">
                          {p.rating}
                        </span>
                      </div>
                      <div className="flex justify-between items-center border-t border-dashed p-4 border-gray-300">
                        <div className="flex gap-2 items-center">
                          <span className="font-semibold text-2xl">
                            ₹{p.offerPrice.toLocaleString("en")}
                          </span>
                          <span className="text-gray-400 text-sm line-through">
                            ₹{p.totalPrice.toLocaleString("en")}
                          </span>
                        </div>
                        <button className="bg-gray-800 text-white font-semibold py-2 px-4 rounded-lg tracking-wider cursor-pointer">
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
