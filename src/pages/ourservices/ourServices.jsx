import Footer from "@/components/Footer";
import Header from "../components/Header";
import {
  Plane,
  MapPin,
  Hotel,
  Car,
  Bus,
  FileText,
  Ship,
  Mountain,
  CheckCircle,
  Star,
  Clock,
  Users,
  Globe,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Image from "next/image";
import PopularDestinations from "@/components/PopularDestinations";

const services = [
  
  {
    icon: Plane,
    title: "Flight Booking",
    description:
      "Enjoy seamless booking experience with the best deals on domestic and international flights. We partner with all major airlines to bring you competitive prices.",
    features: [
      "Best Price Guarantee",
      "Flexible Booking",
      "Multiple Airlines",
      "Instant Confirmation",
      "Domestic | International"
    ],
    price: "No Booking Fees",
    popular: false,
  },
  {
    icon: Hotel,
    title: "Hotel/Resort Accommodations  ",
    description:
      "Find the perfect stay from our extensive selection of hotels, RCI resorts, and homestays across India and worldwide destinations at unbeatable prices.",
    features: [
      "Verified Reviews",
      "Free Cancellation",
      "Best Rate Guarantee",
      "Instant Booking",
      "Domestic | International",
    ],
    price: "Starting at $49/night",
    popular: false,
  },
  {
    icon: MapPin,
    title: "Tour Packages",
    description:
      "Discover our curated holiday packages designed to create memorable experiences. From weekend getaways to extended vacations, we have it all.",
    features: [
      "Customized Itineraries",
      "Local Guides",
      "Group & Solo Tours",
      "Cultural Experiences",
      "Family | Adventure | Pilgrimage"
    ],
    price: "Starting at $299",
    popular: true,
  },
  {
    icon: Bus,
    title: "Bus Bookings",
    description:
      "Travel comfortably with our bus booking service covering all major routes across India. Choose from various options to suit your needs and budget.",
    features: [
      "Wide Vehicle Selection",
      "GPS Navigation",
      "Insurance Included",
      "24/7 Roadside Assistance",
      "Domestic | AC/Non-AC | Sleeper | Semi-Sleeper"
    ],
    price: "Starting at $15",
    popular: false,
  },
  {
    icon: Car,
    title: "Car Rentals",
    description:
      "Explore destinations at your own pace with our car rental services. Available with or without chauffeur for maximum convenience and flexibility.",
    features: [
      "Wide Vehicle Selection",
      "GPS Navigation",
      "Insurance Included",
      "24/7 Roadside Assistance",
      "Domestic | Self-Drive"
    ],
    price: "Starting at $25/day",
    popular: false,
  },
  
  {
    icon: Shield,
    title: "Membership",
    description: "Join the Make My Bharat Yatra membership program for exclusive travel benefits, including special discounts, priority bookings, and personalized trip assistance.",
    features: [
      "Exclusive Discounts",
      "Application Support",
      "Fast Processing",
      "Expert Guidance",
      "Exclusive Offers",
      "Premium | Elite",
    ],
    price: "Starting at $99",
    popular: false,
  },
  {
    icon: Ship,
    title: "Cruise Bookings",
    description: "Luxury cruise experiences with all-inclusive packages.",
    features: [
      "Multiple Cruise Lines",
      "Cabin Selection",
      "Shore Excursions",
      "Special Offers",
    ],
    price: "Starting at $599",
    popular: false,
  },
  {
    icon: Mountain,
    title: "Adventure Tours",
    description: "Thrilling adventures for the bold and adventurous travelers.",
    features: [
      "Expert Guides",
      "Safety Equipment",
      "Small Groups",
      "Unique Experiences",
    ],
    price: "Starting at $199",
    popular: false,
  },
];

const stats = [
  { number: "50K+", label: "Happy Travelers", icon: Users },
  { number: "150+", label: "Destinations", icon: Globe },
  { number: "4.9", label: "Average Rating", icon: Star },
  { number: "24/7", label: "Customer Support", icon: Clock },
];

// const destinations = [
//   {
//     name: "Paris, France",
//     image: "/placeholder.svg?height=300&width=400",
//     tours: "25+ Tours",
//   },
//   {
//     name: "Tokyo, Japan",
//     image: "/placeholder.svg?height=300&width=400",
//     tours: "18+ Tours",
//   },
//   {
//     name: "Bali, Indonesia",
//     image: "/placeholder.svg?height=300&width=400",
//     tours: "32+ Tours",
//   },
//   {
//     name: "New York, USA",
//     image: "/placeholder.svg?height=300&width=400",
//     tours: "22+ Tours",
//   },
// ];

export default function OurServices() {
  return (
    <>
      <Header />

      <div className="min-h-screen" style={{ backgroundImage: "url('/img/bg/map.png')" }}>
        {/* Hero Section */}
        <section className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
          <div className="absolute inset-0 " style={{ backgroundImage: "url('/images/service-banner.jpg')" }}></div>
          <div className="relative max-w-7xl mx-auto text-center">
            <Badge>MakeMyBharatYatra</Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
              Your Travel <span className="text-orange-500">Dreams</span> Await
            </h1>
            <p className="text-xl text-slate-900 max-w-3xl mx-auto mb-8">
              From exotic destinations to comfortable accommodations, we provide
              comprehensive travel services to make your journey unforgettable.
              Let us handle the details while you create memories.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
              className="border-2 border-white text-white hover:bg-white hover:text-orange-500 transition-colors duration-300" >
                Plan Your Trip
              </Button>
              <Button
              className="border-2 border-white text-white hover:bg-white hover:text-orange-500 transition-colors duration-300"
              >
                Browse Destinations
              </Button>
            </div>
          </div>
        </section>


<section className="py-16 px-4 sm:px-6 lg:px-8 ">
  <Card>
     <div className="text-center mb-5">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
               Your Adventure Awaits
              </h2>
              <p className="text-lg text-slate-900 max-w-2xl mx-auto">
                Discover our range of premium travel services.
              </p>
            </div>
     <div className="max-w-7xl mx-auto p-5  grid grid-cols-1 md:grid-cols-2 gap-5 items-center">
      
      {/* Left Image */}
      <div className="rounded-xl overflow-hidden shadow-lg relative h-full">
        <Image
          src="/images/service-welcome.jpg" // Replace with actual image path
          alt="Welcome Sign"
          width={600}
          height={400}
          className=" object-cover w-full h-full rounded-lg transition-transform duration-300 group-hover:scale-105 "
        />
      </div>

      {/* Right Content */}
      <div>
        {/* Why Choose Us */}
          <Card>
          <h2 className="text-2xl font-bold  mb-4">Why Choose Us?</h2>
          <ul className="space-y-2 text-slate-900">
            <li className="flex items-center gap-2">
              <CheckCircle className="text-green-500 w-5 h-5" />
              Expertly Curated Packages
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="text-green-500 w-5 h-5" />
              Unbeatable Prices on Flights
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="text-green-500 w-5 h-5" />
              Dedicated Customer Support
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="text-green-500 w-5 h-5" />
              Seamless Booking Experience
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="text-green-500 w-5 h-5" />
              Focus on Memorable Journeys
            </li>
          </ul>
          </Card>
          <br />
        

        {/* Welcome Message */}
        <Card>
          <h2 className="text-2xl font-bold  mb-3">
            Welcome to Make My Bharat Yatra
          </h2>
          <p className="text-slate-900 leading-relaxed">
            Make My Bharat Yatra is one of India’s leading tour & travel companies in India offering budget vacations, holiday packages, and Domestic & International airline services. As a company that excels in providing a satisfactory tourism experience, we have amazing offers on airfare booking from our highly reputed Indian travel agency. Travel with us to enjoy the lowest rates for flights to all around the globe. Being one of India’s best travel and tourism websites, we work day and night to make your holidays unforgettable. Why look anywhere else when we provide specialized holiday packages and offers? Enjoy great savings on holidays, accommodations, and tours with all the information required before you leave. Call us now for great discounts and an unforgettable holiday on a low budget.
          </p>
        </Card>
      </div>
    </div>
    </Card>
</section>



      

        {/* Services Grid */}
        <section className=" px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
                Explore Our Premium Services
              </h2>
              <p className="text-lg text-slate-900 max-w-2xl mx-auto">
                Everything you need for the perfect trip, all in one place
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {services.map((service, index) => {
                const IconComponent = service.icon;
                return (
                  <Card
                    key={index}
                    // className={`group hover:shadow-xl transition-all duration-300 border-0 shadow-lg relative ${
                    //   service.popular ? "ring-2 ring-blue-500" : ""
                    // }`}
                  >
                    {service.popular && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                          Most Popular
                        </span>
                      </div>
                    )}
                    <CardHeader >
                      <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-600 transition-colors duration-300">
                        <IconComponent className="w-6 h-6 text-orange-500 group-hover:text-white transition-colors duration-300" />
                      </div>
                      <CardTitle >
                        {service.title}
                      </CardTitle>
                      <CardDescription className="text-slate-900 text-sm">
                        {service.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent >
                      <ul className="space-y-2 mb-6">
                        {service.features.map((feature, featureIndex) => (
                          <li
                            key={featureIndex}
                            className="flex items-center text-sm text-slate-900"
                          >
                            <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                      <div className="flex items-center justify-between">
                        {/* <span className="text-sm font-bold text-blue-600">
                          {service.price}
                        </span> */}
                        <Button
                        >
                          Learn More
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

         

        {/* Popular Destinations */}
        <PopularDestinations />

 {/* Stats Section */}
        <section className="py-7 px-4 sm:px-6 lg:px-8 bg-orange-500">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              {stats.map((stat, index) => {
                const IconComponent = stat.icon;
                return (
                  <div key={index} className="text-center">
                    <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <IconComponent className="w-6 h-6 text-orange-600" />
                    </div>
                    <div className="text-3xl sm:text-4xl font-bold text-white mb-2">
                      {stat.number}
                    </div>
                    <div className="text-white font-medium">
                      {stat.label}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
        {/* How It Works */}
        <section className="py-10 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                How It Works
              </h2>
              <p className="text-lg text-slate-900 max-w-2xl mx-auto">
                Simple steps to plan your perfect getaway
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                {
                  step: "01",
                  title: "Choose Destination",
                  description:
                    "Browse our curated destinations and find your perfect match",
                  icon: Globe,
                },
                {
                  step: "02",
                  title: "Select Services",
                  description: "Pick from our comprehensive travel services",
                  icon: CheckCircle,
                },
                {
                  step: "03",
                  title: "Customize Trip",
                  description:
                    "Personalize your itinerary with our travel experts",
                  icon: FileText,
                },
                {
                  step: "04",
                  title: "Enjoy Journey",
                  description:
                    "Relax and enjoy your perfectly planned adventure",
                  icon: Star,
                },
              ].map((process, index) => {
                const IconComponent = process.icon;
                return (
                  <div key={index} className="text-center">
                    <div className="relative mb-6">
                      <div className="w-16 h-16 bg-orange-500 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                        {process.step}
                      </div>
                      <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center mx-auto">
                        <IconComponent className="w-4 h-4 text-orange-500" />
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {process.title}
                    </h3>
                    <p className="text-slate-900 text-md">
                      {process.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        {/* <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                What Our Travelers Say
              </h2>
              <p className="text-lg text-gray-600">
                Real experiences from real travelers
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  name: "Sarah Johnson",
                  location: "New York, USA",
                  rating: 5,
                  comment:
                    "Amazing experience! The tour was perfectly organized and our guide was incredibly knowledgeable. Highly recommend!",
                  avatar: "/placeholder.svg?height=60&width=60",
                },
                {
                  name: "Michael Chen",
                  location: "Toronto, Canada",
                  rating: 5,
                  comment:
                    "Best travel service I've ever used. From booking to the actual trip, everything was seamless and professional.",
                  avatar: "/placeholder.svg?height=60&width=60",
                },
                {
                  name: "Emma Wilson",
                  location: "London, UK",
                  rating: 5,
                  comment:
                    "The attention to detail was outstanding. They took care of everything and made our honeymoon absolutely perfect!",
                  avatar: "/placeholder.svg?height=60&width=60",
                },
              ].map((testimonial, index) => (
                <Card key={index}>
                  <CardContent >
                    <div className="flex items-center mb-4">
                      <img
                        src={testimonial.avatar || "/placeholder.svg"}
                        alt={testimonial.name}
                        className="w-12 h-12 rounded-full mr-4"
                      />
                      <div>
                        <h4 className="font-bold text-gray-900">
                          {testimonial.name}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {testimonial.location}
                        </p>
                      </div>
                    </div>
                    <div className="flex mb-3">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star
                          key={i}
                          className="w-4 h-4 text-yellow-400 fill-current"
                        />
                      ))}
                    </div>
                    <p className="text-gray-600 text-sm italic">
                      "{testimonial.comment}"
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section> */}

        {/* CTA Section */}
        <section className="py-10 px-4 sm:px-6 lg:px-8 bg-orange-500">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Ready for Your Next Adventure?
            </h2>
            <p className="text-xl text-slate-50 mb-8">
              Let our travel experts create the perfect itinerary for your dream
              vacation.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                className="border-2 border-white text-white hover:bg-white hover:text-orange-500 transition-colors duration-300"
              >
                Start Planning Now
              </Button>
              <Button
               className="border-2 border-white text-white hover:bg-white hover:text-orange-500 transition-colors duration-300"
              >
                Contact Travel Expert
              </Button>
            </div>
          </div>
        </section>

        {/* Contact Info */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">24/7 Support</h3>
                <p className="text-gray-600 text-sm">
                  Round-the-clock assistance for all your travel needs
                </p>
              </div>
              <div>
                <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Bus className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">Secure Booking</h3>
                <p className="text-gray-600 text-sm">
                  Safe and secure payment processing for peace of mind
                </p>
              </div>
              <div>
                <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Star className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">
                  Best Price Guarantee
                </h3>
                <p className="text-gray-600 text-sm">
                  We match any competitors price or give you the difference
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}
