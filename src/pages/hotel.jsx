"use client";
import Link from "next/link";
import { Plane, Hotel, Car, Bus, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Image from "next/image";
import { useState } from "react";
import { Calendar as CalendarIcon } from "lucide-react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";

export default function HotelsPage() {
  const [from, setFrom] = useState("");
  const [selectedCheckIn, setSelectedCheckIn] = useState(null);
  const [selectedCheckOut, setSelectedCheckOut] = useState(null);

  const [openCheckIn, setOpenCheckIn] = useState(false);
  const [openCheckOut, setOpenCheckOut] = useState(false);

  const toggleCheckIn = () => {
    setOpenCheckIn(!openCheckIn);
    setOpenCheckOut(false);
  };

  const toggleCheckOut = () => {
    setOpenCheckOut(!openCheckOut);
    setOpenCheckIn(false);
  };
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

  const hotels = [
    {
      name: "Holiday Inn Lucknow Airport Hotel",
      location: "Sindhunagar",
      price: "₹5,900",
      rating: "4.1/5",
      stars: 5,
      image: "/hotels/holiday-inn.jpg",
    },
    {
      name: "Hyatt Regency Lucknow Gomti Nagar",
      location: "Vibhuti Khand",
      price: "₹7,550",
      rating: "4.2/5",
      stars: 5,
      image: "/hotels/hyatt-regency.jpg",
    },
    {
      name: "Clarks Avadh",
      location: "Qaiserbagh",
      price: "₹4,764",
      rating: "4.1/5",
      stars: 5,
      image: "/hotels/clarks-avadh.jpg",
    },
    {
      name: "Ginger Lucknow",
      location: "Viraj Khand",
      price: "₹1,524",
      rating: "3.5/5",
      stars: 3,
      image: "/hotels/ginger-lucknow.jpg",
    },
    {
      name: "Golden Tulip Hotel Lucknow",
      location: "Udaiganj",
      price: "₹6,000",
      rating: "4.5/5",
      stars: 5,
      image: "/hotels/golden-tulip.jpg",
    },
  ];

  const lochotels = [
    {
      city: "Coimbatore ",
      routes: "Hotels, Budget Hotels, Resorts, Best Hotels, North Goa, Villas",
      image: "/flights/Coimbatore.png",
    },
    {
      city: "Goa Flights",
      routes: "Hotels, Budget Hotels, Resorts, Best Hotels, North Goa, Villas",
      image: "/flights/Goa.jpg",
    },
    {
      city: "Mumbai",
      routes:
        "Hotels, Budget Hotels, Resorts, Couple Hotels, Near Mumbai Airport",
      image: "/flights/marine drive.jpeg",
    },
    {
      city: "Hyderabad ",
      routes:
        "Hotels, Budget Hotels, Resorts, Couple Hotels, Near Hyderabad Airport",
      image: "/flights/hyderabad.jpeg",
    },
    {
      city: "Delhi",
      routes: "Hotels, Budget Hotels, Resorts, Best Hotels, Near IGI Airport",
      image: "/flights/delhi.jpg",
    },
    {
      city: "Pune ",
      routes:
        "Hotels, Budget Hotels, Resorts, Couple Hotels, Near Pune Airport",
      image: "/flights/pune.jpeg",
    },
    {
      city: "Kolkata",
      routes: "Hotels, Budget Hotels, Resorts, Near Airport, kolkata Resort",
      image: "/flights/kolkata.jpeg",
    },
    {
      city: "Bangalore ",
      routes: "Hotels, Budget Hotels, Resorts,Near Airport, Bangalore Resort",
      image: "/flights/bangalore.jpeg",
    },
    {
      city: "Jaipur ",
      routes:
        "Hotels, Resorts, Budget Hotels, Best Hotels, Near Railway Station",
      image: "/flights/jaipur.png",
    },
    {
      city: "Ahmedabad",
      routes: "Hotels, Budget Hotels, Resorts, Best Hotels, Near Airport",
      image: "/hotels/ahemedabad.jpeg",
    },
    {
      city: "Lucknow",
      routes:
        "Hotels, Budget Hotels, Resorts, Best Hotels, Near Lucknow Airport",
      image: "/hotels/golden-tulip.jpg",
    },
    {
      city: "Manali",
      routes: "Hotels, Resorts, Budget Hotels, Best Hotels, Near Mall Road",
      image: "/hotels/manali.jpg",
    },
  ];

  return (
    <>
      <Header />

      <section
        className="relative  bg-center py-16"
        style={{ backgroundImage: "url('/img/bg/map.png')" }}
      >
        {/* Background Video */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-fill z-[-1]"
        >
          <source src="/images/video/hotel.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>

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
              <Tabs defaultValue="hotels" className="w-full">
                <TabsList className=" flex justify-around  w-full grid-cols-5  mb-6 bg- ">
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

                <TabsContent value="hotels">
                  <div className="w-full max-w-6xl mx-auto bg-white rounded-xl shadow-lg p-3">
                    {/* Trip Type Tabs */}
                    <div className="flex flex-wrap items-center gap-6 text-sm font-medium text-black mb-6">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="tripType" />
                        Upto 4 Rooms
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="tripType" value="round" />
                        Group Deals
                        <span className="absolute -top-3 -right-8 text-[10px] bg-orange-500 text-white px-2 py-0.5 rounded-full">
                          NEW
                        </span>
                      </label>

                      <span className="ml-auto text-lg  font-bold ">
                        Hotels Booking
                      </span>
                    </div>

                    {/* Booking Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 items-end">
                      {/* Pickup Location */}
                      <div>
                        <label className="text-xs uppercase font-medium text-slate-500">
                          City / Location / Category
                        </label>
                        <select
                          value={from}
                          onChange={(e) => setFrom(e.target.value)}
                          className="w-full font-bold text-orange-500 text-sm border rounded-xl px-3 py-4 bg-white shadow-sm cursor-pointer"
                        >
                          <option value="">Goa</option>
                          <span>india</span>
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
                          Check-In Date
                        </label>
                        <div
                          className="flex items-center gap-2 w-full font-bold text-sm border rounded-xl px-3 p-4 bg-white shadow-sm cursor-pointer"
                          onClick={toggleCheckIn}
                        >
                          <CalendarIcon className="w-5 h-5 text-orange-500" />
                          <span>
                            {selectedCheckIn
                              ? selectedCheckIn.toLocaleDateString("en-GB", {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                })
                              : "Pick a date"}
                          </span>
                          {selectedCheckIn && (
                            <p className="text-xs text-orange-500">
                              {selectedCheckIn.toLocaleDateString("en-US", {
                                weekday: "long",
                              })}
                            </p>
                          )}
                        </div>

                        {openCheckIn && (
                          <div className="absolute mt-2 p-2 bg-white shadow-lg rounded-xl z-10">
                            <DayPicker
                              mode="single"
                              selected={selectedCheckIn}
                              onSelect={(date) => {
                                setSelectedCheckIn(date);
                                setOpenCheckIn(false);
                              }}
                            />
                          </div>
                        )}
                      </div>

                      {/* Check-Out Date */}
                      <div className="relative">
                        <label className="text-xs uppercase font-medium text-slate-500">
                          Check-Out Date
                        </label>
                        <div
                          className="flex items-center gap-2 w-full font-bold text-sm border rounded-xl px-3 p-4 bg-white shadow-sm cursor-pointer"
                          onClick={toggleCheckOut}
                        >
                          <CalendarIcon className="w-5 h-5 text-orange-500" />
                          <span>
                            {selectedCheckOut
                              ? selectedCheckOut.toLocaleDateString("en-GB", {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                })
                              : "Pick a date"}
                          </span>
                          {selectedCheckOut && (
                            <p className="text-xs text-orange-500">
                              {selectedCheckOut.toLocaleDateString("en-US", {
                                weekday: "long",
                              })}
                            </p>
                          )}
                        </div>

                        {openCheckOut && (
                          <div className="absolute mt-2 p-2 bg-white shadow-lg rounded-xl z-10">
                            <DayPicker
                              mode="single"
                              selected={selectedCheckOut}
                              onSelect={(date) => {
                                setSelectedCheckOut(date);
                                setOpenCheckOut(false);
                              }}
                            />
                          </div>
                        )}
                      </div>

                      {/* Rooms */}
                      <div>
                        <label className="text-xs uppercase font-medium text-slate-500">
                          Rooms & Guests
                        </label>

                        <select
                          name=""
                          id=""
                          className="w-full font-bold text-orange-500 text-sm border rounded-xl px-3 py-4 bg-white shadow-sm cursor-pointer"
                        >
                          <option value="">Select Rooms</option>
                          <option value="">2 Adult 1 Room</option>
                          <option value="">2 Adult 2 Room</option>
                          <option value="">3 Adult 1 Room</option>
                          <option value="">3 Adult 2 Room</option>
                          <option value="">4 Adult 1 Room</option>
                          <option value="">4 Adult 2 Room</option>
                          <option value="">5 Adult 1 Room</option>
                          <option value="">5 Adult 2 Room</option>
                        </select>
                      </div>

                      {/* Search Button */}
                      <div className="col-span-full flex justify-center mt-6">
                        <Button className="w-full sm:w-auto px-8 py-3 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-semibold transition-colors duration-300">
                          SEARCH HOTELS
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

      <section style={{ backgroundImage: "url('/img/bg/map.png')" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-2xl font-bold">For your stay in Lucknow</h2>
              <p className="text-slate-900">Fri, 05 Sep 25 - Sat, 06 Sep 25</p>
            </div>
            <a
              href="#"
              className="text-blue-600 font-semibold hover:underline flex items-center"
            >
              VIEW ALL →
            </a>
          </div>

          <div className="flex space-x-4 overflow-x-auto scrollbar-hide">
            {hotels.map((hotel, idx) => (
              <div
                key={idx}
                className="min-w-[250px] max-w-[250px] bg-white rounded-xl shadow hover:shadow-lg transition"
              >
                <div className="relative w-full h-40 rounded-t-xl overflow-hidden">
                  <Image
                    src={hotel.image}
                    alt={hotel.name}
                    fill
                    className="object-cover"
                  />
                  <span className="absolute bottom-2 right-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                    {hotel.rating}
                  </span>
                </div>
                <div className="p-3">
                  <h3 className="font-semibold text-sm leading-tight">
                    {hotel.name}
                  </h3>
                  <p className="text-xs text-slate-900">{hotel.location}</p>
                  <div className="flex items-center mt-2 text-yellow-500 text-sm">
                    {"★".repeat(hotel.stars)}
                    {"☆".repeat(5 - hotel.stars)}
                  </div>
                  <p className="mt-2 font-bold">
                    {hotel.price}{" "}
                    <span className="text-slate-900 font-normal text-sm">
                      per night
                    </span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <section className="py-10 px-4">
          <div className="max-w-7xl mx-auto  rounded-2xl shadow-md p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {lochotels.map((hotel) => (
                <div key={hotel.city} className="flex items-center space-x-4">
                  {/* Circular Image */}
                  <div className="w-14 h-14 rounded-full overflow-hidden">
                    <Image
                      src={hotel.image}
                      alt={hotel.city}
                      width={400}
                      height={300}
                      className="object-cover w-full h-full"
                    />
                  </div>
                  {/* City + Routes */}
                  <div>
                    <h3 className="font-semibold text-lg">{hotel.city}</h3>
                    <p className="text-sm text-slate-900">{hotel.routes}</p>
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
