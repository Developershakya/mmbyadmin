"use client"
import Image from "next/image"
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card"
// import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

const offers = [
  {
    title: "Flat 25% OFF on Domestic Flights",
    description: "Book now and save big on your next domestic trip",
    code: "DOMESTIC25",
    image: "/images/domestic.jpg",
    validTill: "Valid till 31st Dec",
    href:"/flight",
  },
  {
    title: "International Hotel Deals",
    description: "Up to 15% off on international hotel bookings",
    code: "HOTEL15",
    image: "/images/domes-hotel.jpg",
    validTill: "Valid till 15th Jan",
    href:"/hotel",
  },
  {
    title: "Holiday Package Special",
    description: "Extra 20% off on holiday packages",
    code: "HOLIDAY15",
    image: "/images/Explore.png",
    validTill: "Valid till 28th Dec",
    href:"/package",
  },
]

export default function TravelPackages() {
  return (
    <section className="py-16 bg-gray-50"style={{ backgroundImage: "url('/img/bg/map.png')" }} >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Exclusive Travel Offers</h2>
          <p className="text-lg text-gray-600">Dont miss out on these amazing deals</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {offers.map((offer, index) => (
            <Card key={index} >
              <CardContent >
                <div className="relative">
                  <Image
                    src={offer.image || "/placeholder.svg"}
                    alt={offer.title}
                    width={250}
                    height={150}
                    className="w-full h-40 object-fill"
                  />

                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{offer.title}</h3>
                  <p className="text-gray-600 mb-4">{offer.description}</p>
                  <div className="flex items-center justify-between mb-4">
                    <div className="bg-gray-100 px-3 py-1 rounded-md">
                      <span className="text-sm font-mono font-bold text-blue-600">{offer.code}</span>
                    </div>
                    <span className="text-sm text-gray-500">{offer.validTill}</span>
                  </div>
                  <Link href={offer.href} className="w-full">
                  <Button className="w-full bg-orange-500 hover:bg-orange-600">Book Now</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
