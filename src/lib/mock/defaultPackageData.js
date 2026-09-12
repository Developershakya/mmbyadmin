// Default Sample Package Structure for "Manali Adventure Package"
export const initialDefaultPackage = {
  id: 'PKG-MNL-2026',
  name: 'Manali Adventure & Snow Peaks Holiday',
  destination: 'Manali, Himachal Pradesh',
  startCity: 'Delhi',
  endCity: 'Delhi',
  duration: '3 Days',
  durationDays: 3,
  nights: '2 Nights',
  nightsCount: 2,
  packageType: 'Customizable', // Fixed | Customizable
  status: 'Draft', // Draft | Active | Inactive
  heroImage: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=1200&auto=format&fit=crop&q=80',
  shortDescription: 'Unforgettable 3-day Himalayan getaway featuring Solang Valley snow adventures, historic Hadimba temple, deluxe mountain stays, and private transfers.',
  longDescription: 'Escape to the majestic Himalayas with our signature Manali getaway. Immerse yourself in towering deodar forests, ancient wooden pagodas, thrilling river rapids, and high-altitude snow slopes. Every element of this package is carefully curated with verified 4-star mountain chalets, private chauffeured AC cabs, and round-the-clock on-ground concierge assistance.',
  highlights: [
    'Private roundtrip airport/transfer cab with certified mountain chauffeur',
    'Stay at 4-Star Snow Valley Resort with panoramic snow-peak balcony views',
    'Full day snow adventure at Solang Valley including ropeway gondola ride',
    'Complimentary authentic Himachali breakfast and multi-course candlelight dinner',
    'Comprehensive heritage sightseeing: Hadimba Temple, Vashisht Hot Springs & Mall Road'
  ],

  // Hotel Rules at Package Level
  hotelRules: {
    category: '4 Star',
    locationRule: 'Same destination',
    roomType: 'Deluxe Mountain View',
    mealPlan: 'Breakfast + Dinner',
    allowHotelChange: true,
    allowRoomChange: true,
    allowMealChange: true,
    allowHotelUpgrade: true,
    allowDifferentCity: false
  },

  // Service Level Configurations
  servicesConfig: {
    flight: { enabled: true, customizable: true },
    hotel: { enabled: true, customizable: true },
    cab: { enabled: true, customizable: false },
    bus: { enabled: false, customizable: true },
    sightseeing: { enabled: true, customizable: true },
    activity: { enabled: true, customizable: false },
    meal: { enabled: true, customizable: true }
  },

  // Pricing structure
  pricing: {
    basePrice: 20700,
    taxes: 1860,
    markup: 2500,
    discount: 1500,
    finalPrice: 23560
  },

  // Day-by-Day Itinerary
  days: [
    {
      id: 'day-1',
      dayNumber: 1,
      title: 'Arrival in Delhi & Scenic Drive to Manali via Chandigarh',
      location: 'Delhi to Manali',
      description: 'Board your morning flight to Chandigarh followed by a scenic chauffeured private transfer along the Beas river gorge to Manali. Check into your 4-star mountain resort and enjoy a welcome herbal tea with bonfire dinner.',
      image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=600&auto=format&fit=crop&q=80',
      services: {
        flight: {
          enabled: true,
          customizable: true,
          from: 'Delhi (DEL)',
          to: 'Chandigarh (IXC)',
          date: '2026-09-15',
          airline: 'IndiGo',
          classType: 'Economy',
          baggage: '15 kg Check-in, 7 kg Cabin',
          passengers: 2,
          flightType: 'One Way',
          selectedFlight: {
            id: 'FL-6E-2041',
            airline: 'IndiGo',
            flightNo: '6E-2041',
            from: 'Delhi (DEL)',
            to: 'Chandigarh (IXC)',
            departureTime: '06:15 AM',
            arrivalTime: '07:25 AM',
            duration: '1h 10m',
            basePrice: 4250,
            taxes: 600,
            totalPrice: 4850
          },
          rules: {
            allowCustomerChange: true,
            allowAirlineChange: true,
            allowTimeChange: true,
            allowClassUpgrade: true,
            allowRouteChange: false
          }
        },
        hotel: {
          enabled: true,
          customizable: true,
          city: 'Manali',
          hotelName: 'Hotel Snow Valley Resorts',
          category: '4 Star',
          roomType: 'Deluxe Mountain View',
          mealPlan: 'Breakfast + Dinner',
          nights: 1,
          selectedHotel: {
            id: 'HTL-MNL-001',
            name: 'Hotel Snow Valley Resorts',
            city: 'Manali',
            category: '4 Star',
            roomType: 'Deluxe Mountain View',
            mealPlan: 'Breakfast + Dinner',
            pricePerNight: 4500,
            taxes: 540,
            totalPerNight: 5040,
            image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&auto=format&fit=crop&q=80'
          },
          rules: {
            allowHotelChange: true,
            allowRoomChange: true,
            allowMealChange: true,
            allowHotelUpgrade: true
          }
        },
        cab: {
          enabled: true,
          customizable: false,
          pickup: 'Chandigarh Airport (IXC)',
          drop: 'Hotel Snow Valley Resorts, Manali',
          date: '2026-09-15',
          time: '08:00 AM',
          cabType: 'Sedan (Maruti Dzire / Toyota Etios)',
          passengers: 2,
          selectedCab: {
            id: 'CAB-SED-01',
            name: 'Sedan (Maruti Dzire / Toyota Etios)',
            type: 'Sedan',
            basePrice: 2500,
            totalPrice: 2800,
            driverAllowance: 'Included'
          }
        },
        bus: {
          enabled: false,
          customizable: false,
          from: 'Delhi',
          to: 'Manali',
          busType: 'AC Sleeper'
        },
        sightseeing: {
          enabled: true,
          customizable: true,
          items: [
            {
              id: 'SGHT-MNL-003',
              name: 'Tibetan Monastery (Gadhan Thekchhokling Gompa)',
              location: 'Near Mall Road, Manali',
              city: 'Manali',
              category: 'Culture & Monastery',
              duration: '1 Hour',
              image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=600&auto=format&fit=crop&q=80',
              description: 'Erected in the early 1960s by Tibetan refugees, celebrated for its glorious pagoda-style yellow roof, hand-painted murals, and meditation prayer wheels.',
              useMasterDescription: true,
              ticketPrice: 20
            }
          ]
        },
        activity: {
          enabled: false,
          customizable: false,
          items: []
        },
        meal: {
          enabled: true,
          customizable: true,
          items: [
            {
              id: 'MEL-DN-01',
              name: 'Candlelight Multi-Cuisine Dinner with Live Bonfire',
              mealType: 'Dinner',
              provider: 'Resort Terrace Bistro',
              description: 'Freshly prepared 4-course North Indian feast with hot Himachali apple dessert.',
              price: 1200,
              isIncluded: true,
              customizable: true
            }
          ]
        }
      }
    },
    {
      id: 'day-2',
      dayNumber: 2,
      title: 'High-Altitude Snow Fun at Solang Valley & Hadimba Temple',
      location: 'Solang Valley & Old Manali',
      description: 'Morning adventure trip to Solang Valley for ropeway cable car rides and paragliding thrills. Afternoon visit to the sacred 500-year-old wooden Hadimba temple and therapeutic Vashisht sulfur baths.',
      image: 'https://images.unsplash.com/photo-1517824806704-9040b037703b?w=600&auto=format&fit=crop&q=80',
      services: {
        flight: {
          enabled: false,
          customizable: false,
          rules: {}
        },
        hotel: {
          enabled: true,
          customizable: true,
          city: 'Manali',
          hotelName: 'Hotel Snow Valley Resorts',
          category: '4 Star',
          roomType: 'Deluxe Mountain View',
          mealPlan: 'Breakfast + Dinner',
          nights: 1,
          selectedHotel: {
            id: 'HTL-MNL-001',
            name: 'Hotel Snow Valley Resorts',
            city: 'Manali',
            category: '4 Star',
            roomType: 'Deluxe Mountain View',
            mealPlan: 'Breakfast + Dinner',
            pricePerNight: 4500,
            taxes: 540,
            totalPerNight: 5040,
            image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&auto=format&fit=crop&q=80'
          },
          rules: {
            allowHotelChange: true,
            allowRoomChange: true,
            allowMealChange: true,
            allowHotelUpgrade: true
          }
        },
        cab: {
          enabled: true,
          customizable: false,
          pickup: 'Resort Lobby',
          drop: 'Solang Valley & Manali Local Sightseeing',
          date: '2026-09-16',
          time: '09:00 AM',
          cabType: 'SUV (Toyota Innova Crysta / Maruti Ertiga)',
          passengers: 2,
          selectedCab: {
            id: 'CAB-SUV-01',
            name: 'SUV (Toyota Innova Crysta / Maruti Ertiga)',
            type: 'SUV',
            basePrice: 3500,
            totalPrice: 3950,
            driverAllowance: 'Included'
          }
        },
        bus: {
          enabled: false,
          customizable: false
        },
        sightseeing: {
          enabled: true,
          customizable: true,
          items: [
            {
              id: 'SGHT-MNL-004',
              name: 'Solang Valley & Snow View Point',
              location: 'Solang Valley, 14 km North of Manali',
              city: 'Manali',
              category: 'Adventure & Snow',
              duration: '3 - 4 Hours',
              image: 'https://images.unsplash.com/photo-1517824806704-9040b037703b?w=600&auto=format&fit=crop&q=80',
              description: 'The adventure playground of Himachal, famous for paragliding, snow zorbing, ropeway cable cars, and quad biking.',
              useMasterDescription: true,
              ticketPrice: 100
            },
            {
              id: 'SGHT-MNL-001',
              name: 'Hadimba Temple',
              location: 'Hadimba Temple Road, Old Manali',
              city: 'Manali',
              category: 'Heritage & Spiritual',
              duration: '1.5 - 2 Hours',
              image: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=600&auto=format&fit=crop&q=80',
              description: 'Ancient 16th-century wooden pagoda temple built in 1553, surrounded by towering cedar trees in Dhungiri Van Vihar.',
              useMasterDescription: true,
              ticketPrice: 50
            },
            {
              id: 'SGHT-MNL-002',
              name: 'Vashisht Kund & Hot Springs',
              location: 'Vashisht Village, 3 km from Manali',
              city: 'Manali',
              category: 'Natural & Spiritual',
              duration: '1 - 2 Hours',
              image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&auto=format&fit=crop&q=80',
              description: 'Natural hot sulphur springs believed to have medicinal healing properties alongside a 4000-year-old temple.',
              useMasterDescription: true,
              ticketPrice: 0
            }
          ]
        },
        activity: {
          enabled: true,
          customizable: false,
          items: [
            {
              id: 'ACT-MNL-01',
              name: 'High-Altitude Paragliding at Solang Valley',
              location: 'Solang Valley, Manali',
              category: 'Adventure Sport',
              duration: '15 - 20 Mins Flight',
              price: 2500,
              isIncluded: true,
              customizable: false,
              description: 'Tandem flight with government-certified pilot soaring 1,000 feet above Solang Valley with GoPro video recording.'
            },
            {
              id: 'ACT-MNL-05',
              name: 'Solang Valley Ropeway Cable Car Ride',
              location: 'Solang Valley Cable Station',
              category: 'Scenic Ride',
              duration: '30 Mins Return',
              price: 750,
              isIncluded: true,
              customizable: false,
              description: 'State-of-the-art Swiss gondola ascending to 3,200 meters providing 360-degree views of snow glaciers.'
            }
          ]
        },
        meal: {
          enabled: true,
          customizable: true,
          items: [
            {
              id: 'MEL-BF-01',
              name: 'Continental & Himachali Breakfast Buffet',
              mealType: 'Breakfast',
              provider: 'Hotel In-House Multi-Cuisine Dining',
              description: 'Full buffet breakfast with parathas, eggs, fresh juice, and coffee.',
              price: 450,
              isIncluded: true,
              customizable: true
            },
            {
              id: 'MEL-DN-01',
              name: 'Grand Buffet Dinner',
              mealType: 'Dinner',
              provider: 'Hotel Dining Hall',
              description: 'Lavish multi-cuisine dinner buffet.',
              price: 1200,
              isIncluded: true,
              customizable: true
            }
          ]
        }
      }
    },
    {
      id: 'day-3',
      dayNumber: 3,
      title: 'Mall Road Souvenir Shopping & Return Journey to Delhi',
      location: 'Manali to Delhi',
      description: 'Relish a wholesome breakfast, check out of the resort, and enjoy leisurely morning shopping for woolens and honey on Mall Road. Transfer to Chandigarh airport for your return evening flight to Delhi.',
      image: 'https://images.unsplash.com/photo-1519451241324-20b4ea2c4220?w=600&auto=format&fit=crop&q=80',
      services: {
        flight: {
          enabled: true,
          customizable: true,
          from: 'Chandigarh (IXC)',
          to: 'Delhi (DEL)',
          date: '2026-09-17',
          airline: 'IndiGo',
          classType: 'Economy',
          baggage: '15 kg Check-in, 7 kg Cabin',
          passengers: 2,
          flightType: 'One Way',
          selectedFlight: {
            id: 'FL-RET-6E-2042',
            airline: 'IndiGo',
            flightNo: '6E-2042',
            from: 'Chandigarh (IXC)',
            to: 'Delhi (DEL)',
            departureTime: '06:40 PM',
            arrivalTime: '07:55 PM',
            duration: '1h 15m',
            basePrice: 4300,
            taxes: 620,
            totalPrice: 4920
          },
          rules: {
            allowCustomerChange: true,
            allowAirlineChange: true,
            allowTimeChange: true,
            allowClassUpgrade: true,
            allowRouteChange: false
          }
        },
        hotel: {
          enabled: false,
          customizable: false
        },
        cab: {
          enabled: true,
          customizable: false,
          pickup: 'Manali Resort / Mall Road',
          drop: 'Chandigarh Airport (IXC)',
          date: '2026-09-17',
          time: '10:30 AM',
          cabType: 'Sedan (Maruti Dzire / Toyota Etios)',
          passengers: 2,
          selectedCab: {
            id: 'CAB-SED-01',
            name: 'Sedan (Maruti Dzire / Toyota Etios)',
            type: 'Sedan',
            basePrice: 2500,
            totalPrice: 2800,
            driverAllowance: 'Included'
          }
        },
        bus: {
          enabled: false,
          customizable: false
        },
        sightseeing: {
          enabled: true,
          customizable: true,
          items: [
            {
              id: 'SGHT-MNL-005',
              name: 'Mall Road Manali',
              location: 'City Center, Manali',
              city: 'Manali',
              category: 'Shopping & Leisure',
              duration: '2 Hours',
              image: 'https://images.unsplash.com/photo-1519451241324-20b4ea2c4220?w=600&auto=format&fit=crop&q=80',
              description: 'The lively pedestrian heart of Manali lined with wooden handicraft emporiums, woolen shops, and pine-clad mountain views.',
              useMasterDescription: true,
              ticketPrice: 0
            }
          ]
        },
        activity: {
          enabled: false,
          customizable: false,
          items: []
        },
        meal: {
          enabled: true,
          customizable: true,
          items: [
            {
              id: 'MEL-BF-01',
              name: 'Farewell Mountain Breakfast',
              mealType: 'Breakfast',
              provider: 'Hotel In-House Dining',
              description: 'Breakfast buffet before departure checkout.',
              price: 450,
              isIncluded: true,
              customizable: true
            }
          ]
        }
      }
    }
  ]
};

export const defaultPackageData = initialDefaultPackage;
export default initialDefaultPackage;
