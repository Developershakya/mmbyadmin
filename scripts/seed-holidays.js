import sequelize from '../config/sequelize.js';
import Holiday from '../models/Holiday.js';

const sampleHolidays = [
  {
    title: "Goa Hero Package with Complimentary Activities",
    description: "Experience the beaches of Goa with water sports, boat parties, and luxury resort stays.",
    destination: "Goa",
    duration: "4 Days 3 Nights",
    price: 12999,
    originalPrice: 16999,
    discount: 23,
    image: "https://images.pexels.com/photos/206359/pexels-photo-206359.jpeg",
    images: [
      "https://images.pexels.com/photos/206359/pexels-photo-206359.jpeg",
      "https://images.pexels.com/photos/206648/pexels-photo-206648.jpeg",
      "https://images.pexels.com/photos/709552/pexels-photo-709552.jpeg"
    ],
    category: "Beach",
    difficulty: "Easy",
    rating: 4.5,
    reviewCount: 245,
    itinerary: [
      {
        day: 1,
        title: "Arrival in Goa",
        activities: [
          "Airport to hotel transfer via private cab",
          "Check-in at luxury resort",
          "Evening beach walk"
        ]
      },
      {
        day: 2,
        title: "Water Sports & Boat Party",
        activities: [
          "Double decker boat party",
          "Water sports activities",
          "Lunch included",
          "Sunset return"
        ]
      },
      {
        day: 3,
        title: "Leisure Day",
        activities: [
          "Spa & wellness at resort",
          "Beach exploration",
          "Shopping at local markets"
        ]
      },
      {
        day: 4,
        title: "Departure",
        activities: [
          "Breakfast at hotel",
          "Checkout and departure"
        ]
      }
    ],
    inclusions: [
      "3 nights accommodation in 4-star resort",
      "Daily breakfast",
      "Water sports activities",
      "Boat party with lunch",
      "Airport transfers",
      "Welcome drink"
    ],
    exclusions: [
      "Flights",
      "Personal expenses",
      "Activities not mentioned in itinerary",
      "Travel insurance"
    ],
    cancellationPolicy: "Free cancellation till 30 days before travel. 50% charges for 15-29 days. 100% charges for less than 15 days.",
    bestTimeToVisit: "October to March",
    maxGroupSize: 30,
    isActive: true
  },
  {
    title: "Manali Adventure & Nature Retreat",
    description: "Trek through scenic valleys, enjoy adventure sports, and relax in nature's lap.",
    destination: "Manali",
    duration: "5 Days 4 Nights",
    price: 15999,
    originalPrice: 19999,
    discount: 20,
    image: "https://images.pexels.com/photos/1659438/pexels-photo-1659438.jpeg",
    images: [
      "https://images.pexels.com/photos/1659438/pexels-photo-1659438.jpeg",
      "https://images.pexels.com/photos/2398220/pexels-photo-2398220.jpeg"
    ],
    category: "Mountain",
    difficulty: "Moderate",
    rating: 4.8,
    reviewCount: 432,
    itinerary: [
      {
        day: 1,
        title: "Arrival in Manali",
        activities: [
          "Airport pickup",
          "Hotel check-in",
          "Welcome orientation"
        ]
      },
      {
        day: 2,
        title: "Trekking & Nature Walk",
        activities: [
          "Guided nature trek",
          "Picnic lunch at scenic spot",
          "Photography session"
        ]
      },
      {
        day: 3,
        title: "Adventure Activities",
        activities: [
          "Paragliding or rock climbing",
          "Village visit",
          "Local cuisine cooking class"
        ]
      },
      {
        day: 4,
        title: "Relaxation & Exploration",
        activities: [
          "Spa treatment",
          "Local market exploration",
          "Bonfire & dinner"
        ]
      },
      {
        day: 5,
        title: "Departure",
        activities: [
          "Breakfast and checkout",
          "Airport transfer"
        ]
      }
    ],
    inclusions: [
      "4 nights accommodation",
      "Daily breakfast and dinner",
      "Guided treks and activities",
      "Airport transfers",
      "Activity equipment"
    ],
    exclusions: [
      "Flights",
      "Lunch on specific days",
      "Insurance"
    ],
    cancellationPolicy: "Free cancellation till 45 days. Partial refund for 15-44 days.",
    bestTimeToVisit: "March to June, September to November",
    maxGroupSize: 20,
    isActive: true
  },
  {
    title: "Kerala Backwaters & Houseboat Escape",
    description: "Cruise through serene backwaters, experience authentic Kerala cuisine, and rejuvenate.",
    destination: "Kerala",
    duration: "4 Days 3 Nights",
    price: 14999,
    originalPrice: 18999,
    discount: 21,
    image: "https://images.pexels.com/photos/321552/pexels-photo-321552.jpeg",
    images: [
      "https://images.pexels.com/photos/321552/pexels-photo-321552.jpeg",
      "https://images.pexels.com/photos/1078637/pexels-photo-1078637.jpeg"
    ],
    category: "Beach",
    difficulty: "Easy",
    rating: 4.6,
    reviewCount: 567,
    itinerary: [
      {
        day: 1,
        title: "Kochi Arrival",
        activities: [
          "Airport pickup",
          "Fort Kochi exploration",
          "Chinese fishing nets visit"
        ]
      },
      {
        day: 2,
        title: "Houseboat Adventure",
        activities: [
          "Overnight houseboat cruise",
          "Backwater exploration",
          "Sunset views"
        ]
      },
      {
        day: 3,
        title: "Backwater & Spice Tour",
        activities: [
          "Spice plantation tour",
          "Afternoon backwater cruise",
          "Ayurvedic massage"
        ]
      },
      {
        day: 4,
        title: "Departure",
        activities: [
          "Beach visit",
          "Shopping and checkout"
        ]
      }
    ],
    inclusions: [
      "3 nights accommodation",
      "Houseboat cruise",
      "All meals",
      "Spice tour",
      "Ayurvedic treatment"
    ],
    exclusions: [
      "Personal items",
      "Optional activities",
      "Gratuities"
    ],
    cancellationPolicy: "Free cancellation till 40 days.",
    bestTimeToVisit: "June to September, November to March",
    maxGroupSize: 25,
    isActive: true
  },
  {
    title: "Rajasthan Royal Heritage Tour",
    description: "Explore magnificent forts, palaces, and experience royal hospitality in Rajasthan.",
    destination: "Rajasthan",
    duration: "6 Days 5 Nights",
    price: 18999,
    originalPrice: 24999,
    discount: 24,
    image: "https://images.pexels.com/photos/1230391/pexels-photo-1230391.jpeg",
    images: [
      "https://images.pexels.com/photos/1230391/pexels-photo-1230391.jpeg",
      "https://images.pexels.com/photos/2156656/pexels-photo-2156656.jpeg"
    ],
    category: "Heritage",
    difficulty: "Easy",
    rating: 4.7,
    reviewCount: 654,
    itinerary: [
      {
        day: 1,
        title: "Jaipur Arrival",
        activities: [
          "Delhi to Jaipur drive",
          "Palace orientation",
          "City Palace visit"
        ]
      },
      {
        day: 2,
        title: "Jaipur Sightseeing",
        activities: [
          "Hawa Mahal visit",
          "Albert Hall museum",
          "Evening bazaar shopping"
        ]
      },
      {
        day: 3,
        title: "Jaipur to Jodhpur",
        activities: [
          "Drive to Jodhpur",
          "Mehrangarh Fort exploration",
          "Blue city walk"
        ]
      },
      {
        day: 4,
        title: "Jodhpur to Udaipur",
        activities: [
          "Drive to Udaipur",
          "Lake Pichola cruise",
          "City Palace view"
        ]
      },
      {
        day: 5,
        title: "Udaipur Exploration",
        activities: [
          "Jagdish Temple",
          "Saheliyon ki Badi",
          "Sunset at lake",
          "Cultural program"
        ]
      },
      {
        day: 6,
        title: "Departure",
        activities: [
          "Breakfast and return"
        ]
      }
    ],
    inclusions: [
      "5 nights in heritage hotels",
      "All meals",
      "All sightseeing tours",
      "Entry fees",
      "Professional guide"
    ],
    exclusions: [
      "Flights",
      "Alcohol",
      "Tips"
    ],
    cancellationPolicy: "Non-refundable. Changes allowed till 60 days.",
    bestTimeToVisit: "October to March",
    maxGroupSize: 30,
    isActive: true
  },
  {
    title: "Himalayan Trekking Expedition",
    description: "Challenge yourself with treks through stunning Himalayan peaks and pristine wilderness.",
    destination: "Himachal Pradesh",
    duration: "7 Days 6 Nights",
    price: 22999,
    originalPrice: 29999,
    discount: 23,
    image: "https://images.pexels.com/photos/1619317/pexels-photo-1619317.jpeg",
    images: [
      "https://images.pexels.com/photos/1619317/pexels-photo-1619317.jpeg"
    ],
    category: "Adventure",
    difficulty: "Difficult",
    rating: 4.9,
    reviewCount: 234,
    itinerary: [
      {
        day: 1,
        title: "Base Camp Arrival",
        activities: ["Acclimatization", "Equipment check"]
      },
      {
        day: 2,
        title: "Trek Day 1",
        activities: ["Guided trek", "Camping"]
      },
      {
        day: 3,
        title: "Trek Day 2",
        activities: ["High altitude trek", "Mountain views"]
      },
      {
        day: 4,
        title: "Peak Ascent",
        activities: ["Early morning summit attempt"]
      },
      {
        day: 5,
        title: "Descent",
        activities: ["Guided descent", "Rest day"]
      },
      {
        day: 6,
        title: "Base Camp Return",
        activities: ["Final stretch", "Celebration dinner"]
      },
      {
        day: 7,
        title: "Departure",
        activities: ["Return journey"]
      }
    ],
    inclusions: [
      "Professional guides",
      "Accommodation during trek",
      "All meals",
      "Trekking equipment",
      "Insurance"
    ],
    exclusions: [
      "Flights",
      "Personal gear",
      "Altitude sickness medication"
    ],
    cancellationPolicy: "Refund 60 days before. 50% charges within 60 days.",
    bestTimeToVisit: "May to September",
    maxGroupSize: 15,
    isActive: true
  },
  {
    title: "Coorg Coffee Plantation & Nature Stay",
    description: "Experience authentic coffee plantation life, lush green hills, and relaxing nature retreats.",
    destination: "Coorg",
    duration: "3 Days 2 Nights",
    price: 8999,
    originalPrice: 11999,
    discount: 25,
    image: "https://images.pexels.com/photos/1407322/pexels-photo-1407322.jpeg",
    images: [
      "https://images.pexels.com/photos/1407322/pexels-photo-1407322.jpeg"
    ],
    category: "Nature",
    difficulty: "Easy",
    rating: 4.4,
    reviewCount: 389,
    itinerary: [
      {
        day: 1,
        title: "Coorg Arrival",
        activities: [
          "Plantation tour",
          "Coffee processing demo",
          "Local lunch"
        ]
      },
      {
        day: 2,
        title: "Exploration",
        activities: [
          "Waterfall visit",
          "Forest trekking",
          "Coffee tasting"
        ]
      },
      {
        day: 3,
        title: "Departure",
        activities: [
          "Sunrise viewpoint",
          "Shopping and checkout"
        ]
      }
    ],
    inclusions: [
      "2 nights stay",
      "All meals",
      "Plantation tour",
      "Trekking guide"
    ],
    exclusions: [
      "Personal items",
      "Adventure insurance"
    ],
    cancellationPolicy: "Free cancellation till 14 days.",
    bestTimeToVisit: "June to September, December to February",
    maxGroupSize: 20,
    isActive: true
  }
];

async function seedHolidays() {
  try {
    // Sync the database
    await sequelize.sync({ alter: true });
    console.log('✅ Database synced successfully');

    // Clear existing holidays
    await Holiday.destroy({ where: {} });
    console.log('🗑️ Cleared existing holidays');

    // Insert sample holidays
    const created = await Holiday.bulkCreate(sampleHolidays);
    console.log(`✅ Created ${created.length} holiday packages`);

    console.log('\n📋 Holidays created:');
    created.forEach((h, i) => {
      console.log(`${i + 1}. ${h.title} - ₹${h.price} (${h.destination})`);
    });

    await sequelize.close();
    console.log('\n✅ Seeding completed successfully!');
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
}

seedHolidays();
