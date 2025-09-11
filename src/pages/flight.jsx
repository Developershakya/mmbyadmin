"use client";
import { useState } from "react";
import Image from "@/components/ui/image";
import Link from "next/link";
import { Plane, Hotel, Car, Bus, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Calendar as CalendarIcon } from "lucide-react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";

export default function FlightsPage() {
  const [tripType, setTripType] = useState("oneway");
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);
  const [travelClass, setTravelClass] = useState("");

  const displayValue = `${adults} Adult${adults > 1 ? "s" : ""}${
    children > 0 ? `, ${children} Child${children > 1 ? "ren" : ""}` : ""
  }${infants > 0 ? `, ${infants} Infant${infants > 1 ? "s" : ""}` : ""}`;

  // const [selected, setSelected] = useState(new Date());
  // const [open, setOpen] = useState(false); // ✅ state for calendar visibility
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [openDeparture, setOpenDeparture] = useState(false);
  const [openReturn, setOpenReturn] = useState(false);

  const [departureDate, setDepartureDate] = useState(new Date());
  const [returnDate, setReturnDate] = useState(new Date());

  const airlines = [
    {
      name: "International",
      logo: "/flights/inter-flight.jpeg",
    },
    {
      name: "Domestic",
      logo: "/flights/domestic.jpg",
    },
  ];

  const indianCities = [
    "Delhi",
    "Mumbai",
    "Bengaluru",
    "Chennai",
    "Kolkata",
    "Hyderabad",
    "Pune",
    "Jaipur",
    "Ahmedabad",
    "Lucknow",
    "Chandigarh",
    "Goa",
    "Agra",
    "Varanasi",
    "Patna",
    "Bhopal",
    "Indore",
    "Nagpur",
    "Surat",
    "Amritsar",
  ];

  const flights = [
    {
      city: "Chennai Flights",
      routes: "Via - Delhi, Mumbai, Coimbatore, Madurai",
      image: "/flights/Coimbatore.png",
    },
    {
      city: "Goa Flights",
      routes: "Via - Delhi, Mumbai, Bangalore, Ahmedabad",
      image: "/flights/Goa.jpg",
    },
    {
      city: "Mumbai Flights",
      routes: "Via - Delhi, Bangalore, Chennai, Ahmedabad",
      image: "/flights/marine drive.jpeg",
    },
    {
      city: "Hyderabad Flights",
      routes: "Via - Chennai, Mumbai, Bangalore, Delhi",
      image: "/flights/hyderabad.jpeg",
    },
    {
      city: "Delhi Flights",
      routes: "Via - Mumbai, Pune, Bangalore, Chennai",
      image: "/flights/delhi.jpg",
    },
    {
      city: "Pune Flights",
      routes: "Via - Delhi, Bangalore, Chennai, Ahmedabad",
      image: "/flights/pune.jpeg",
    },
    {
      city: "Kolkata Flights",
      routes: "Via - Delhi, Mumbai, Bangalore, Pune",
      image: "/flights/kolkata.jpeg",
    },
    {
      city: "Bangalore Flights",
      routes: "Via - Delhi, Pune, Mumbai, Kolkata",
      image: "/flights/bangalore.jpeg",
    },
    {
      city: "Jaipur Flights",
      routes: "Via - Mumbai, Delhi, Pune, Bangalore",
      image: "/flights/jaipur.png",
    },
  ];

  return (
    <>
      <Header />
      <section
        className="relative  bg-center py-16 "
        // style={{ backgroundImage: "url('/images/video/v1.mp4')" }}
        style={{ backgroundImage: "url('/img/bg/map.png')" }}
      >
        {/* Background Video */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover z-[-1]"
        >
          <source src="/images/video/flight.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        {/* <div className="absolute inset-0 bg-black opacity-20"></div> */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-xl lg:text-7xl md:text-4xl sm:text-3xl font-bold captalize text-white mb-4">
              MAKE MY BHARAT YATRA
            </h1>
            <p className="text-xl text-white font-bold mb-8">
              Flights • Hotels • Holiday Packages • Buses • Cabs
            </p>
          </div>

          <Card>
            <CardContent>
              <Tabs defaultValue="flights" className="w-full">
                <TabsList className="flex justify-around w-full grid-cols-5  mb-6 bg- ">
                  {/* Flights */}
                  <Link href="/flight">
                    <TabsTrigger
                      value="flights"
                      className="flex items-center gap-2"
                    >
                      <Plane className="w-10 h-10" />
                    </TabsTrigger>
                  </Link>

                  {/* Hotels */}
                  <Link href="/hotel">
                    <TabsTrigger
                      value="hotels"
                      className="flex items-center gap-2"
                    >
                      <Hotel className="w-10 h-10" />
                    </TabsTrigger>
                  </Link>

                  {/* Packages */}
                  <Link href="/package">
                    <TabsTrigger
                      value="packages"
                      className="flex items-center gap-2"
                    >
                      <MapPin className="w-10 h-10" />
                    </TabsTrigger>
                  </Link>

                  {/* Bus */}
                  <Link href="/bus">
                    <TabsTrigger
                      value="bus"
                      className="flex items-center gap-2"
                    >
                      <Bus className="w-10 h-10" />
                    </TabsTrigger>
                  </Link>

                  {/* Cabs */}
                  <Link href="/cab">
                    <TabsTrigger
                      value="cabs"
                      className="flex items-center gap-2"
                    >
                      <Car className="w-10 h-10" />
                    </TabsTrigger>
                  </Link>
                </TabsList>

                <TabsContent value="flights">
                  <div className="w-full max-w-6xl mx-auto bg-white rounded-xl shadow-lg p-3">
                    {/* Trip Type Tabs */}
                    <div className="flex flex-wrap items-center gap-4 md:gap-6 text-sm font-medium text-black mb-6">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="tripType"
                          value="oneway"
                          checked={tripType === "oneway"}
                          onChange={(e) => setTripType(e.target.value)}
                          className="text-orange-500"
                        />
                        One Way
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="tripType"
                          value="roundtrip"
                          checked={tripType === "roundtrip"}
                          onChange={(e) => setTripType(e.target.value)}
                          className="text-orange-500"
                        />
                        Round Trip
                      </label>

                      <span className="ml-auto text-base md:text-lg text-black font-bold">
                        Flights Booking
                      </span>
                    </div>

                    {/* Booking Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6 items-end">
                      {/* Pickup Location */}
                      <div>
                        <label className="text-xs uppercase font-medium text-slate-500">
                          From
                        </label>
                        <select
                          value={from}
                          onChange={(e) => setFrom(e.target.value)}
                          className="w-full font-bold text-orange-500 text-sm border rounded-xl px-3 py-4 bg-white shadow-sm cursor-pointer"
                        >
                          <option value="">Delhi</option>
                          {indianCities.map((city, index) => (
                            <option key={index} value={city}>
                              {city}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Drop Location */}
                      <div>
                        <label className="text-xs uppercase font-medium text-slate-500">
                          To
                        </label>
                        <select
                          value={to}
                          onChange={(e) => setTo(e.target.value)}
                          className="w-full font-bold text-orange-500 text-sm border rounded-xl px-3 py-4 bg-white shadow-sm cursor-pointer"
                        >
                          <option value="">Mumbai</option>
                          {indianCities.map((city, index) => (
                            <option key={index} value={city}>
                              {city}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Departure Date */}
                      <div className="relative">
                        <label className="text-xs uppercase font-medium text-slate-500">
                          Departure Date
                        </label>
                        <div
                          className="flex flex-wrap md:flex-nowrap items-center gap-2 w-full font-bold text-sm border rounded-xl px-3 py-4 bg-white shadow-sm cursor-pointer"
                          onClick={() => {
                            setOpenDeparture(!openDeparture);
                            setOpenReturn(false);
                          }}
                        >
                          <CalendarIcon className="w-5 h-5 text-orange-500" />
                          <span>
                            {departureDate
                              ? departureDate.toLocaleDateString("en-GB", {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                })
                              : "Pick a date"}
                          </span>
                          {departureDate && (
                            <p className="text-xs text-orange-500">
                              {departureDate.toLocaleDateString("en-US", {
                                weekday: "long",
                              })}
                            </p>
                          )}
                        </div>

                        {openDeparture && (
                          <div className="absolute mt-2 p-2 bg-white shadow-lg rounded-xl z-10">
                            <DayPicker
                              mode="single"
                              selected={departureDate}
                              onSelect={(date) => {
                                setDepartureDate(date);
                                setOpenDeparture(false);
                              }}
                            />
                          </div>
                        )}
                      </div>

                      {/* Return Date (only for roundtrip) */}
                      {tripType === "roundtrip" && (
                        <div className="relative">
                          <label className="text-xs uppercase font-medium text-slate-500">
                            Return Date
                          </label>
                          <div
                            className="flex flex-wrap md:flex-nowrap items-center gap-2 w-full font-bold text-sm border rounded-xl px-3 py-4 bg-white shadow-sm cursor-pointer"
                            onClick={() => {
                              setOpenReturn(!openReturn);
                              setOpenDeparture(false);
                            }}
                          >
                            <CalendarIcon className="w-5 h-5 text-orange-500" />
                            <span>
                              {returnDate
                                ? returnDate.toLocaleDateString("en-GB", {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                  })
                                : "Pick a date"}
                            </span>
                            {returnDate && (
                              <p className="text-xs text-orange-500">
                                {returnDate.toLocaleDateString("en-US", {
                                  weekday: "long",
                                })}
                              </p>
                            )}
                          </div>

                          {openReturn && (
                            <div className="absolute mt-2 p-2 bg-white shadow-lg rounded-xl z-10">
                              <DayPicker
                                mode="single"
                                selected={returnDate}
                                onSelect={(date) => {
                                  setReturnDate(date);
                                  setOpenReturn(false);
                                }}
                              />
                            </div>
                          )}
                        </div>
                      )}

                      {/* Travelers */}
                      <div>
                        <label
                          htmlFor="travelers"
                          className="text-xs uppercase font-medium text-slate-500"
                        >
                          Travelers
                        </label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <button className="w-full justify-start bg-white border border-gray-300 rounded-md px-3 py-3 text-sm md:text-lg font-semibold shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-400">
                              {displayValue || "Select Travelers"}
                            </button>
                          </PopoverTrigger>
                          <PopoverContent className="w-72 space-y-4 p-4">
                            {/* Adults */}
                            <div className="flex items-center justify-between">
                              <label htmlFor="adultCount">Adults</label>
                              <input
                                type="number"
                                id="adultCount"
                                min={1}
                                max={9}
                                value={adults}
                                onChange={(e) =>
                                  setAdults(Number(e.target.value))
                                }
                                className="w-20 border border-gray-300 rounded-md px-3 py-2 text-center text-sm text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                              />
                            </div>

                            {/* Children */}
                            <div className="flex items-center justify-between">
                              <label htmlFor="childCount">Children</label>
                              <input
                                type="number"
                                id="childCount"
                                min={0}
                                max={9}
                                value={children}
                                onChange={(e) =>
                                  setChildren(Number(e.target.value))
                                }
                                className="w-20 border border-gray-300 rounded-md px-3 py-2 text-center text-sm text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                              />
                            </div>

                            {/* Infants */}
                            <div className="flex items-center justify-between">
                              <label htmlFor="infantCount">Infants</label>
                              <input
                                type="number"
                                id="infantCount"
                                min={0}
                                max={9}
                                value={infants}
                                onChange={(e) =>
                                  setInfants(Number(e.target.value))
                                }
                                className="w-20 border border-gray-300 rounded-md px-3 py-2 text-center text-sm text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                              />
                            </div>

                            {/* Travel Class */}
                            <div>
                              <label htmlFor="travelClass">Travel Class</label>
                              <select
                                id="travelClass"
                                value={travelClass}
                                onChange={(e) => setTravelClass(e.target.value)}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                              >
                                <option value="">Choose Travel Class</option>
                                <option value="Economy">Economy</option>
                                <option value="Premium Economy">
                                  Premium Economy
                                </option>
                                <option value="Business">Business</option>
                                <option value="First Class">First Class</option>
                              </select>
                            </div>
                          </PopoverContent>
                        </Popover>
                      </div>

                      {/* Search Button */}
                      <div
                        className={`col-span-1 sm:col-span-2 lg:col-span-1 flex justify-center mt-6 lg:mt-0 ${
                          tripType === "roundtrip" ? "lg:col-span-5" : ""
                        }`}
                      >
                        <Button
                          className={`${
                            tripType === "roundtrip"
                              ? "w-full sm:w-auto px-6 py-3 rounded-md bg-orange-500 hover:bg-orange-600 text-white font-semibold transition-colors duration-300"
                              : "w-full lg:w-auto px-6 py-3 rounded-md bg-orange-500 hover:bg-orange-600 text-white font-semibold transition-colors duration-300"
                          }`}
                        >
                          SEARCH FLIGHTS
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

      <section
        className="py-10 px-4"
        style={{ backgroundImage: "url('/img/bg/map.png')" }}
      >
        <div className="max-w-6xl mx-auto  shadow-md rounded-2xl p-6">
          {/* Heading */}
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-6">
            Experience Flying with our Airline Partners
          </h2>

          {/* Airline Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {airlines.map((airline) => (
              <div
                key={airline.name}
                className="relative rounded-xl overflow-hidden shadow hover:shadow-lg transition"
              >
                <Image
                  src={airline.logo}
                  alt={airline.name}
                  width={600}
                  height={300}
                  className="w-full h-40 object-cover"
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <p className="text-white text-xl font-semibold">
                    {airline.name}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <section className="py-10 px-4">
          <div className="max-w-7xl mx-auto  rounded-2xl shadow-md p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {flights.map((flight) => (
                <div key={flight.city} className="flex items-center space-x-4">
                  {/* Circular Image */}
                  <div className="w-14 h-14 rounded-full overflow-hidden">
                    <Image
                      src={flight.image}
                      alt={flight.city}
                      width={400}
                      height={300}
                      className="object-cover w-full h-full"
                    />
                  </div>
                  {/* City + Routes */}
                  <div>
                    <h3 className="font-semibold text-lg">{flight.city}</h3>
                    <p className="text-sm text-slate-900">{flight.routes}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </section>

      <Footer />
    </>
  );
}
