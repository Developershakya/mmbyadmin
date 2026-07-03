"use client";
import Link from "next/link";
import React from "react";
import Image from "next/image";

const destinations = [
  {
    name: "Goa",
    image: "/images/goa-img.png",
    code: "GOI",
    price: "From ₹2,499",
  },
  {
    name: "Uttarakhand",
    image: "/images/uttarakhand-img.png",
    code: "DED",
    price: "From ₹3,999",
  },
  {
    name: "Delhi",
    image: "/images/delhi-img.png",
    code: "DEL",
    price: "From ₹2,199",
  },
  {
    name: "Himachal Pradesh",
    image: "/images/manali-img.png",
    code: "KUU",
    price: "From ₹4,299",
  },
  {
    name: "Rajasthan",
    image: "/images/jaipur-img.png",
    code: "JAI",
    price: "From ₹2,799",
  },
  {
    name: "Kerala",
    image: "/images/kerala-img.png",
    code: "COK",
    price: "From ₹3,599",
  },
];
const experiences = [
  {
    name: "River Rafting",
    location: "Rishikesh",
    price: "From ₹1,499",
    image: "/images/rafting.jpg",
  },
  {
    name: "Hot Air Balloon",
    location: "Jaipur",
    price: "From ₹6,999",
    image: "/images/hotair.jpg",
  },
  {
    name: "Jungle Safari",
    location: "Jim Corbett",
    price: "From ₹2,999",
    image: "/images/safari.jpg",
  },
  {
    name: "Scuba Diving",
    location: "Andaman",
    price: "From ₹3,499",
    image: "/images/scuba.jpg",
  },
  {
    name: "Paragliding",
    location: "Bir Billing",
    price: "From ₹2,199",
    image: "/images/paragliding.jpg",
  },
  {
    name: "Camping",
    location: "Manali",
    price: "From ₹1,299",
    image: "/images/camping.jpg",
  },
];
const buses = [
  {
    route: "Delhi → Manali",
    price: "From ₹699",
    buses: "8+ Buses Daily",
    image: "/images/bus1.jpg",
  },
  {
    route: "Mumbai → Pune",
    price: "From ₹499",
    buses: "12+ Buses Daily",
    image: "/images/bus2.jpg",
  },
  {
    route: "Bangalore → Mysore",
    price: "From ₹399",
    buses: "10+ Buses Daily",
    image: "/images/bus3.jpg",
  },
  {
    route: "Chandigarh → Shimla",
    price: "From ₹599",
    buses: "6+ Buses Daily",
    image: "/images/bus4.jpg",
  },
  {
    route: "Hyderabad → Tirupati",
    price: "From ₹799",
    buses: "8+ Buses Daily",
    image: "/images/bus5.jpg",
  },
  {
    route: "Kolkata → Digha",
    price: "From ₹449",
    buses: "5+ Buses Daily",
    image: "/images/bus6.jpg",
  },
];
export default function PopularDestinations() {
  return (
    <section className="max-w-8xl mx-auto">
    <div className="max-w-7xl mx-auto py-12">
      {/* Heading */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
        <div>
          <h2 className="text-3xl md:text-4xl font-bold text-[#163B8C]">
            Popular Destinations
          </h2>
          <p className="text-gray-500 mt-2 text-sm">
            Top routes loved by travelers across India
          </p>
        </div>

        <button className="border border-gray-300 text-gray-700 hover:bg-gray-100 transition px-5 py-2 rounded-lg text-sm font-medium">
          View All Destinations
        </button>
        
      </div>

      {/* Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-5">
  {destinations.map((item, index) => (
    <Link key={index} href="/holiday-packages" className="relative h-62 rounded-2xl overflow-hidden cursor-pointer group shadow-md">
      <div className="relative h-62 rounded-2xl overflow-hidden cursor-pointer group shadow-md">
        <Image
          src={item.image}
          alt={item.name}
          fill
          className="object-cover group-hover:scale-110 transition duration-500"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

        <div className="absolute top-3 right-3 text-white text-sm">
          <i className="fa-solid fa-plane"></i>
        </div>

        <div className="absolute bottom-4 left-4 text-white">
          <h3 className="text-lg font-bold">{item.name}</h3>
          <p className="text-xs text-gray-300">{item.code}</p>
          <p className="text-sm font-semibold mt-1">{item.price}</p>
        </div>
      </div>
    </Link>
  ))}

  {/* Offer Card */}
  <Link href="/flights">
    <div className="relative rounded-2xl bg-sky-100 border border-sky-200 p-5 flex flex-col justify-between overflow-hidden shadow-md cursor-pointer">
      <div>
        <span className="uppercase text-[10px] font-bold tracking-widest text-sky-600">
          Get Up To
        </span>

        <h3 className="text-4xl font-black text-sky-900 leading-none mt-2">
          25% OFF
        </h3>

        <p className="text-sm text-sky-700 mt-2">
          On Domestic Flights
        </p>
      </div>

      <button className="bg-sky-600 hover:bg-sky-700 transition text-white text-sm font-semibold px-5 py-2 rounded-lg w-fit z-10">
        Book Now
      </button>

      <i className="fa-solid fa-plane-departure absolute -bottom-5 -right-5 text-[110px] text-sky-200 rotate-[-15deg]"></i>
    </div>
  </Link>
</div>
    </div>

    <div className="max-w-7xl mx-auto py-12">
      {/* Heading */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
        <div>
          <h2 className="text-3xl md:text-4xl font-bold text-[#163B8C]">
            Popular Flight Destinations
          </h2>
          <p className="text-gray-500 mt-2 text-sm">
            Top routes loved by travelers across India
          </p>
        </div>

        <button className="border border-gray-300 text-gray-700 hover:bg-gray-100 transition px-5 py-2 rounded-lg text-sm font-medium">
          View All Destinations
        </button>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-5">
        {destinations.map((item, index) => (
          <div
            key={index}
            className="relative h-62 rounded-2xl overflow-hidden cursor-pointer group shadow-md"
          >
            <Image
              src={item.image}
              alt={item.name}
              fill
              className="object-cover group-hover:scale-110 transition duration-500"
            />

            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

            {/* Plane Icon */}
            <div className="absolute top-3 right-3 text-white text-sm">
              <i className="fa-solid fa-plane"></i>
            </div>

            {/* Content */}
            <div className="absolute bottom-4 left-4 text-white">
              <h3 className="text-lg font-bold">{item.name}</h3>
              <p className="text-xs text-gray-300">{item.code}</p>
              <p className="text-sm font-semibold mt-1">{item.price}</p>
            </div>
          </div>
        ))}

        {/* Offer Card */}
        <div className="relative rounded-2xl bg-sky-100 border border-sky-200 p-5 flex flex-col justify-between overflow-hidden shadow-md">
          <div>
            <span className="uppercase text-[10px] font-bold tracking-widest text-sky-600">
              Get Up To</span>

            <h3 className="text-4xl font-black text-sky-900 leading-none mt-2">
              25% OFF</h3>

            <p className="text-sm text-sky-700 mt-2">
              On Domestic Flights</p>
          </div>

          <button className="bg-sky-600 hover:bg-sky-700 transition text-white text-sm font-semibold px-5 py-2 rounded-lg w-fit z-10">
            Book Now</button>
          <i className="fa-solid fa-plane-departure absolute -bottom-5 -right-5 text-[110px] text-sky-200 rotate-[-15deg]"></i>
        </div>
      </div>
    </div>
    <section className="max-w-7xl mx-auto py-12">

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">

        <div>
          <h2 className="text-3xl font-bold text-[#163B8C]">
            Explore by Experiences
          </h2>

          <p className="text-sm text-gray-500">
            Thrilling activities across India
          </p>
        </div>

        <button className="border px-5 py-2 rounded-lg text-sm hover:bg-gray-100">
          View All Experiences
        </button>

      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5">

        {experiences.map((item,index)=>(

          <div
          key={index}
          className="relative h-52 rounded-2xl overflow-hidden group cursor-pointer"
          >

            <Image
            src={item.image}
            alt={item.name}
            fill
            className="object-cover group-hover:scale-110 transition duration-500"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"/>

            <div className="absolute bottom-4 left-4 text-white">

              <h3 className="font-bold">
                {item.name}
              </h3>

              <p className="text-xs text-gray-300">
                {item.location}
              </p>

              <p className="text-sm font-semibold mt-1">
                {item.price}
              </p>

            </div>

          </div>

        ))}

      </div>

    </section>
    <section className="max-w-7xl mx-auto py-12">

    <div className="mb-8">

    <h2 className="text-3xl font-bold text-[#163B8C]">
    Popular Bus Destinations
    </h2>

    <p className="text-sm text-gray-500">
    Comfortable & Affordable Bus Travel
    </p>

    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-5">

    {buses.map((bus,index)=>(

    <div
    key={index}
    className="bg-white rounded-2xl overflow-hidden shadow hover:shadow-lg transition"
    >

    <div className="relative h-28">

    <Image
    src={bus.image}
    alt={bus.route}
    fill
    className="object-cover"
    />

    </div>

    <div className="p-4">

    <h3 className="font-semibold text-sm">
    {bus.route}
    </h3>

    <p className="text-orange-500 font-bold mt-2">
    {bus.price}
    </p>

    <p className="text-xs text-gray-500 mt-1">
    {bus.buses}
    </p>

    </div>

    </div>

    ))}

    <div className="relative rounded-2xl bg-emerald-100 border border-emerald-200 p-5 flex flex-col justify-between overflow-hidden">

    <div>

    <span className="uppercase text-[10px] tracking-widest font-bold text-emerald-600">
    Flat
    </span>

    <h3 className="text-4xl font-black text-emerald-900">
    15% OFF
    </h3>

    <p className="text-sm text-emerald-700">
    On Bus Bookings
    </p>

    </div>

    <button className="bg-emerald-600 text-white rounded-lg px-5 py-2 mt-5 w-fit hover:bg-emerald-700">
    Book Now
    </button>

    <i className="fa-solid fa-bus absolute -bottom-4 -right-4 text-[110px] text-emerald-200"></i>

    </div>

    </div>

    </section>
    </section>
  );
}