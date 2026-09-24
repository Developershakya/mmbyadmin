// Make My Bharat Yatra - Static Mock Datasets

export const initialPackageBookings = [
  {
    id: "PKG202509120045",
    customer: {
      name: "Rahul Sharma",
      email: "rahul@gmail.com",
      phone: "+91 98765 43210",
      avatar: "RS"
    },
    packageName: "Andaman & Nicobar Dream",
    image: "https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?w=600&auto=format&fit=crop&q=80",
    duration: "7 Days / 6 Nights",
    route: "Delhi → Port Blair → Delhi",
    travelDate: "12 Sep – 18 Sep 2025",
    bookingDate: "12 Sep 2025, 10:24 AM",
    amount: 25900,
    basePrice: 21500,
    taxes: 4400,
    payment: "Paid",
    status: "Confirmed",
    flight: {
      airline: "IndiGo",
      flightNo: "6E-562",
      route: "Delhi → Port Blair (12 Sep 2025)",
      pnr: "6E9841",
      class: "Economy"
    },
    hotel: {
      name: "Sea View Resort",
      room: "Deluxe Ocean View",
      nights: "6 Nights",
      mealPlan: "Breakfast Included"
    },
    transfer: {
      type: "Private AC Cab",
      desc: "Airport Transfer + Local Sightseeing (7 Days)"
    },
    sightseeing: {
      included: ["Cellular Jail & Light Show", "Radhanagar Beach", "Elephant Beach Snorkeling"],
      optional: ["Scuba Diving at Havelock (+₹3,500)"]
    }
  },
  {
    id: "PKG202509100012",
    customer: {
      name: "Priya Verma",
      email: "priya@gmail.com",
      phone: "+91 87654 32109",
      avatar: "PV"
    },
    packageName: "Bali Getaway",
    image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600&auto=format&fit=crop&q=80",
    duration: "5 Days / 4 Nights",
    route: "Mumbai → Denpasar → Mumbai",
    travelDate: "10 Sep – 14 Sep 2025",
    bookingDate: "10 Sep 2025, 02:15 PM",
    amount: 42500,
    basePrice: 36000,
    taxes: 6500,
    payment: "Paid",
    status: "Confirmed",
    flight: {
      airline: "Singapore Airlines",
      flightNo: "SQ-505",
      route: "Mumbai → Bali (10 Sep 2025)",
      pnr: "SQ8832",
      class: "Economy"
    },
    hotel: {
      name: "Ubud Sunset Pool Villa",
      room: "Private Pool Villa",
      nights: "4 Nights",
      mealPlan: "All Meals Included"
    },
    transfer: {
      type: "Private Chauffeured SUV",
      desc: "Full Island Exploration (5 Days)"
    },
    sightseeing: {
      included: ["Uluwatu Temple & Kecak Dance", "Tegalalang Rice Terraces", "Mount Batur Sunrise"],
      optional: ["Nusa Penida Day Cruise (+₹4,200)"]
    }
  },
  {
    id: "PKG202509050089",
    customer: {
      name: "Amit Kumar",
      email: "amit@gmail.com",
      phone: "+91 98765 11223",
      avatar: "AK"
    },
    packageName: "Maldives Special",
    image: "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=600&auto=format&fit=crop&q=80",
    duration: "7 Days / 6 Nights",
    route: "Delhi → Malé → Delhi",
    travelDate: "05 Sep – 11 Sep 2025",
    bookingDate: "05 Sep 2025, 11:40 AM",
    amount: 152000,
    basePrice: 130000,
    taxes: 22000,
    payment: "Paid",
    status: "Confirmed",
    flight: {
      airline: "Air India",
      flightNo: "AI-263",
      route: "Delhi → Malé (05 Sep 2025)",
      pnr: "AI7712",
      class: "Business"
    },
    hotel: {
      name: "Sun Siyam Vilu Reef",
      room: "Overwater Bungalow",
      nights: "6 Nights",
      mealPlan: "Premium All-Inclusive"
    },
    transfer: {
      type: "Speedboat & Seaplane",
      desc: "Return Seaplane Transfer Malé Airport"
    },
    sightseeing: {
      included: ["Sunset Dolphin Cruise", "Coral Reef Snorkeling Safari"],
      optional: ["Deep Sea Manta Ray Dive (+₹6,000)"]
    }
  },
  {
    id: "PKG202509080034",
    customer: {
      name: "Neha Singh",
      email: "neha@gmail.com",
      phone: "+91 99887 76655",
      avatar: "NS"
    },
    packageName: "Dubai Explorer",
    image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600&auto=format&fit=crop&q=80",
    duration: "6 Days / 5 Nights",
    route: "Delhi → Dubai → Delhi",
    travelDate: "08 Sep – 13 Sep 2025",
    bookingDate: "08 Sep 2025, 04:30 PM",
    amount: 38000,
    basePrice: 32000,
    taxes: 6000,
    payment: "Pending",
    status: "Pending",
    flight: {
      airline: "Emirates",
      flightNo: "EK-511",
      route: "Delhi → Dubai (08 Sep 2025)",
      pnr: "EK1903",
      class: "Economy"
    },
    hotel: {
      name: "Grand Hyatt Dubai",
      room: "City Skyline Deluxe",
      nights: "5 Nights",
      mealPlan: "Breakfast & Dinner"
    },
    transfer: {
      type: "Private Sedan",
      desc: "Airport Transfers & City Tour Transits"
    },
    sightseeing: {
      included: ["Burj Khalifa 124th Floor", "Desert Safari with BBQ Dinner", "Dubai Mall Aquarium"],
      optional: ["Dhow Marina Yacht Dinner Cruise (+₹3,000)"]
    }
  },
  {
    id: "PKG202509070051",
    customer: {
      name: "Suresh Yadav",
      email: "suresh@gmail.com",
      phone: "+91 77654 33221",
      avatar: "SY"
    },
    packageName: "Thailand Explorer",
    image: "https://images.unsplash.com/photo-1528181304800-259b08848526?w=600&auto=format&fit=crop&q=80",
    duration: "6 Days / 5 Nights",
    route: "Kolkata → Bangkok → Phuket → Kolkata",
    travelDate: "07 Sep – 12 Sep 2025",
    bookingDate: "07 Sep 2025, 09:12 AM",
    amount: 36500,
    basePrice: 31000,
    taxes: 5500,
    payment: "Paid",
    status: "Confirmed",
    flight: {
      airline: "Thai Airways",
      flightNo: "TG-314",
      route: "Kolkata → Bangkok",
      pnr: "TG4092",
      class: "Economy"
    },
    hotel: {
      name: "Amari Phuket Beach Resort",
      room: "Superior Ocean Wing",
      nights: "5 Nights",
      mealPlan: "Breakfast Included"
    },
    transfer: {
      type: "Private AC Minivan",
      desc: "Bangkok & Phuket Transfers Included"
    },
    sightseeing: {
      included: ["Phi Phi Islands Speedboat Tour", "James Bond Island", "Grand Palace Bangkok"],
      optional: ["Chao Phraya Princess Cruise (+₹2,200)"]
    }
  },
  {
    id: "PKG202509150022",
    customer: {
      name: "Pooja Mehta",
      email: "pooja@gmail.com",
      phone: "+91 86547 12345",
      avatar: "PM"
    },
    packageName: "Goa Beach Holiday",
    image: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=600&auto=format&fit=crop&q=80",
    duration: "5 Days / 4 Nights",
    route: "Mumbai → Goa → Mumbai",
    travelDate: "15 Sep – 19 Sep 2025",
    bookingDate: "09 Sep 2025, 06:10 PM",
    amount: 28750,
    basePrice: 24500,
    taxes: 4250,
    payment: "Paid",
    status: "Confirmed",
    flight: {
      airline: "SpiceJet",
      flightNo: "SG-281",
      route: "Mumbai → Goa MOPA",
      pnr: "SG3301",
      class: "Economy"
    },
    hotel: {
      name: "Taj Fort Aguada Resort",
      room: "Heritage Sea View Cottage",
      nights: "4 Nights",
      mealPlan: "Breakfast & Hi-Tea"
    },
    transfer: {
      type: "Self-drive SUV (Thar)",
      desc: "Delivered at MOPA Airport"
    },
    sightseeing: {
      included: ["Old Goa Churches Heritage Walk", "Dudhsagar Waterfalls Jeep Safari", "Mandovi River Sunset Cruise"],
      optional: ["Watersports Combo Pack at Baga (+₹2,800)"]
    }
  },
  {
    id: "PKG202509090067",
    customer: {
      name: "Vikash Singh",
      email: "vikash@gmail.com",
      phone: "+91 70123 45678",
      avatar: "VS"
    },
    packageName: "Sri Lanka Escape",
    image: "https://images.unsplash.com/photo-1586861635167-e5223aadc9fe?w=600&auto=format&fit=crop&q=80",
    duration: "6 Days / 5 Nights",
    route: "Chennai → Colombo → Kandy → Galle → Chennai",
    travelDate: "09 Sep – 14 Sep 2025",
    bookingDate: "06 Sep 2025, 01:20 PM",
    amount: 48200,
    basePrice: 41000,
    taxes: 7200,
    payment: "Paid",
    status: "Confirmed",
    flight: {
      airline: "SriLankan Airlines",
      flightNo: "UL-122",
      route: "Chennai → Colombo",
      pnr: "UL8912",
      class: "Economy"
    },
    hotel: {
      name: "Heritance Kandalama",
      room: "Panoramic Forest Room",
      nights: "5 Nights",
      mealPlan: "Half Board"
    },
    transfer: {
      type: "Dedicated Chauffeur Car",
      desc: "All Intercity & Heritage Transfers"
    },
    sightseeing: {
      included: ["Sigiriya Rock Fortress", "Temple of the Sacred Tooth Relic", "Galle Dutch Fort"],
      optional: ["Yala National Park Leopard Safari (+₹4,500)"]
    }
  },
  {
    id: "PKG202509110078",
    customer: {
      name: "Kavita Rani",
      email: "kavita@gmail.com",
      phone: "+91 99876 54321",
      avatar: "KR"
    },
    packageName: "Kerala Backwaters",
    image: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=600&auto=format&fit=crop&q=80",
    duration: "5 Days / 4 Nights",
    route: "Bangalore → Cochin → Alleppey → Munnar → Cochin",
    travelDate: "11 Sep – 15 Sep 2025",
    bookingDate: "08 Sep 2025, 05:45 PM",
    amount: 32600,
    basePrice: 28000,
    taxes: 4600,
    payment: "Pending",
    status: "Pending",
    flight: {
      airline: "IndiGo",
      flightNo: "6E-401",
      route: "Bangalore → Cochin",
      pnr: "6E1029",
      class: "Economy"
    },
    hotel: {
      name: "Spice Tree Munnar & Luxury Houseboat Alleppey",
      room: "Private Houseboat + Mountain Suite",
      nights: "4 Nights",
      mealPlan: "All Meals"
    },
    transfer: {
      type: "Toyota Innova Crysta",
      desc: "Private Chauffeur throughout Kerala circuit"
    },
    sightseeing: {
      included: ["Munnar Tea Gardens & Eravikulam", "Alleppey Backwaters Cruise", "Kathakali Cultural Center"],
      optional: ["Ayurvedic Rejuvenation Spa Session (+₹3,200)"]
    }
  },
  {
    id: "PKG202509140092",
    customer: {
      name: "Rohit Gupta",
      email: "rohit@gmail.com",
      phone: "+91 94567 81234",
      avatar: "RG"
    },
    packageName: "Singapore Discovery",
    image: "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=600&auto=format&fit=crop&q=80",
    duration: "6 Days / 5 Nights",
    route: "Mumbai → Singapore Changi → Mumbai",
    travelDate: "14 Sep – 19 Sep 2025",
    bookingDate: "09 Sep 2025, 03:00 PM",
    amount: 56800,
    basePrice: 48500,
    taxes: 8300,
    payment: "Paid",
    status: "Confirmed",
    flight: {
      airline: "Singapore Airlines",
      flightNo: "SQ-421",
      route: "Mumbai → Singapore",
      pnr: "SQ5510",
      class: "Economy"
    },
    hotel: {
      name: "Marina Bay Sands Partner Hotel",
      room: "Premier Harbor View",
      nights: "5 Nights",
      mealPlan: "Breakfast Included"
    },
    transfer: {
      type: "AC Luxury Coach & Metro Pass",
      desc: "Airport Transfers & Unlimited EZ-Link Metro Pass"
    },
    sightseeing: {
      included: ["Universal Studios Singapore", "Gardens by the Bay Supertrees & Cloud Forest", "Sentosa Cable Car"],
      optional: ["Night Safari Wildlife Experience (+₹2,900)"]
    }
  },
  {
    id: "PKG202509160017",
    customer: {
      name: "Anjali Desai",
      email: "anjali@gmail.com",
      phone: "+91 91234 98765",
      avatar: "AD"
    },
    packageName: "Himachal Relaxation",
    image: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=600&auto=format&fit=crop&q=80",
    duration: "5 Days / 4 Nights",
    route: "Delhi → Chandigarh → Manali → Solang → Delhi",
    travelDate: "16 Sep – 20 Sep 2025",
    bookingDate: "10 Sep 2025, 11:15 AM",
    amount: 26400,
    basePrice: 22800,
    taxes: 3600,
    payment: "Paid",
    status: "Confirmed",
    flight: {
      airline: "Alliance Air",
      flightNo: "9I-805",
      route: "Delhi → Kullu (Bhuntar)",
      pnr: "9I4421",
      class: "Economy"
    },
    hotel: {
      name: "The Himalayan Pine Resort Manali",
      room: "Cedar Luxury Suite",
      nights: "4 Nights",
      mealPlan: "Breakfast & Dinner"
    },
    transfer: {
      type: "Private 4x4 Chauffeur Vehicle",
      desc: "Manali, Solang Valley & Atal Tunnel excursions"
    },
    sightseeing: {
      included: ["Solang Valley Adventure Arena", "Atal Tunnel & Sissu Waterfalls", "Hadimba Devi Temple"],
      optional: ["Paragliding & Ziplining Combo at Dobhi (+₹3,000)"]
    }
  },
  {
    id: "PKG202509010003",
    customer: {
      name: "Karan Johar",
      email: "karan@gmail.com",
      phone: "+91 98111 22334",
      avatar: "KJ"
    },
    packageName: "Kashmir Paradise Tour",
    image: "https://images.unsplash.com/photo-1595815771614-ade9d652a65d?w=600&auto=format&fit=crop&q=80",
    duration: "6 Days / 5 Nights",
    route: "Delhi → Srinagar → Gulmarg → Pahalgam → Delhi",
    travelDate: "01 Sep – 06 Sep 2025",
    bookingDate: "28 Aug 2025, 08:30 PM",
    amount: 34500,
    basePrice: 29800,
    taxes: 4700,
    payment: "Refunded",
    status: "Cancelled",
    flight: {
      airline: "Air India",
      flightNo: "AI-825",
      route: "Delhi → Srinagar",
      pnr: "AI6629",
      class: "Economy"
    },
    hotel: {
      name: "Mascot Luxury Houseboat Dal Lake",
      room: "Royal Suite Houseboat",
      nights: "5 Nights",
      mealPlan: "Breakfast & Dinner"
    },
    transfer: {
      type: "Innova Crysta AC",
      desc: "Srinagar, Gulmarg & Pahalgam"
    },
    sightseeing: {
      included: ["Gulmarg Gondola Phase 1 & 2", "Shikara Ride Dal Lake", "Betaab Valley & Aru Valley"],
      optional: ["River Rafting in Lidder Pahalgam (+₹1,800)"]
    }
  }
];

export const initialBusBookings = [
  {
    id: "MBYB2025001",
    customer: {
      name: "Rahul Sharma",
      phone: "+91 98765 43210",
      email: "rahul@gmail.com",
      avatar: "R"
    },
    route: "Delhi → Jaipur",
    distance: "520 km",
    busDetails: "Volvo AC Sleeper",
    seatsInfo: "27 Seats Available",
    travelDate: "12 Sep 2025, 10:30 PM",
    amount: 1250,
    baseFare: 1050,
    gst: 50,
    convenienceFee: 150,
    status: "Confirmed",
    passengers: 2,
    seatNumbers: ["A1", "A2"],
    operator: "Zingbus Max",
    fromCity: "Delhi (Kashmere Gate)",
    toCity: "Jaipur (Sindhi Camp)",
    departureTime: "10:30 PM",
    arrivalTime: "05:00 AM",
    image: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600&auto=format&fit=crop&q=80",
    timeline: [
      { step: "Booking Confirmed", time: "09 Sep 2025, 02:14 PM", completed: true },
      { step: "Boarding", time: "12 Sep 2025, 10:00 PM", completed: false },
      { step: "Trip Completed", time: "13 Sep 2025, 05:00 AM", completed: false }
    ],
    notes: "Customer requested lower berths with window seat."
  },
  {
    id: "MBYB2025002",
    customer: {
      name: "Priya Verma",
      phone: "+91 87654 32109",
      email: "priya@gmail.com",
      avatar: "P"
    },
    route: "Lucknow → Delhi",
    distance: "310 km",
    busDetails: "Mercedes AC Seater",
    seatsInfo: "40 Seats Available",
    travelDate: "11 Sep 2025, 09:00 PM",
    amount: 850,
    baseFare: 720,
    gst: 36,
    convenienceFee: 94,
    status: "Pending",
    passengers: 1,
    seatNumbers: ["B4"],
    operator: "IntrCity SmartBus",
    fromCity: "Lucknow (Alambagh)",
    toCity: "Delhi (Akshardham)",
    departureTime: "09:00 PM",
    arrivalTime: "04:30 AM",
    image: "https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=600&auto=format&fit=crop&q=80",
    timeline: [
      { step: "Booking Confirmed", time: "Pending confirmation", completed: false },
      { step: "Boarding", time: "11 Sep 2025, 08:30 PM", completed: false },
      { step: "Trip Completed", time: "12 Sep 2025, 04:30 AM", completed: false }
    ],
    notes: "Payment initiated via UPI, awaiting bank confirmation."
  },
  {
    id: "MBYB2025003",
    customer: {
      name: "Amit Kumar",
      phone: "+91 98765 11223",
      email: "amit@gmail.com",
      avatar: "A"
    },
    route: "Chandigarh → Manali",
    distance: "320 km",
    busDetails: "Volvo AC Sleeper",
    seatsInfo: "28 Seats Available",
    travelDate: "10 Sep 2025, 08:30 PM",
    amount: 1450,
    baseFare: 1220,
    gst: 60,
    convenienceFee: 170,
    status: "Confirmed",
    passengers: 2,
    seatNumbers: ["C1", "C2"],
    operator: "Himachal Roadways Volvo",
    fromCity: "Chandigarh (ISBT 43)",
    toCity: "Manali (Private Bus Stand)",
    departureTime: "08:30 PM",
    arrivalTime: "06:30 AM",
    image: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600&auto=format&fit=crop&q=80",
    timeline: [
      { step: "Booking Confirmed", time: "08 Sep 2025, 11:20 AM", completed: true },
      { step: "Boarding", time: "10 Sep 2025, 08:00 PM", completed: false },
      { step: "Trip Completed", time: "11 Sep 2025, 06:30 AM", completed: false }
    ],
    notes: "Carry blankets provided on board."
  },
  {
    id: "MBYB2025004",
    customer: {
      name: "Neha Singh",
      phone: "+91 99887 76655",
      email: "neha@gmail.com",
      avatar: "N"
    },
    route: "Agra → Delhi",
    distance: "210 km",
    busDetails: "Scania AC Seater",
    seatsInfo: "45 Seats Available",
    travelDate: "09 Sep 2025, 07:15 PM",
    amount: 650,
    baseFare: 550,
    gst: 28,
    convenienceFee: 72,
    status: "Confirmed",
    passengers: 1,
    seatNumbers: ["D12"],
    operator: "NueGo Electric AC",
    fromCity: "Agra (ISBT)",
    toCity: "Delhi (Sarai Kale Khan)",
    departureTime: "07:15 PM",
    arrivalTime: "11:00 PM",
    image: "https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=600&auto=format&fit=crop&q=80",
    timeline: [
      { step: "Booking Confirmed", time: "07 Sep 2025, 03:40 PM", completed: true },
      { step: "Boarding", time: "09 Sep 2025, 06:45 PM", completed: true },
      { step: "Trip Completed", time: "09 Sep 2025, 11:00 PM", completed: true }
    ],
    notes: "Eco-friendly EV bus."
  },
  {
    id: "MBYB2025005",
    customer: {
      name: "Suresh Yadav",
      phone: "+91 77654 33221",
      email: "suresh@gmail.com",
      avatar: "S"
    },
    route: "Mumbai → Pune",
    distance: "150 km",
    busDetails: "Tata AC Seater",
    seatsInfo: "40 Seats Available",
    travelDate: "14 Sep 2025, 06:00 PM",
    amount: 780,
    baseFare: 650,
    gst: 35,
    convenienceFee: 95,
    status: "Pending",
    passengers: 2,
    seatNumbers: ["E5", "E6"],
    operator: "Shivneri MSRTC",
    fromCity: "Mumbai (Dadar)",
    toCity: "Pune (Swargate)",
    departureTime: "06:00 PM",
    arrivalTime: "09:45 PM",
    image: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600&auto=format&fit=crop&q=80",
    timeline: [
      { step: "Booking Confirmed", time: "Pending confirmation", completed: false },
      { step: "Boarding", time: "14 Sep 2025, 05:40 PM", completed: false },
      { step: "Trip Completed", time: "14 Sep 2025, 09:45 PM", completed: false }
    ],
    notes: "Direct Expressway service."
  },
  {
    id: "MBYB2025006",
    customer: {
      name: "Pooja Mehta",
      phone: "+91 86547 12345",
      email: "pooja@gmail.com",
      avatar: "P"
    },
    route: "Bangalore → Mysore",
    distance: "145 km",
    busDetails: "Volvo AC Sleeper",
    seatsInfo: "32 Seats Available",
    travelDate: "13 Sep 2025, 09:45 PM",
    amount: 920,
    baseFare: 780,
    gst: 40,
    convenienceFee: 100,
    status: "Confirmed",
    passengers: 1,
    seatNumbers: ["L3"],
    operator: "KSRTC Flybus",
    fromCity: "Bangalore (Kempegowda)",
    toCity: "Mysore (Suburban Bus Stand)",
    departureTime: "09:45 PM",
    arrivalTime: "01:15 AM",
    image: "https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=600&auto=format&fit=crop&q=80",
    timeline: [
      { step: "Booking Confirmed", time: "09 Sep 2025, 01:10 PM", completed: true },
      { step: "Boarding", time: "13 Sep 2025, 09:15 PM", completed: false },
      { step: "Trip Completed", time: "14 Sep 2025, 01:15 AM", completed: false }
    ],
    notes: "Non-stop Mysore Expressway transit."
  },
  {
    id: "MBYB2025007",
    customer: {
      name: "Vikash Singh",
      phone: "+91 70123 45678",
      email: "vikash@gmail.com",
      avatar: "V"
    },
    route: "Kolkata → Puri",
    distance: "500 km",
    busDetails: "Mercedes AC Seater",
    seatsInfo: "42 Seats Available",
    travelDate: "15 Sep 2025, 08:00 PM",
    amount: 1180,
    baseFare: 980,
    gst: 50,
    convenienceFee: 150,
    status: "Confirmed",
    passengers: 2,
    seatNumbers: ["F7", "F8"],
    operator: "Greenline Volvo Travels",
    fromCity: "Kolkata (Babughat)",
    toCity: "Puri (Lord Jagannath Bus Stand)",
    departureTime: "08:00 PM",
    arrivalTime: "06:00 AM",
    image: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600&auto=format&fit=crop&q=80",
    timeline: [
      { step: "Booking Confirmed", time: "08 Sep 2025, 07:22 PM", completed: true },
      { step: "Boarding", time: "15 Sep 2025, 07:30 PM", completed: false },
      { step: "Trip Completed", time: "16 Sep 2025, 06:00 AM", completed: false }
    ],
    notes: "Overnight journey."
  },
  {
    id: "MBYB2025008",
    customer: {
      name: "Anjali Gupta",
      phone: "+91 91234 98765",
      email: "anjali@gmail.com",
      avatar: "A"
    },
    route: "Hyderabad → Vijayawada",
    distance: "275 km",
    busDetails: "Scania AC Seater",
    seatsInfo: "40 Seats Available",
    travelDate: "16 Sep 2025, 07:30 PM",
    amount: 890,
    baseFare: 750,
    gst: 40,
    convenienceFee: 100,
    status: "Pending",
    passengers: 1,
    seatNumbers: ["C14"],
    operator: "TSRTC Garuda Plus",
    fromCity: "Hyderabad (MGBS)",
    toCity: "Vijayawada (Pandit Nehru)",
    departureTime: "07:30 PM",
    arrivalTime: "12:45 AM",
    image: "https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=600&auto=format&fit=crop&q=80",
    timeline: [
      { step: "Booking Confirmed", time: "Pending confirmation", completed: false },
      { step: "Boarding", time: "16 Sep 2025, 07:00 PM", completed: false },
      { step: "Trip Completed", time: "17 Sep 2025, 12:45 AM", completed: false }
    ],
    notes: "Awaiting confirmation."
  },
  {
    id: "MBYB2025009",
    customer: {
      name: "Rohit Sharma",
      phone: "+91 94567 81234",
      email: "rohit@gmail.com",
      avatar: "R"
    },
    route: "Indore → Bhopal",
    distance: "190 km",
    busDetails: "Tata AC Seater",
    seatsInfo: "45 Seats Available",
    travelDate: "12 Sep 2025, 05:20 PM",
    amount: 620,
    baseFare: 520,
    gst: 30,
    convenienceFee: 70,
    status: "Cancelled",
    passengers: 1,
    seatNumbers: ["G3"],
    operator: "Chartered Bus",
    fromCity: "Indore (Sarwate)",
    toCity: "Bhopal (ISBT)",
    departureTime: "05:20 PM",
    arrivalTime: "09:00 PM",
    image: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600&auto=format&fit=crop&q=80",
    timeline: [
      { step: "Booking Confirmed", time: "09 Sep 2025, 10:00 AM", completed: true },
      { step: "Cancelled by User", time: "10 Sep 2025, 03:20 PM", completed: true },
      { step: "Refund Initiated", time: "10 Sep 2025, 03:25 PM", completed: true }
    ],
    notes: "Cancelled within 48h window. Full refund issued."
  },
  {
    id: "MBYB2025010",
    customer: {
      name: "Kavita Rani",
      phone: "+91 99876 54321",
      email: "kavita@gmail.com",
      avatar: "K"
    },
    route: "Delhi → Haridwar",
    distance: "210 km",
    busDetails: "Volvo AC Sleeper",
    seatsInfo: "30 Seats Available",
    travelDate: "11 Sep 2025, 09:15 PM",
    amount: 1030,
    baseFare: 870,
    gst: 45,
    convenienceFee: 115,
    status: "Confirmed",
    passengers: 2,
    seatNumbers: ["H1", "H2"],
    operator: "UTC Platinum Volvo",
    fromCity: "Delhi (ISBT Anand Vihar)",
    toCity: "Haridwar (Har Ki Pauri)",
    departureTime: "09:15 PM",
    arrivalTime: "03:30 AM",
    image: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600&auto=format&fit=crop&q=80",
    timeline: [
      { step: "Booking Confirmed", time: "08 Sep 2025, 06:14 PM", completed: true },
      { step: "Boarding", time: "11 Sep 2025, 08:45 PM", completed: false },
      { step: "Trip Completed", time: "12 Sep 2025, 03:30 AM", completed: false }
    ],
    notes: "Spiritual yatra travelers."
  }
];

export const initialFlightBookings = [
  {
    id: "FL20250912001",
    customer: { name: "Rahul Sharma", email: "rahul@gmail.com", phone: "+91 98765 43210", avatar: "RS" },
    airline: "IndiGo",
    flightNo: "6E-236",
    pnr: "6E9841",
    route: "DEL → BOM",
    sector: "Delhi (DEL) → Mumbai (BOM)",
    fromCity: "Delhi (DEL)",
    toCity: "Mumbai (BOM)",
    departure: "10:20 AM",
    departureTerminal: "Terminal 3",
    arrival: "12:45 PM",
    arrivalTerminal: "Terminal 2",
    travelDate: "12 Sep 2025 10:20 AM",
    date: "12 Sep 2025",
    bookingDate: "09 Sep 2025, 10:15 AM",
    passenger: "Rahul Sharma (Adult)",
    seat: "12A",
    class: "Economy",
    baggage: "15 kg",
    amount: 8450,
    baseFare: 6500,
    gst: 325,
    convenienceFee: 625,
    payment: "Paid",
    status: "Confirmed",
    image: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=600&auto=format&fit=crop&q=80"
  },
  {
    id: "FL20250912002",
    customer: { name: "Priya Verma", email: "priya@gmail.com", phone: "+91 87654 32109", avatar: "PV" },
    airline: "Air India",
    flightNo: "AI-142",
    pnr: "AI2291",
    route: "DEL → BLR",
    sector: "Delhi (DEL) → Bengaluru (BLR)",
    fromCity: "Delhi (DEL)",
    toCity: "Bengaluru (BLR)",
    departure: "06:45 AM",
    departureTerminal: "Terminal 3",
    arrival: "09:30 AM",
    arrivalTerminal: "Terminal 1",
    travelDate: "13 Sep 2025 06:45 AM",
    date: "13 Sep 2025",
    bookingDate: "09 Sep 2025, 11:20 AM",
    passenger: "Priya Verma (Adult)",
    seat: "14C",
    class: "Economy Plus",
    baggage: "20 kg",
    amount: 12600,
    baseFare: 10800,
    gst: 600,
    convenienceFee: 1200,
    payment: "Paid",
    status: "Confirmed",
    image: "https://images.unsplash.com/photo-1540339832862-474599807836?w=600&auto=format&fit=crop&q=80"
  },
  {
    id: "FL20250912003",
    customer: { name: "Amit Kumar", email: "amit@gmail.com", phone: "+91 98765 11223", avatar: "AK" },
    airline: "Vistara",
    flightNo: "UK-812",
    pnr: "UK7718",
    route: "BOM → DEL",
    sector: "Mumbai (BOM) → Delhi (DEL)",
    fromCity: "Mumbai (BOM)",
    toCity: "Delhi (DEL)",
    departure: "09:30 PM",
    departureTerminal: "Terminal 2",
    arrival: "11:45 PM",
    arrivalTerminal: "Terminal 3",
    travelDate: "14 Sep 2025 09:30 PM",
    date: "14 Sep 2025",
    bookingDate: "09 Sep 2025, 01:45 PM",
    passenger: "Amit Kumar (Adult)",
    seat: "7F",
    class: "Premium Economy",
    baggage: "15 kg",
    amount: 9850,
    baseFare: 8200,
    gst: 490,
    convenienceFee: 1160,
    payment: "Paid",
    status: "Processing",
    image: "https://images.unsplash.com/photo-1520437358207-323b43b50729?w=600&auto=format&fit=crop&q=80"
  },
  {
    id: "FL20250912004",
    customer: { name: "Neha Singh", email: "neha@gmail.com", phone: "+91 99887 76655", avatar: "NS" },
    airline: "SpiceJet",
    flightNo: "SG-317",
    pnr: "SG3391",
    route: "DEL → HYD",
    sector: "Delhi (DEL) → Hyderabad (HYD)",
    fromCity: "Delhi (DEL)",
    toCity: "Hyderabad (HYD)",
    departure: "12:15 PM",
    departureTerminal: "Terminal 1",
    arrival: "02:35 PM",
    arrivalTerminal: "Terminal 1",
    travelDate: "15 Sep 2025 12:15 PM",
    date: "15 Sep 2025",
    bookingDate: "09 Sep 2025, 03:10 PM",
    passenger: "Neha Singh (Adult)",
    seat: "22B",
    class: "Economy",
    baggage: "15 kg",
    amount: 7320,
    baseFare: 6100,
    gst: 366,
    convenienceFee: 854,
    payment: "Pending",
    status: "Pending",
    image: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=600&auto=format&fit=crop&q=80"
  },
  {
    id: "FL20250912005",
    customer: { name: "Suresh Yadav", email: "suresh@gmail.com", phone: "+91 77654 33221", avatar: "SY" },
    airline: "IndiGo",
    flightNo: "6E-521",
    pnr: "6E1045",
    route: "JAI → DEL",
    sector: "Jaipur (JAI) → Delhi (DEL)",
    fromCity: "Jaipur (JAI)",
    toCity: "Delhi (DEL)",
    departure: "08:50 AM",
    departureTerminal: "Terminal 1",
    arrival: "09:45 AM",
    arrivalTerminal: "Terminal 3",
    travelDate: "16 Sep 2025 08:50 AM",
    date: "16 Sep 2025",
    bookingDate: "09 Sep 2025, 04:30 PM",
    passenger: "Suresh Yadav (Adult)",
    seat: "18D",
    class: "Economy",
    baggage: "15 kg",
    amount: 6780,
    baseFare: 5600,
    gst: 340,
    convenienceFee: 840,
    payment: "Paid",
    status: "Confirmed",
    image: "https://images.unsplash.com/photo-1540339832862-474599807836?w=600&auto=format&fit=crop&q=80"
  },
  {
    id: "FL20250912006",
    customer: { name: "Pooja Mehta", email: "pooja@gmail.com", phone: "+91 86547 12345", avatar: "PM" },
    airline: "Air India",
    flightNo: "AI-406",
    pnr: "AI7712",
    route: "DEL → GOI",
    sector: "Delhi (DEL) → Goa (GOI)",
    fromCity: "Delhi (DEL)",
    toCity: "Goa (GOI)",
    departure: "04:20 PM",
    departureTerminal: "Terminal 3",
    arrival: "07:00 PM",
    arrivalTerminal: "Terminal 1",
    travelDate: "17 Sep 2025 04:20 PM",
    date: "17 Sep 2025",
    bookingDate: "10 Sep 2025, 09:15 AM",
    passenger: "Pooja Mehta (Adult)",
    seat: "10A",
    class: "Economy Plus",
    baggage: "20 kg",
    amount: 11250,
    baseFare: 9500,
    gst: 560,
    convenienceFee: 1190,
    payment: "Paid",
    status: "Confirmed",
    image: "https://images.unsplash.com/photo-1520437358207-323b43b50729?w=600&auto=format&fit=crop&q=80"
  },
  {
    id: "FL20250912007",
    customer: { name: "Vikash Singh", email: "vikash@gmail.com", phone: "+91 70123 45678", avatar: "VS" },
    airline: "Akasa Air",
    flightNo: "QP-132",
    pnr: "QP8821",
    route: "BOM → CCU",
    sector: "Mumbai (BOM) → Kolkata (CCU)",
    fromCity: "Mumbai (BOM)",
    toCity: "Kolkata (CCU)",
    departure: "11:45 AM",
    departureTerminal: "Terminal 2",
    arrival: "02:25 PM",
    arrivalTerminal: "Terminal 1",
    travelDate: "18 Sep 2025 11:45 AM",
    date: "18 Sep 2025",
    bookingDate: "10 Sep 2025, 11:40 AM",
    passenger: "Vikash Singh (Adult)",
    seat: "16C",
    class: "Economy",
    baggage: "15 kg",
    amount: 8900,
    baseFare: 7400,
    gst: 445,
    convenienceFee: 1055,
    payment: "Pending",
    status: "Cancelled",
    image: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=600&auto=format&fit=crop&q=80"
  },
  {
    id: "FL20250912008",
    customer: { name: "Anjali Gupta", email: "anjali@gmail.com", phone: "+91 91234 98765", avatar: "AG" },
    airline: "Go First",
    flightNo: "G8-675",
    pnr: "G84401",
    route: "DEL → MAA",
    sector: "Delhi (DEL) → Chennai (MAA)",
    fromCity: "Delhi (DEL)",
    toCity: "Chennai (MAA)",
    departure: "07:30 PM",
    departureTerminal: "Terminal 2",
    arrival: "10:15 PM",
    arrivalTerminal: "Terminal 1",
    travelDate: "19 Sep 2025 07:30 PM",
    date: "19 Sep 2025",
    bookingDate: "10 Sep 2025, 02:20 PM",
    passenger: "Anjali Gupta (Adult)",
    seat: "9F",
    class: "Economy",
    baggage: "15 kg",
    amount: 10450,
    baseFare: 8800,
    gst: 520,
    convenienceFee: 1130,
    payment: "Paid",
    status: "Confirmed",
    image: "https://images.unsplash.com/photo-1540339832862-474599807836?w=600&auto=format&fit=crop&q=80"
  },
  {
    id: "FL20250912009",
    customer: { name: "Rohit Sharma", email: "rohit@gmail.com", phone: "+91 94567 81234", avatar: "RS" },
    airline: "IndiGo",
    flightNo: "6E-712",
    pnr: "6E3319",
    route: "DEL → ATQ",
    sector: "Delhi (DEL) → Amritsar (ATQ)",
    fromCity: "Delhi (DEL)",
    toCity: "Amritsar (ATQ)",
    departure: "03:15 PM",
    departureTerminal: "Terminal 1",
    arrival: "04:25 PM",
    arrivalTerminal: "Terminal 1",
    travelDate: "20 Sep 2025 03:15 PM",
    date: "20 Sep 2025",
    bookingDate: "10 Sep 2025, 04:50 PM",
    passenger: "Rohit Sharma (Adult)",
    seat: "15B",
    class: "Economy",
    baggage: "15 kg",
    amount: 9200,
    baseFare: 7800,
    gst: 460,
    convenienceFee: 940,
    payment: "Paid",
    status: "Confirmed",
    image: "https://images.unsplash.com/photo-1520437358207-323b43b50729?w=600&auto=format&fit=crop&q=80"
  },
  {
    id: "FL20250912010",
    customer: { name: "Kavita Rani", email: "kavita@gmail.com", phone: "+91 99876 54321", avatar: "KR" },
    airline: "Air India",
    flightNo: "AI-673",
    pnr: "AI9904",
    route: "IXC → DEL",
    sector: "Chandigarh (IXC) → Delhi (DEL)",
    fromCity: "Chandigarh (IXC)",
    toCity: "Delhi (DEL)",
    departure: "06:40 AM",
    departureTerminal: "Terminal 1",
    arrival: "07:35 AM",
    arrivalTerminal: "Terminal 3",
    travelDate: "21 Sep 2025 06:40 AM",
    date: "21 Sep 2025",
    bookingDate: "10 Sep 2025, 06:15 PM",
    passenger: "Kavita Rani (Adult)",
    seat: "6A",
    class: "Executive",
    baggage: "25 kg",
    amount: 13750,
    baseFare: 11500,
    gst: 685,
    convenienceFee: 1565,
    payment: "Pending",
    status: "Pending",
    image: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=600&auto=format&fit=crop&q=80"
  }
];

export const initialHotelBookings = [
  {
    id: "HTL2025091201",
    customer: { name: "Priya Verma", email: "priya@gmail.com", phone: "+91 87654 32109" },
    hotel: "Taj Fort Aguada Resort & Spa",
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&auto=format&fit=crop&q=80",
    city: "Goa (Candolim)",
    room: "Sea Facing Luxury Cottage",
    checkIn: "12 Sep 2025, 02:00 PM",
    checkOut: "15 Sep 2025, 11:00 AM",
    nights: "3 Nights",
    guests: "2 Adults, 1 Child",
    mealPlan: "Buffet Breakfast & Dinner",
    amount: 37800,
    taxes: 5700,
    status: "Confirmed",
    payment: "Paid"
  },
  {
    id: "HTL2025091402",
    customer: { name: "Rahul Sharma", email: "rahul@gmail.com", phone: "+91 98765 43210" },
    hotel: "The Oberoi Amarvilas",
    image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&auto=format&fit=crop&q=80",
    city: "Agra (Taj East Gate)",
    room: "Premier Taj View Room with Balcony",
    checkIn: "14 Sep 2025, 03:00 PM",
    checkOut: "16 Sep 2025, 12:00 PM",
    nights: "2 Nights",
    guests: "2 Adults",
    mealPlan: "Royal Breakfast Included",
    amount: 48000,
    taxes: 7200,
    status: "Confirmed",
    payment: "Paid"
  },
  {
    id: "HTL2025091503",
    customer: { name: "Amit Kumar", email: "amit@gmail.com", phone: "+91 98765 11223" },
    hotel: "Wildflower Hall, An Oberoi Resort",
    image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=600&auto=format&fit=crop&q=80",
    city: "Shimla (Mashobra)",
    room: "Mountain View Deluxe",
    checkIn: "15 Sep 2025, 02:00 PM",
    checkOut: "18 Sep 2025, 11:00 AM",
    nights: "3 Nights",
    guests: "2 Adults",
    mealPlan: "All Meals Included",
    amount: 54000,
    taxes: 8100,
    status: "Pending",
    payment: "Pending"
  },
  {
    id: "HTL2025091604",
    customer: { name: "Neha Singh", email: "neha@gmail.com", phone: "+91 99887 76655" },
    hotel: "Sea Shell Resort & Spa Havelock",
    image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=600&auto=format&fit=crop&q=80",
    city: "Andaman (Havelock)",
    room: "Andaman Lagoon Villa",
    checkIn: "16 Sep 2025, 01:00 PM",
    checkOut: "20 Sep 2025, 10:00 AM",
    nights: "4 Nights",
    guests: "2 Adults",
    mealPlan: "Breakfast Included",
    amount: 32000,
    taxes: 4800,
    status: "Confirmed",
    payment: "Paid"
  }
];

export const initialCabBookings = [
  {
    id: "CAB2025091201",
    customer: { name: "Suresh Yadav", email: "suresh@gmail.com", phone: "+91 77654 33221" },
    vehicle: "Toyota Innova Crysta (AC 7-Seater)",
    image: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=600&auto=format&fit=crop&q=80",
    vehicleType: "Luxury SUV",
    pickup: "Delhi Airport (IGI Terminal 3)",
    drop: "Agra (Fatehabad Road)",
    date: "12 Sep 2025, 08:30 AM",
    driver: "Rameshwar Singh (+91 98112 34567)",
    amount: 4850,
    baseFare: 4200,
    tollTaxes: 650,
    status: "Confirmed",
    timeline: [
      { step: "Driver Assigned", time: "11 Sep 2025, 06:00 PM", completed: true },
      { step: "Vehicle Dispatched", time: "12 Sep 2025, 07:45 AM", completed: true },
      { step: "Trip Completed", time: "12 Sep 2025, 12:30 PM", completed: false }
    ]
  },
  {
    id: "CAB2025091302",
    customer: { name: "Rahul Sharma", email: "rahul@gmail.com", phone: "+91 98765 43210" },
    vehicle: "Maruti Suzuki Dzire (AC Sedan)",
    image: "https://images.unsplash.com/photo-1550355291-bbee04a92027?w=600&auto=format&fit=crop&q=80",
    vehicleType: "Sedan",
    pickup: "Jaipur Railway Station",
    drop: "Amer Fort & Local Sightseeing (Full Day)",
    date: "13 Sep 2025, 09:00 AM",
    driver: "Mukesh Gurjar (+91 94140 12345)",
    amount: 2400,
    baseFare: 2100,
    tollTaxes: 300,
    status: "Confirmed",
    timeline: [
      { step: "Driver Assigned", time: "12 Sep 2025, 05:30 PM", completed: true },
      { step: "Vehicle Dispatched", time: "13 Sep 2025, 08:30 AM", completed: false },
      { step: "Trip Completed", time: "13 Sep 2025, 06:00 PM", completed: false }
    ]
  },
  {
    id: "CAB2025091403",
    customer: { name: "Pooja Mehta", email: "pooja@gmail.com", phone: "+91 86547 12345" },
    vehicle: "Mahindra Scorpio-N (4x4 AC)",
    image: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=600&auto=format&fit=crop&q=80",
    vehicleType: "SUV 4x4",
    pickup: "Chandigarh Airport (IXC)",
    drop: "Manali (Mall Road)",
    date: "14 Sep 2025, 07:00 AM",
    driver: "Devinder Sharma (+91 98160 99887)",
    amount: 6200,
    baseFare: 5500,
    tollTaxes: 700,
    status: "Pending",
    timeline: [
      { step: "Booking Created", time: "10 Sep 2025, 04:00 PM", completed: true },
      { step: "Driver Assignment in Progress", time: "Pending", completed: false }
    ]
  }
];

export const initialPackages = [
  {
    id: "PKG-001",
    name: "Andaman & Nicobar Dream",
    image: "https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?w=600&auto=format&fit=crop&q=80",
    destination: "Andaman & Nicobar",
    duration: "7 Days / 6 Nights",
    startingCity: "Delhi",
    endingCity: "Port Blair",
    price: 25900,
    originalPrice: 29900,
    type: "Customizable",
    status: "Active",
    services: ["Flight", "Hotel", "Cab", "Sightseeing"],
    description: "Discover azure beaches, lush tropical mangrove forests, coral reefs, and historical landmarks like the Cellular Jail in Port Blair.",
    customizable: true
  },
  {
    id: "PKG-002",
    name: "Bali Getaway",
    image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600&auto=format&fit=crop&q=80",
    destination: "Bali, Indonesia",
    duration: "5 Days / 4 Nights",
    startingCity: "Mumbai",
    endingCity: "Denpasar",
    price: 42500,
    originalPrice: 48000,
    type: "Customizable",
    status: "Active",
    services: ["Flight", "Hotel", "Cab", "Sightseeing"],
    description: "Experience the magic of Bali with picturesque sunsets, sacred water temples, iconic rice terraces, and beachfront dining.",
    customizable: true
  },
  {
    id: "PKG-003",
    name: "Thailand Explorer",
    image: "https://images.unsplash.com/photo-1528181304800-259b08848526?w=600&auto=format&fit=crop&q=80",
    destination: "Bangkok & Phuket",
    duration: "6 Days / 5 Nights",
    startingCity: "Kolkata",
    endingCity: "Phuket",
    price: 38000,
    originalPrice: 44000,
    type: "Customizable",
    status: "Active",
    services: ["Flight", "Hotel", "Cab", "Sightseeing"],
    description: "A fast-paced blend of Bangkok street life, glittering temples, and turquoise waters in Phuket and Phi Phi islands.",
    customizable: true
  },
  {
    id: "PKG-004",
    name: "Dubai Special",
    image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600&auto=format&fit=crop&q=80",
    destination: "Dubai, UAE",
    duration: "5 Days / 4 Nights",
    startingCity: "Delhi",
    endingCity: "Dubai",
    price: 52000,
    originalPrice: 59000,
    type: "Fixed",
    status: "Active",
    services: ["Flight", "Hotel", "Cab", "Sightseeing"],
    description: "Marvel at futuristic skyscrapers, conquer giant sand dunes in the Arabian desert, and indulge in luxury shopping.",
    customizable: false
  },
  {
    id: "PKG-005",
    name: "Kashmir Paradise Tour",
    image: "https://images.unsplash.com/photo-1595815771614-ade9d652a65d?w=600&auto=format&fit=crop&q=80",
    destination: "Srinagar & Gulmarg",
    duration: "6 Days / 5 Nights",
    startingCity: "Delhi",
    endingCity: "Srinagar",
    price: 34500,
    originalPrice: 39900,
    type: "Customizable",
    status: "Active",
    services: ["Flight", "Hotel", "Cab", "Sightseeing"],
    description: "Heaven on Earth: Dal Lake shikara rides, snow adventures at Gulmarg Gondola, and valley walks in Pahalgam.",
    customizable: true
  },
  {
    id: "PKG-006",
    name: "Goa Beach Holiday",
    image: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=600&auto=format&fit=crop&q=80",
    destination: "Goa",
    duration: "5 Days / 4 Nights",
    startingCity: "Mumbai",
    endingCity: "Goa",
    price: 28750,
    originalPrice: 33000,
    type: "Customizable",
    status: "Active",
    services: ["Flight", "Hotel", "Cab", "Sightseeing"],
    description: "Golden sand beaches, vibrant night markets, heritage Portuguese architecture, and coastal seafood feasts.",
    customizable: true
  }
];

export const initialCustomizationConfig = {
  packageId: "PKG-001",
  packageName: "Andaman & Nicobar Dream",
  duration: "7 Days / 6 Nights",
  route: "Delhi → Port Blair → Delhi",
  basePrice: 25900,
  createdOn: "12 Aug 2025",
  lastUpdated: "09 Sep 2025",
  image: "https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?w=600&auto=format&fit=crop&q=80",

  // Services state
  flight: {
    enabled: true,
    routeOption: "same", // "same" or "different"
    allowAirlineChange: true,
    allowTimeChange: true,
    allowClassChange: true,
    selectedOption: {
      airline: "IndiGo",
      flightNo: "6E-562",
      route: "DEL → IXZ",
      time: "07:15 AM – 10:30 AM",
      class: "Economy",
      baggage: "15 kg Check-in",
      priceDiff: 0
    },
    alternatives: [
      {
        id: "FL-ALT-1",
        airline: "IndiGo (Default)",
        flightNo: "6E-562",
        time: "07:15 AM – 10:30 AM",
        class: "Economy",
        priceDiff: 0,
        desc: "Morning non-stop flight"
      },
      {
        id: "FL-ALT-2",
        airline: "Air India Express",
        flightNo: "IX-221",
        time: "09:45 AM – 01:10 PM",
        class: "Economy Plus",
        priceDiff: 1800,
        desc: "Hot meal included"
      },
      {
        id: "FL-ALT-3",
        airline: "Vistara",
        flightNo: "UK-884",
        time: "11:30 AM – 02:45 PM",
        class: "Business Class",
        priceDiff: 8500,
        desc: "Lounge access + 30kg baggage"
      }
    ],
    rules: {
      allowChange: true,
      allowReplacement: true,
      allowUpgrade: true,
      allowDowngrade: false,
      additionalCharge: 250,
      maxPriceDiff: 15000,
      availabilityRequired: true
    }
  },

  hotel: {
    enabled: true,
    cityOption: "same", // "same" or "different"
    allowHotelChange: true,
    allowRoomTypeChange: true,
    allowMealPlanChange: true,
    selectedOption: {
      name: "Sea View Resort Andaman",
      rating: "4 Star",
      room: "Deluxe Ocean View",
      mealPlan: "Breakfast Included",
      priceDiff: 0
    },
    alternatives: [
      {
        id: "HTL-ALT-1",
        name: "Sea View Resort Andaman (Standard)",
        rating: "4 Star",
        room: "Deluxe Ocean View",
        mealPlan: "Breakfast Included",
        priceDiff: 0,
        image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&auto=format&fit=crop&q=80"
      },
      {
        id: "HTL-ALT-2",
        name: "Taj Exotica Resort & Spa Havelock",
        rating: "5 Star Luxury",
        room: "Grand Luxury Beach Villa",
        mealPlan: "All Meals Included",
        priceDiff: 14500,
        image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400&auto=format&fit=crop&q=80"
      },
      {
        id: "HTL-ALT-3",
        name: "Symphony Palms Beach Resort",
        rating: "4 Star Deluxe",
        room: "Lagoon Lagoon Cottage",
        mealPlan: "Breakfast & Dinner",
        priceDiff: 3200,
        image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400&auto=format&fit=crop&q=80"
      }
    ],
    rules: {
      allowChange: true,
      allowReplacement: true,
      allowUpgrade: true,
      allowDowngrade: true,
      additionalCharge: 0,
      maxPriceDiff: 25000,
      availabilityRequired: true
    }
  },

  cab: {
    enabled: true,
    vehicleOption: "same", // "same" or "different"
    allowCarTypeChange: true,
    allowPickupTimeChange: true,
    allowDropLocationChange: true,
    selectedOption: {
      vehicle: "Toyota Innova Crysta",
      type: "AC SUV 7-Seater",
      pickup: "Port Blair Airport",
      drop: "Hotel & Sightseeing",
      priceDiff: 0
    },
    alternatives: [
      {
        id: "CAB-ALT-1",
        vehicle: "Toyota Innova Crysta (Included)",
        type: "AC SUV 7-Seater",
        desc: "Comfortable group travel with luggage room",
        priceDiff: 0
      },
      {
        id: "CAB-ALT-2",
        vehicle: "Maruti Suzuki Ertiga",
        type: "AC Economy MUV",
        desc: "Budget-friendly option",
        priceDiff: -1500
      },
      {
        id: "CAB-ALT-3",
        vehicle: "Toyota Fortuner (4x4)",
        type: "Premium SUV",
        desc: "Luxury private chauffeur experience",
        priceDiff: 5000
      }
    ],
    rules: {
      allowChange: true,
      allowReplacement: true,
      allowUpgrade: true,
      allowDowngrade: true,
      additionalCharge: 0,
      maxPriceDiff: 10000,
      availabilityRequired: true
    }
  },

  sightseeing: {
    enabled: false, // In reference screenshot: Sightseeing is Fixed (toggle off)
    inclusionOption: "fixed", // "fixed" or "alternate"
    allowPlaceChange: false,
    allowAdditionalActivities: true,
    allowSkipOption: false,
    included: [
      "Cellular Jail Light & Sound Show",
      "Radhanagar Beach Sunset Walk",
      "Elephant Beach Coral Reef Safari",
      "Ross Island Historical Heritage Tour"
    ],
    optionalActivities: [
      {
        id: "ACT-1",
        name: "Scuba Diving with Certified Divemaster",
        location: "Havelock Island",
        price: 3500,
        selected: false
      },
      {
        id: "ACT-2",
        name: "Sea Kart Adventure Ride (Self-drive)",
        location: "Port Blair Marina",
        price: 2800,
        selected: false
      },
      {
        id: "ACT-3",
        name: "Kayaking in Mangrove Forest at Night",
        location: "Havelock Lagoon",
        price: 2200,
        selected: false
      }
    ],
    rules: {
      allowChange: false,
      allowReplacement: false,
      allowUpgrade: true,
      allowDowngrade: false,
      additionalCharge: 0,
      maxPriceDiff: 8000,
      availabilityRequired: true
    }
  }
};

export const initialDestinations = [
  {
    id: "DEST-01",
    name: "Goa",
    country: "India",
    state: "Goa",
    packagesCount: 18,
    bookingsCount: 124,
    status: "Active",
    popular: true,
    image: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=600&auto=format&fit=crop&q=80",
    description: "Sun, sand, spices, and historic churches along India's western coastline."
  },
  {
    id: "DEST-02",
    name: "Manali",
    country: "India",
    state: "Himachal Pradesh",
    packagesCount: 14,
    bookingsCount: 98,
    status: "Active",
    popular: true,
    image: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=600&auto=format&fit=crop&q=80",
    description: "Picturesque valley surrounded by towering snow-capped Himalayan peaks."
  },
  {
    id: "DEST-03",
    name: "Jaipur",
    country: "India",
    state: "Rajasthan",
    packagesCount: 12,
    bookingsCount: 76,
    status: "Active",
    popular: true,
    image: "https://images.unsplash.com/photo-1477587458883-47145ed94245?w=600&auto=format&fit=crop&q=80",
    description: "The historic Pink City renowned for grand forts, palaces, and royal cuisine."
  },
  {
    id: "DEST-04",
    name: "Andaman & Nicobar",
    country: "India",
    state: "Andaman & Nicobar Islands",
    packagesCount: 10,
    bookingsCount: 62,
    status: "Active",
    popular: true,
    image: "https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?w=600&auto=format&fit=crop&q=80",
    description: "Exotic tropical archipelago with world-class beaches and coral reefs."
  },
  {
    id: "DEST-05",
    name: "Kerala",
    country: "India",
    state: "Kerala",
    packagesCount: 16,
    bookingsCount: 54,
    status: "Active",
    popular: true,
    image: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=600&auto=format&fit=crop&q=80",
    description: "God's Own Country with serene backwaters, tea gardens, and Ayurveda sanctuaries."
  },
  {
    id: "DEST-06",
    name: "Bali",
    country: "Indonesia",
    state: "Bali Province",
    packagesCount: 8,
    bookingsCount: 45,
    status: "Active",
    popular: true,
    image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600&auto=format&fit=crop&q=80",
    description: "The Island of the Gods with dramatic volcano backdrops and pristine coasts."
  }
];

export const initialBlogs = [
  {
    id: "BLOG-01",
    title: "Top 10 Places to Visit in Andaman for First-Time Travelers",
    slug: "top-10-places-visit-andaman",
    category: "Travel Guides",
    author: "Rohan Kapoor",
    publishedDate: "09 Sep 2025",
    status: "Published",
    views: "14,250",
    thumbnail: "https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?w=600&auto=format&fit=crop&q=80",
    shortDesc: "From Radhanagar Beach to Havelock scuba trails, plan your dream Andaman getaway.",
    tags: ["Andaman", "Beaches", "Scuba", "Holidays"]
  },
  {
    id: "BLOG-02",
    title: "Best Travel Tips for First Time International Flyers",
    slug: "travel-tips-first-time-flyers",
    category: "Travel Tips",
    author: "Ananya Dixit",
    publishedDate: "08 Sep 2025",
    status: "Published",
    views: "9,800",
    thumbnail: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=600&auto=format&fit=crop&q=80",
    shortDesc: "Master immigration queues, baggage restrictions, and flight connections with confidence.",
    tags: ["Aviation", "Flights", "Tips", "Luggage"]
  },
  {
    id: "BLOG-03",
    title: "Monsoon Travel Destinations in India You Must Experience",
    slug: "monsoon-travel-destinations-india",
    category: "Inspirations",
    author: "Vikram Malhotra",
    publishedDate: "07 Sep 2025",
    status: "Published",
    views: "18,400",
    thumbnail: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=600&auto=format&fit=crop&q=80",
    shortDesc: "Witness Kerala, Coorg, and Meghalaya when the rain turns landscapes into emerald marvels.",
    tags: ["Monsoon", "Nature", "Kerala", "Roadtrips"]
  },
  {
    id: "BLOG-04",
    title: "Luxury Hotels in Goa for Your Next Romantic Trip",
    slug: "luxury-hotels-goa-romantic-trip",
    category: "Hotels & Stays",
    author: "Simran Kaur",
    publishedDate: "06 Sep 2025",
    status: "Published",
    views: "7,120",
    thumbnail: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&auto=format&fit=crop&q=80",
    shortDesc: "Discover private beach villas, cliffside suites, and bespoke hospitality in South Goa.",
    tags: ["Goa", "Luxury", "Hotels", "Couples"]
  }
];

export const initialBlogCategories = [
  { id: "CAT-1", name: "Travel Guides", slug: "travel-guides", description: "Comprehensive itineraries and packing checklists.", count: 18, status: "Active" },
  { id: "CAT-2", name: "Travel Tips", slug: "travel-tips", description: "Smart advice on visas, currency, and packing hacks.", count: 12, status: "Active" },
  { id: "CAT-3", name: "Inspirations", slug: "inspirations", description: "Curated lists of scenic retreats and bucket-list journeys.", count: 9, status: "Active" },
  { id: "CAT-4", name: "Hotels & Stays", slug: "hotels-stays", description: "Reviews and guides to luxury resorts and boutique stays.", count: 15, status: "Active" },
  { id: "CAT-5", name: "Food & Culture", slug: "food-culture", description: "Exploring local cuisines and age-old regional festivals.", count: 6, status: "Active" }
];

export const initialUsers = [
  {
    id: "USR-1001",
    name: "Rahul Sharma",
    email: "rahul@gmail.com",
    phone: "+91 98765 43210",
    bookingsCount: 8,
    totalSpent: 85200,
    status: "Active",
    joinedDate: "15 Jan 2024",
    avatar: "RS",
    city: "New Delhi",
    tier: "Platinum Member"
  },
  {
    id: "USR-1002",
    name: "Priya Verma",
    email: "priya@gmail.com",
    phone: "+91 87654 32109",
    bookingsCount: 6,
    totalSpent: 92800,
    status: "Active",
    joinedDate: "02 Mar 2024",
    avatar: "PV",
    city: "Mumbai",
    tier: "Gold Member"
  },
  {
    id: "USR-1003",
    name: "Amit Kumar",
    email: "amit@gmail.com",
    phone: "+91 98765 11223",
    bookingsCount: 11,
    totalSpent: 215400,
    status: "Active",
    joinedDate: "20 Nov 2023",
    avatar: "AK",
    city: "Bengaluru",
    tier: "Platinum Member"
  },
  {
    id: "USR-1004",
    name: "Neha Singh",
    email: "neha@gmail.com",
    phone: "+91 99887 76655",
    bookingsCount: 4,
    totalSpent: 45600,
    status: "Active",
    joinedDate: "12 Apr 2024",
    avatar: "NS",
    city: "Jaipur",
    tier: "Silver Member"
  },
  {
    id: "USR-1005",
    name: "Suresh Yadav",
    email: "suresh@gmail.com",
    phone: "+91 77654 33221",
    bookingsCount: 3,
    totalSpent: 42100,
    status: "Active",
    joinedDate: "29 May 2024",
    avatar: "SY",
    city: "Lucknow",
    tier: "Silver Member"
  },
  {
    id: "USR-1006",
    name: "Karan Johar",
    email: "karan@gmail.com",
    phone: "+91 98111 22334",
    bookingsCount: 1,
    totalSpent: 34500,
    status: "Inactive",
    joinedDate: "28 Aug 2025",
    avatar: "KJ",
    city: "Mumbai",
    tier: "Bronze Member"
  }
];

export const initialTransactions = [
  {
    id: "TXN-908231",
    bookingId: "PKG202509120045",
    customer: "Rahul Sharma",
    method: "UPI (Google Pay)",
    amount: 25900,
    date: "12 Sep 2025, 10:25 AM",
    status: "Success",
    gatewayRef: "PAY_UPI_9921448102"
  },
  {
    id: "TXN-908230",
    bookingId: "PKG202509100012",
    customer: "Priya Verma",
    method: "Credit Card (HDFC Visa)",
    amount: 42500,
    date: "10 Sep 2025, 02:16 PM",
    status: "Success",
    gatewayRef: "PAY_CC_8812903112"
  },
  {
    id: "TXN-908229",
    bookingId: "FLT2025091201",
    customer: "Rahul Sharma",
    method: "Net Banking (SBI)",
    amount: 8450,
    date: "09 Sep 2025, 10:15 AM",
    status: "Success",
    gatewayRef: "PAY_NB_4401928371"
  },
  {
    id: "TXN-908228",
    bookingId: "MBYB2025001",
    customer: "Rahul Sharma",
    method: "UPI (PhonePe)",
    amount: 1250,
    date: "09 Sep 2025, 02:15 PM",
    status: "Success",
    gatewayRef: "PAY_UPI_1192837465"
  },
  {
    id: "TXN-908227",
    bookingId: "PKG202509080034",
    customer: "Neha Singh",
    method: "Razorpay (Credit Card)",
    amount: 38000,
    date: "08 Sep 2025, 04:31 PM",
    status: "Pending",
    gatewayRef: "PAY_RZP_7712399120"
  },
  {
    id: "TXN-908226",
    bookingId: "PKG202509010003",
    customer: "Karan Johar",
    method: "Credit Card (ICICI)",
    amount: 34500,
    date: "06 Sep 2025, 05:00 PM",
    status: "Refunded",
    gatewayRef: "REF_ICICI_2210993812"
  }
];

export const initialNotifications = [
  {
    id: "NOTIF-1",
    title: "New Package Booking Confirmed",
    message: "Rahul Sharma booked Andaman & Nicobar Dream for ₹25,900.",
    category: "Bookings",
    time: "10 minutes ago",
    read: false,
    icon: "Package"
  },
  {
    id: "NOTIF-2",
    title: "Payment Received via UPI",
    message: "₹42,500 credited for Bali Getaway (Booking #PKG202509100012).",
    category: "Payments",
    time: "25 minutes ago",
    read: false,
    icon: "CreditCard"
  },
  {
    id: "NOTIF-3",
    title: "New Customer Registration",
    message: "Rohit Gupta registered from Mumbai with phone +91 94567 81234.",
    category: "System",
    time: "1 hour ago",
    read: false,
    icon: "User"
  },
  {
    id: "NOTIF-4",
    title: "Package Customization Updated",
    message: "Customization rules for Andaman Package flight & hotel updated by Admin.",
    category: "Packages",
    time: "3 hours ago",
    read: true,
    icon: "Sliders"
  },
  {
    id: "NOTIF-5",
    title: "Bus Booking Boarding Reminder",
    message: "Bus MBYB2025001 departing Delhi at 10:30 PM tonight.",
    category: "Bookings",
    time: "5 hours ago",
    read: true,
    icon: "Bus"
  }
];
