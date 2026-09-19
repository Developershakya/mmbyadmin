import sequelize from "../config/sequelize.js";
import Hotel from "./Hotel.js";
import Package from "./Package.js";
import AirportList from "./AirportList.js";
import Bus from "./Bus.js";
import Cities from "./Cities.js";
import User from "./User.js";
import Sightseeing from "./Sightseeing.js";
import BlogCategory from "./BlogCategory.js";
import Blog from "./Blog.js";
import TravelSearchSession from "./TravelSearchSession.js";
import PackageServiceItem from "./PackageServiceItem.js";
import ServiceApiLog from "./ServiceApiLog.js";
import Payment from "./Payment.js";
import FlightBooking from "./FlightBooking.js";
import HotelBooking from "./HotelBooking.js";
import BusBooking from "./BusBooking.js";
import CarBooking from "./CarBooking.js";
import { SRDV_BUS_CITIES, SRDV_HOTEL_CITIES } from "../lib/srdv/cityMappings.js";

// Setup Associations
Package.hasMany(PackageServiceItem, { foreignKey: 'packageId', as: 'serviceItems' });
PackageServiceItem.belongsTo(Package, { foreignKey: 'packageId', as: 'package' });

Package.hasMany(FlightBooking, { foreignKey: 'packageId', as: 'flightBookings' });
FlightBooking.belongsTo(Package, { foreignKey: 'packageId', as: 'package' });

Package.hasMany(HotelBooking, { foreignKey: 'packageId', as: 'hotelBookings' });
HotelBooking.belongsTo(Package, { foreignKey: 'packageId', as: 'package' });

Package.hasMany(BusBooking, { foreignKey: 'packageId', as: 'busBookings' });
BusBooking.belongsTo(Package, { foreignKey: 'packageId', as: 'package' });

Package.hasMany(CarBooking, { foreignKey: 'packageId', as: 'carBookings' });
CarBooking.belongsTo(Package, { foreignKey: 'packageId', as: 'package' });

Package.hasMany(Payment, { foreignKey: 'packageId', as: 'payments' });
Payment.belongsTo(Package, { foreignKey: 'packageId', as: 'package' });

export {
  sequelize,
  Hotel,
  Package,
  AirportList,
  Bus,
  Cities,
  User,
  Sightseeing,
  BlogCategory,
  Blog,
  TravelSearchSession,
  PackageServiceItem,
  ServiceApiLog,
  Payment,
  FlightBooking,
  HotelBooking,
  BusBooking,
  CarBooking
};

export async function initDb() {
  try {
    await sequelize.sync({ alter: true });

    // Seed Airports if empty
    const airportCount = await AirportList.count();
    if (airportCount === 0) {
      await AirportList.bulkCreate([
        {
          airport_code: "DEL",
          airport_name: "Indira Gandhi International Airport",
          airport_city_code: "DEL",
          airport_city_name: "Delhi",
          airport_country_name: "India",
          airport_country_code: "IN",
          airport_city: "Delhi",
        },
        {
          airport_code: "BOM",
          airport_name: "Chhatrapati Shivaji Maharaj International Airport",
          airport_city_code: "BOM",
          airport_city_name: "Mumbai",
          airport_country_name: "India",
          airport_country_code: "IN",
          airport_city: "Mumbai",
        },
        {
          airport_code: "BLR",
          airport_name: "Kempegowda International Airport",
          airport_city_code: "BLR",
          airport_city_name: "Bengaluru",
          airport_country_name: "India",
          airport_country_code: "IN",
          airport_city: "Bengaluru",
        },
        {
          airport_code: "CCU",
          airport_name: "Netaji Subhash Chandra Bose International Airport",
          airport_city_code: "CCU",
          airport_city_name: "Kolkata",
          airport_country_name: "India",
          airport_country_code: "IN",
          airport_city: "Kolkata",
        },
        {
          airport_code: "KUU",
          airport_name: "Kullu Manali Airport (Bhuntar)",
          airport_city_code: "KUU",
          airport_city_name: "Kullu / Manali",
          airport_country_name: "India",
          airport_country_code: "IN",
          airport_city: "Manali",
        },
        {
          airport_code: "IXC",
          airport_name: "Chandigarh International Airport",
          airport_city_code: "IXC",
          airport_city_name: "Chandigarh",
          airport_country_name: "India",
          airport_country_code: "IN",
          airport_city: "Chandigarh",
        },
        {
          airport_code: "JAI",
          airport_name: "Jaipur International Airport",
          airport_city_code: "JAI",
          airport_city_name: "Jaipur",
          airport_country_name: "India",
          airport_country_code: "IN",
          airport_city: "Jaipur",
        },
        {
          airport_code: "GOI",
          airport_name: "Dabolim International Airport",
          airport_city_code: "GOI",
          airport_city_name: "Goa",
          airport_country_name: "India",
          airport_country_code: "IN",
          airport_city: "Goa",
        },
        {
          airport_code: "SXR",
          airport_name: "Sheikh ul-Alam International Airport",
          airport_city_code: "SXR",
          airport_city_name: "Srinagar",
          airport_country_name: "India",
          airport_country_code: "IN",
          airport_city: "Srinagar",
        },
        {
          airport_code: "DXB",
          airport_name: "Dubai International Airport",
          airport_city_code: "DXB",
          airport_city_name: "Dubai",
          airport_country_name: "United Arab Emirates",
          airport_country_code: "AE",
          airport_city: "Dubai",
        },
      ]);
    }

    // Seed Cities if empty
    const citiesCount = await Cities.count();
    if (citiesCount === 0) {
      await Cities.bulkCreate([
        { id: 1, state_id: 1, city_name: "Delhi" },
        { id: 2, state_id: 2, city_name: "Manali" },
        { id: 3, state_id: 2, city_name: "Shimla" },
        { id: 4, state_id: 3, city_name: "Jaipur" },
        { id: 5, state_id: 4, city_name: "Mumbai" },
        { id: 6, state_id: 5, city_name: "Goa" },
        { id: 7, state_id: 6, city_name: "Srinagar" },
        { id: 8, state_id: 7, city_name: "Agra" },
        { id: 9, state_id: 8, city_name: "Chandigarh" },
        { id: 10, state_id: 9, city_name: "Bangalore" },
        { id: 11, state_id: 10, city_name: "Udaipur" },
        { id: 12, state_id: 11, city_name: "Varanasi" },
      ]);
    }

    // Seed or update Bus Cities with authentic SRDV city codes
    const busCount = await Bus.count();
    const existingBus = await Bus.findOne({ where: { CityId: 230 } });
    if (busCount === 0 || !existingBus) {
      await Bus.destroy({ where: {} });
      await Bus.bulkCreate(
        SRDV_BUS_CITIES.map((c) => ({
          CityId: c.CityId,
          CityName: `${c.CityName} (${c.state})`,
        }))
      );
    }

    // Seed or update Hotels with authentic SRDV city IDs
    const hotelCount = await Hotel.count();
    const existingHotel = await Hotel.findOne({ where: { cityid: "130443" } });
    if (hotelCount === 0 || !existingHotel) {
      await Hotel.destroy({ where: {} });
      await Hotel.bulkCreate(
        SRDV_HOTEL_CITIES.map((h) => ({
          Destination: h.Destination,
          cityid: h.cityid,
          country: "India",
          countrycode: "IN",
          stateprovince: h.stateprovince,
          status: "Active",
        }))
      );
    }

    // Seed Sightseeing Master
    const sightCount = await Sightseeing.count();
    if (sightCount === 0) {
      await Sightseeing.bulkCreate([
        {
          name: "Hadimba Devi Temple",
          cityName: "Manali",
          location: "Dhungri Forest, Manali",
          image: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23",
          duration: "1.5 - 2 Hours",
          category: "Heritage & Culture",
          masterDescription:
            "Built in 1553 CE by Maharaja Bahadur Singh, this historic 4-tiered pagoda wooden temple is dedicated to Hadimba Devi, wife of Bhima from Mahabharata. Surrounded by towering cedar and deodar trees, it features exquisite wood carvings and peaceful mountain vibes.",
        },
        {
          name: "Solang Valley Snow & Adventure Point",
          cityName: "Manali",
          location: "Solang Valley, 14km North of Manali",
          image: "https://images.unsplash.com/photo-1596895111956-bf1cf0599ce5",
          duration: "4 - 5 Hours",
          category: "Adventure & Nature",
          masterDescription:
            "A breathtaking side valley at the top of Kullu Valley offering snow sports, world-class paragliding, zorbing, ATV quad biking, and open ropeway cable car rides with panoramic views of snow-clad Himalayan peaks.",
        },
        {
          name: "Rohtang Pass Snow Crest Viewpoint",
          cityName: "Manali",
          location: "Leh-Manali Highway (Elev. 3,978m)",
          image: "https://images.unsplash.com/photo-1586348943529-beaae6c28db9",
          duration: "Full Day (6 - 8 Hours)",
          category: "High Altitude Scenic Pass",
          masterDescription:
            "The iconic gateway connecting Kullu Valley with the Lahaul and Spiti Valleys. Features dramatic glacier slopes, perpetual snow fields, breathtaking mountain panoramas, and thrilling alpine photography vistas.",
        },
        {
          name: "Jogini Waterfall Trek",
          cityName: "Manali",
          location: "Vashisht Village, Manali",
          image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa",
          duration: "3 Hours",
          category: "Nature Trek & Waterfalls",
          masterDescription:
            "A scenic pine-forest trek from Vashisht village leading to a cascading multi-tier waterfall with sacred shrines and natural mountain spring pools.",
        },
        {
          name: "Mall Road & Old Manali Heritage Walk",
          cityName: "Manali",
          location: "The Mall & Old Manali Village",
          image: "https://images.unsplash.com/photo-1578894381163-e72c17f2d45f",
          duration: "2 - 3 Hours",
          category: "Leisure & Shopping",
          masterDescription:
            "Stroll through the vibrant heart of town featuring authentic Kullu shawls, wooden handicrafts, Tibetan flea markets, riverside boho cafes, and authentic Himachali culinary treats.",
        },
        {
          name: "Amber Fort & Palace",
          cityName: "Jaipur",
          location: "Amer, Jaipur, Rajasthan",
          image: "https://images.unsplash.com/photo-1603288967756-3b7c2b3d3df7",
          duration: "3 Hours",
          category: "Royal Forts & Palaces",
          masterDescription:
            "Magnificent hilltop fort built with yellow and pink sandstone, featuring the world-famous Sheesh Mahal (Mirror Palace), Diwan-e-Aam, and scenic views overlooking Maota Lake.",
        },
        {
          name: "Hawa Mahal (Palace of Winds)",
          cityName: "Jaipur",
          location: "Badi Choupad, Pink City, Jaipur",
          image: "https://images.unsplash.com/photo-1599661046289-e31897846e41",
          duration: "1 - 2 Hours",
          category: "Architecture & Heritage",
          masterDescription:
            "Iconic five-story palace built in 1799 with 953 honeycomb windows (jharokhas) designed to allow royal women to observe street festivals without being seen from outside.",
        },
        {
          name: "Taj Mahal",
          cityName: "Agra",
          location: "Dharmapuri, Forest Colony, Tajganj, Agra, Uttar Pradesh",
          image: "https://images.unsplash.com/photo-1564507592333-c60657eea523",
          duration: "2 - 3 Hours",
          category: "World Wonder & Monument",
          masterDescription: "An immense mausoleum of white marble, built in Agra between 1631 and 1648 by order of the Mughal emperor Shah Jahan in memory of his favourite wife Mumtaz Mahal."
        },
        {
          name: "Agra Fort",
          cityName: "Agra",
          location: "Agra Fort, Rakabganj, Agra, Uttar Pradesh",
          image: "https://images.unsplash.com/photo-1592635196078-9fdc757f27f4",
          duration: "2 Hours",
          category: "Mughal Fort & Heritage",
          masterDescription: "A historical fort in the city of Agra in India. It was the main residence of the emperors of the Mughal Dynasty until 1638."
        },
        {
          name: "Banke Bihari Temple",
          cityName: "Vrindavan",
          location: "Godowalia, Vrindavan, Mathura, Uttar Pradesh",
          image: "https://images.unsplash.com/photo-1621600411688-4be93cd68504",
          duration: "1.5 Hours",
          category: "Divine Temple & Pilgrimage",
          masterDescription: "The most revered and celebrated Hindu temple dedicated to Lord Krishna in the holy town of Vrindavan."
        },
        {
          name: "Nidhivan",
          cityName: "Vrindavan",
          location: "Nidhivan Sacred Grove, Vrindavan, Mathura",
          image: "https://images.unsplash.com/photo-1518998053901-5348d3961a04",
          duration: "1 Hour",
          category: "Sacred Grove & Spirituality",
          masterDescription: "A mystic sacred forest adorned with intertwined Tulsi groves where Lord Krishna is believed to perform divine Raas Leela."
        },
        {
          name: "Prem Mandir",
          cityName: "Vrindavan",
          location: "Chatikara Road, Vrindavan, Mathura",
          image: "https://images.unsplash.com/photo-1609608647302-1f79c9e94112",
          duration: "1.5 - 2 Hours",
          category: "Spiritual Architectural Marvel",
          masterDescription: "Spectacular Italian white Carrara marble temple with breathtaking evening architectural light shows and musical fountains."
        },
        {
          name: "ISKCON Temple Vrindavan",
          cityName: "Vrindavan",
          location: "Bhaktivedanta Swami Marg, Raman Reiti, Vrindavan",
          image: "https://images.unsplash.com/photo-1609608647302-1f79c9e94112",
          duration: "1 - 2 Hours",
          category: "Krishna Balaram Temple",
          masterDescription: "Peaceful spiritual center featuring 24-hour kirtan, serene courtyards, and pure spiritual vibrations."
        },
        {
          name: "Jibhi Waterfall",
          cityName: "Jibhi",
          location: "Jibhi Pine Valley, Kullu, Himachal Pradesh",
          image: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2",
          duration: "2 Hours",
          category: "Nature & Waterfalls",
          masterDescription: "A pristine waterfall hidden inside dense pine forests with picturesque rustic wooden footbridges."
        },
        {
          name: "Chehni Kothi",
          cityName: "Jibhi",
          location: "Chehni Village, Tirthan Valley, Himachal Pradesh",
          image: "https://images.unsplash.com/photo-1519681393784-d120267933ba",
          duration: "3 Hours",
          category: "Ancient Fortress Tower",
          masterDescription: "An imposing 1500-year-old multi-story tower built in Kath-Kuni architectural style without any modern cement."
        },
        {
          name: "Manikaran Sahib",
          cityName: "Manikaran",
          location: "Parvati Valley, Kullu, Himachal Pradesh",
          image: "https://images.unsplash.com/photo-1609608647302-1f79c9e94112",
          duration: "2 Hours",
          category: "Pilgrimage & Natural Geysers",
          masterDescription: "Renowned historical Sikh Gurudwara famous for boiling hot natural mineral springs alongside freezing Parvati river."
        },
        {
          name: "Baga Beach",
          cityName: "Goa",
          location: "Calangute-Baga Road, North Goa",
          image: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2",
          duration: "3 - 4 Hours",
          category: "Beach & Watersports",
          masterDescription: "One of the most energetic beaches in Goa with water sports, beach shacks, lively sunset views, and nightlife."
        },
        {
          name: "Calangute Beach",
          cityName: "Goa",
          location: "Calangute, North Goa",
          image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e",
          duration: "2 - 3 Hours",
          category: "Golden Sand Beach",
          masterDescription: "Known as the Queen of Beaches in Goa, featuring expansive golden sands, parasailing, and local shopping."
        },
        {
          name: "Fort Aguada",
          cityName: "Goa",
          location: "Sinquerim, Candolim, Goa",
          image: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220",
          duration: "1.5 Hours",
          category: "Portuguese Coastal Fort",
          masterDescription: "Well-preserved 17th-century Portuguese fortress and historic lighthouse overlooking the Arabian Sea."
        }
      ]);
    }

    // Ensure all existing and newly seeded sightseeing records have slug, city, state, and descriptions
    try {
      const allSights = await Sightseeing.findAll();
      for (const s of allSights) {
        let changed = false;
        if (!s.city && s.cityName) {
          s.city = s.cityName;
          changed = true;
        }
        if (!s.cityName && s.city) {
          s.cityName = s.city;
          changed = true;
        }
        if (!s.slug) {
          const baseSlug = (s.name || 'sightseeing')
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)+/g, '');
          s.slug = `${baseSlug}-${s.id}`;
          changed = true;
        }
        if (!s.description && s.masterDescription) {
          s.description = s.masterDescription;
          changed = true;
        }
        if (!s.masterDescription && s.description) {
          s.masterDescription = s.description;
          changed = true;
        }
        if (!s.shortDescription && (s.description || s.masterDescription)) {
          s.shortDescription = (s.description || s.masterDescription).slice(0, 180) + '...';
          changed = true;
        }
        if (!s.country) {
          s.country = 'India';
          changed = true;
        }
        if (!s.status) {
          s.status = 'Active';
          changed = true;
        }
        if (changed) {
          await s.save();
        }
      }
    } catch (normErr) {
      console.warn('Sightseeing normalization notice:', normErr.message);
    }

    // Seed Initial Packages
    const packageCount = await Package.count();
    if (packageCount === 0) {
      await Package.bulkCreate([
        {
          packageName: "Magical Manali & Solang Valley Escape",
          coverLocation: ["Manali", "Solang Valley", "Rohtang Pass"],
          city: "Manali",
          state: "Himachal Pradesh",
          totalPrice: 24999,
          offerPrice: 21499,
          hotel: { category: "4 Star", roomType: "Deluxe Mountain View", mealPlan: "MAP (Breakfast + Dinner)" },
          foodType: ["Breakfast Included", "Dinner Included"],
          totalTransfer: 2,
          rating: "4.9",
          days: "5 Days / 4 Nights",
          tagType: "Trending",
          coverImage: "https://images.unsplash.com/photo-1596895111956-bf1cf0599ce5",
          description: "Escape to the snow-clad peaks of Manali, lush pine valleys, Hadimba Temple heritage, high-adrenaline Solang adventure sports, and scenic Rohtang Pass panoramas.",
          status: "Published",
        },
        {
          packageName: "Royal Rajasthan & Pink City Heritage",
          coverLocation: ["Jaipur", "Amer", "Nahargarh"],
          city: "Jaipur",
          state: "Rajasthan",
          totalPrice: 18999,
          offerPrice: 16299,
          hotel: { category: "4 Star Heritage", roomType: "Haveli Suite", mealPlan: "CP (Breakfast)" },
          foodType: ["Royal Rajasthani Breakfast"],
          totalTransfer: 2,
          rating: "4.8",
          days: "4 Days / 3 Nights",
          tagType: "Bestseller",
          coverImage: "https://images.unsplash.com/photo-1603288967756-3b7c2b3d3df7",
          description: "Immerse in royal Rajputana grandeur with Amber Fort, Hawa Mahal, City Palace, traditional Chokhi Dhani dinner, and shopping in historic bazaars.",
          status: "Published",
        },
      ]);
    }

    // Seed Blog Categories if empty
    const catCount = await BlogCategory.count();
    if (catCount === 0) {
      await BlogCategory.bulkCreate([
        { name: "Destinations", slug: "destinations", description: "Top destinations, offbeat escapes, and holiday itineraries across India.", icon: "MapPin", postCount: 4, status: "Active" },
        { name: "Travel Tips", slug: "travel-tips", description: "Budget travel hacks, packing lists, weather insights, and safety guides.", icon: "Compass", postCount: 3, status: "Active" },
        { name: "Food & Cuisine", slug: "food", description: "Local street food, authentic thalis, regional delicacies, and culinary tours.", icon: "Utensils", postCount: 2, status: "Active" },
        { name: "Spiritual Journey", slug: "spiritual", description: "Divine escapes, sacred temples, historic ghats, and spiritual retreats.", icon: "Sparkles", postCount: 2, status: "Active" },
        { name: "Adventure", slug: "adventure", description: "Trekking, river rafting, paragliding, and high-altitude road trips.", icon: "Mountain", postCount: 2, status: "Active" },
        { name: "Culture", slug: "culture", description: "Festivals, royal heritage, architecture, and folk traditions.", icon: "Landmark", postCount: 1, status: "Active" },
        { name: "Stay", slug: "stay", description: "Heritage havelis, luxury resorts, riverside camps, and boutique homestays.", icon: "Home", postCount: 1, status: "Active" },
        { name: "Guides", slug: "guides", description: "Comprehensive state-wise and city-wise travel planning blueprints.", icon: "BookOpen", postCount: 1, status: "Active" },
      ]);
    }

    // Seed Initial Dynamic Blogs matching reference designs
    const blogCount = await Blog.count();
    if (blogCount === 0) {
      await Blog.bulkCreate([
        // 1. Top 10 / Top 5 Blog: Himachal Hidden Places (Reference HTML 3)
        {
          title: "Top 10 Hidden Places in Himachal You Must Visit in 2026",
          slug: "top-10-hidden-places-in-himachal-you-must-visit-in-2026",
          blogType: "top_list",
          category: "Destinations",
          excerpt: "Discover untouched beauty in Himachal beyond the usual tourist spots. Perfect for nature lovers and peace seekers.",
          content: "Himachal Pradesh is widely celebrated for its majestic snow-clad peaks, tranquil alpine forests, and breathtaking valleys. While popular destinations like Shimla and Manali remain perennial favorites, a world of secluded magic awaits those willing to take the road less traveled. From secret waterfall pools in Jibhi to ancient Kath-Kuni fortresses in Tirthan, explore the hidden gems that define the true soul of the Himalayas.",
          coverImage: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?q=80&w=1200&auto=format&fit=crop",
          author: "Bharat Yatra Editorial",
          readTime: "8 min read",
          rating: "4.8",
          ratingCount: 128,
          publishDate: "12 Jun 2026",
          status: "Published",
          highlights: [
            "Best time to visit",
            "How to reach",
            "Hidden places list",
            "Travel tips",
            "Where to stay"
          ],
          quickInfo: [
            { label: "Best Time to Visit", value: "March to June" },
            { label: "Ideal Duration", value: "5 – 7 Days" },
            { label: "Trip Budget", value: "₹ 8,000 – ₹ 15,000" },
            { label: "Difficulty Level", value: "Easy to Moderate" }
          ],
          journeyRoute: [
            { name: "Delhi", type: "start", latitude: 28.6139, longitude: 77.2090, subtitle: "Start", icon: "MapPin", iconLibrary: "lucide", transportType: "Cab", cityCode: "DEL" },
            { name: "Shimla", type: "transit", latitude: 31.1048, longitude: 77.1734, subtitle: "343 km · 7h", distance: "343 km", icon: "Bus", iconLibrary: "lucide", transportType: "Bus", cityCode: "3" },
            { name: "Jibhi", type: "transit", latitude: 31.6033, longitude: 77.3486, subtitle: "148 km · 5h", distance: "148 km", icon: "Mountain", iconLibrary: "lucide", transportType: "Cab", cityCode: "JIB" },
            { name: "Tirthan Valley", type: "stop", latitude: 31.6429, longitude: 77.3524, subtitle: "18 km · 45m", distance: "18 km", icon: "Trees", iconLibrary: "lucide", transportType: "Cab", cityCode: "TRT" },
            { name: "Kasol", type: "transit", latitude: 32.0100, longitude: 77.3150, subtitle: "68 km · 2h 15m", distance: "68 km", icon: "Compass", iconLibrary: "lucide", transportType: "Bus", cityCode: "KSL" },
            { name: "Manikaran", type: "destination", latitude: 32.0267, longitude: 77.3508, subtitle: "4.5 km · 15m", distance: "4.5 km", icon: "Landmark", iconLibrary: "lucide", transportType: "Cab", cityCode: "MNK" }
          ],
          placesCovered: [
            { name: "Jibhi Waterfall", city: "Jibhi", location: "Jibhi Pine Valley, Kullu", image: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?q=80&w=300&auto=format&fit=crop", source: "sightseeing" },
            { name: "Chehni Kothi", city: "Jibhi", location: "Chehni Village, Tirthan Valley", image: "https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=300&auto=format&fit=crop", source: "sightseeing" },
            { name: "Tirthan Valley", city: "Kullu", location: "Tirthan Riverbanks", image: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?q=80&w=300&auto=format&fit=crop", source: "sightseeing" },
            { name: "Parvati Valley", city: "Kasol", location: "Parvati Valley Slopes", image: "https://images.unsplash.com/photo-1591017683607-b8b0f2f5ba1e?q=80&w=300&auto=format&fit=crop", source: "sightseeing" },
            { name: "Manikaran Sahib", city: "Manikaran", location: "Parvati River, Manikaran", image: "https://images.unsplash.com/photo-1609608647302-1f79c9e94112?q=80&w=300&auto=format&fit=crop", source: "sightseeing" }
          ],
          topItems: [
            { number: 1, title: "Jibhi Waterfall", description: "Nestled quietly inside a dense cedar forest, this multi-tier waterfall has wooden bridges and calm alpine streams.", image: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?q=80&w=600&auto=format&fit=crop" },
            { number: 2, title: "Chehni Kothi Fort", description: "An indigenous 1500-year-old architectural marvel built strictly of timber and stone, standing tall without cement.", image: "https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=600&auto=format&fit=crop" },
            { number: 3, title: "Tirthan Valley", description: "A tranquil paradise next to the Great Himalayan National Park, ideal for riverside camping and trout fishing.", image: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?q=80&w=600&auto=format&fit=crop" },
            { number: 4, title: "Parvati Valley", description: "Famed for its dramatic gorges, warm hot springs, and serene pine walking trails connecting remote hamlets.", image: "https://images.unsplash.com/photo-1591017683607-b8b0f2f5ba1e?q=80&w=600&auto=format&fit=crop" },
            { number: 5, title: "Manikaran Sahib", description: "Sacred hot natural thermal geysers adjacent to freezing glacial torrents, holding deep spiritual significance.", image: "https://images.unsplash.com/photo-1609608647302-1f79c9e94112?q=80&w=600&auto=format&fit=crop" }
          ],
          seo: {
            metaTitle: "Top 10 Hidden Places in Himachal You Must Visit in 2026",
            metaDescription: "Discover untouched valleys, secluded waterfalls, and authentic heritage in Himachal Pradesh.",
            metaKeywords: "Himachal, Jibhi, Tirthan Valley, Travel Guide, Hidden Places"
          }
        },

        // 2. Food Blog: Best Food in Gujarat (Reference HTML 1)
        {
          title: "Best Food in Gujarat: A Local's Guide",
          slug: "best-food-in-gujarat-a-locals-guide",
          blogType: "food",
          category: "Food & Cuisine",
          excerpt: "From sweet to spicy, from farsan to full meals, Gujarat offers a wide variety of dishes that will leave you craving for more.",
          content: "Gujarat is not just about its vibrant textiles and heritage monuments. It is also an absolute paradise for food connoisseurs. The state's culinary identity is a masterclass in balance — seamlessly intertwining sweet, tangy, and subtly spicy profiles into every meal. Whether you are savoring steaming soft dhokla at dawn in Ahmedabad or sharing an elaborate Kathiyawadi thali in Rajkot, Gujarat promises an unforgettable gastronomic expedition.",
          coverImage: "https://images.unsplash.com/photo-1626100731599-8c5f0f8e8c1a?q=80&w=1600&auto=format&fit=crop",
          author: "Bharat Yatra Editorial",
          readTime: "7 min read",
          rating: "4.6",
          ratingCount: 94,
          publishDate: "15 Jun 2026",
          status: "Published",
          quickInfo: [
            { label: "Best Time for Food Tour", value: "October to March" },
            { label: "Food Budget", value: "₹ 800 – ₹ 1,500 per day" },
            { label: "Veg / Non-Veg", value: "Mostly vegetarian" }
          ],
          foodDishes: [
            { name: "Dhokla", description: "Soft, spongy and healthy steamed snack tempered with mustard seeds and fresh coriander.", image: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?q=80&w=400&auto=format&fit=crop" },
            { name: "Thepla", description: "Fragrant spiced fenugreek flatbread packed with wholesome flavors, perfect for long travels.", image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?q=80&w=400&auto=format&fit=crop" },
            { name: "Undhiyu", description: "Winter special slow-cooked clay-pot mixed vegetable delicacy made with muthia and seasonal tubers.", image: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?q=80&w=400&auto=format&fit=crop" },
            { name: "Khandvi", description: "Delicate melt-in-mouth gram flour rolls seasoned with sesame, green chilies, and fresh grated coconut.", image: "https://images.unsplash.com/photo-1596797038530-2c107229654b?q=80&w=400&auto=format&fit=crop" },
            { name: "Fafda & Jalebi", description: "Crispy besan fafda with hot sweet spiral jalebis and spicy papaya sambharo — Sunday morning perfection.", image: "https://images.unsplash.com/photo-1631292784640-2b24be784d5d?q=80&w=400&auto=format&fit=crop" },
            { name: "Handvo", description: "A savory baked fermented lentil and rice cake crusted with toasted sesame seeds.", image: "https://images.unsplash.com/photo-1626132647523-66f8bda1e3d3?q=80&w=400&auto=format&fit=crop" }
          ],
          foodPlaces: [
            { name: "Agrapura", city: "Ahmedabad", description: "Famous for traditional unlimited Gujarati thali served with royal hospitality.", rating: "4.5", image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=300&auto=format&fit=crop" },
            { name: "Adalaj Ni Pole", city: "Ahmedabad", description: "Authentic heritage ambiance with recipes dating back over half a century.", rating: "4.4", image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=300&auto=format&fit=crop" },
            { name: "Gordhan Thal", city: "Rajkot", description: "Iconic regional feast offering twenty-plus varieties of fresh farsan and mains.", rating: "4.6", image: "https://images.unsplash.com/photo-1600335895229-6e75511892c8?q=80&w=300&auto=format&fit=crop" },
            { name: "Honest Restaurant", city: "Surat", description: "Simple, delicious, pocket friendly street-style pav bhaji and pulav staples.", rating: "4.3", image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?q=80&w=300&auto=format&fit=crop" }
          ],
          tips: [
            "Try local traditional thalis for the most authentic flavor immersion.",
            "Most traditional dining places are strictly vegetarian friendly.",
            "Don't miss night street food markets like Manek Chowk in Ahmedabad."
          ],
          tipsImage: "https://images.unsplash.com/photo-1601050690597-df0568f70950?q=80&w=600&auto=format&fit=crop",
          seo: {
            metaTitle: "Best Food in Gujarat: A Local's Guide",
            metaDescription: "Comprehensive foodie guide to must-try Gujarati dishes, farsan, and iconic restaurants.",
            metaKeywords: "Gujarat Food, Dhokla, Thepla, Undhiyu, Food Guide"
          }
        },

        // 3. Destination Blog: Vrindavan A Divine Escape (Reference HTML 2)
        {
          title: "Vrindavan – A Divine Escape",
          slug: "vrindavan-a-divine-escape",
          blogType: "destination",
          category: "Spiritual Journey",
          excerpt: "Spent 4 peaceful days in Vrindavan exploring temples, experiencing the divine vibes and living the spiritual side of life.",
          content: "Nestled along the banks of the sacred Yamuna river, Vrindavan is far more than a physical city — it is a living sanctuary of bhakti, timeless music, and divine energy. Walking along its ancient cobbled lanes where holy chants resonate from sunrise to evening aarti, visitors discover an overwhelming sense of inner stillness. From the vibrant courtyards of Banke Bihari to the luminous evening grandeur of Prem Mandir, every corner whispers an eternal love story.",
          coverImage: "https://images.unsplash.com/photo-1621600411688-4be93cd68504?q=80&w=1200&auto=format&fit=crop",
          author: "Bharat Yatra Editorial",
          readTime: "6 min read",
          rating: "4.8",
          ratingCount: 110,
          publishDate: "30 Jun 2026",
          status: "Published",
          journeyStats: {
            totalDistance: "163 km",
            totalTime: "3h 45m",
            travelMode: "🚗 By Car",
            tripDuration: "4 Days / 3 Nights"
          },
          journeyRoute: [
            { name: "Home (Delhi)", type: "start", latitude: 28.6139, longitude: 77.2090, time: "08:00 AM", distance: "Start", icon: "MapPin", iconLibrary: "lucide", transportType: "Cab", cityCode: "DEL" },
            { name: "Mathura", type: "transit", latitude: 27.4924, longitude: 77.6737, time: "11:45 AM", distance: "146.9 km", icon: "Bus", iconLibrary: "lucide", transportType: "Cab", cityCode: "MTH" },
            { name: "Vrindavan", type: "transit", latitude: 27.5807, longitude: 77.7006, time: "01:00 PM", distance: "11.6 km", icon: "Landmark", iconLibrary: "lucide", transportType: "Cab", cityCode: "VRN" },
            { name: "Nidhivan", type: "stop", latitude: 27.5815, longitude: 77.7020, time: "03:30 PM", distance: "1.2 km", icon: "Trees", iconLibrary: "lucide", transportType: "Cab", cityCode: "NID" },
            { name: "Banke Bihari Temple", type: "destination", latitude: 27.5809, longitude: 77.7003, time: "05:00 PM", distance: "0.8 km", icon: "Landmark", iconLibrary: "lucide", transportType: "Cab", cityCode: "BBH" }
          ],
          placesExplored: [
            { number: 1, name: "Banke Bihari Temple", rating: "4.8", description: "The most famous and revered temple of Vrindavan, where curtains open and close continuously.", timing: "05:00 PM – 06:30 PM", image: "https://images.unsplash.com/photo-1621600411688-4be93cd68504?q=80&w=300&auto=format&fit=crop", city: "Vrindavan", state: "Uttar Pradesh", source: "sightseeing" },
            { number: 2, name: "Nidhivan", rating: "4.7", description: "A mystical and sacred grove of intertwined tulsi trees enveloped in deep spiritual tranquility.", timing: "03:30 PM – 04:30 PM", image: "https://images.unsplash.com/photo-1518998053901-5348d3961a04?q=80&w=300&auto=format&fit=crop", city: "Vrindavan", state: "Uttar Pradesh", source: "sightseeing" },
            { number: 3, name: "ISKCON Temple", rating: "4.9", description: "Peaceful and pristine Krishna Balaram temple renowned for continuous holy chanting.", timing: "07:00 PM – 08:00 PM", image: "https://images.unsplash.com/photo-1609608647302-1f79c9e94112?q=80&w=300&auto=format&fit=crop", city: "Vrindavan", state: "Uttar Pradesh", source: "sightseeing" },
            { number: 4, name: "Prem Mandir", rating: "4.9", description: "Stunning evening lights, intricate marble reliefs, and synchronized musical fountain displays.", timing: "08:15 PM – 09:00 PM", image: "https://images.unsplash.com/photo-1609608647302-1f79c9e94112?q=80&w=301&auto=format&fit=crop", city: "Vrindavan", state: "Uttar Pradesh", source: "sightseeing" }
          ],
          experience: {
            quote: "Vrindavan is not just a place, it's a feeling. The peace, the people, the positive energy – everything feels magical here.",
            photos: [
              "https://images.unsplash.com/photo-1601921804830-fd0c6da7c0f5?q=80&w=300&auto=format&fit=crop",
              "https://images.unsplash.com/photo-1621600411688-4be93cd68504?q=80&w=300&auto=format&fit=crop",
              "https://images.unsplash.com/photo-1609608647302-1f79c9e94112?q=80&w=300&auto=format&fit=crop"
            ]
          },
          tripSnapshot: {
            days: "4",
            places: "9",
            distance: "163 km",
            spend: "₹ 3,250"
          },
          tips: [
            "Best time to visit is October to March for pleasant temperatures.",
            "Wear modest comfortable clothing and keep footwear safely before entering ghats.",
            "Try fresh Mathura ke peda and don't miss the evening Yamuna aarti."
          ],
          seo: {
            metaTitle: "Vrindavan – A Divine Escape Travelogue",
            metaDescription: "4-day spiritual itinerary to Vrindavan and Mathura: Banke Bihari, Prem Mandir, Nidhivan.",
            metaKeywords: "Vrindavan, Mathura, Spiritual Travel, Banke Bihari, Prem Mandir"
          }
        },

        // 4. Top 10 Places to Visit in Goa
        {
          title: "Top 10 Places to Visit in Goa",
          slug: "top-10-places-to-visit-in-goa",
          blogType: "top_list",
          category: "Destinations",
          excerpt: "From sunny golden beaches to Portuguese forts and vibrant night markets, discover Goa's prime hotspots.",
          content: "Goa has a magnetic charm that caters to every kind of traveler. Whether you want to lounge on the bustling shores of Baga and Calangute, soak in panoramic Arabian Sea views from Fort Aguada, or seek serenity in historic churches, here are the top must-visit locations.",
          coverImage: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?q=80&w=800&auto=format&fit=crop",
          author: "Bharat Yatra Editorial",
          readTime: "6 min read",
          rating: "4.7",
          ratingCount: 88,
          publishDate: "10 Jun 2026",
          status: "Published",
          highlights: ["Top beaches", "Heritage forts", "Water adventures", "Sunset viewpoints"],
          quickInfo: [
            { label: "Best Time to Visit", value: "November to February" },
            { label: "Ideal Duration", value: "4 – 6 Days" },
            { label: "Trip Budget", value: "₹ 12,000 – ₹ 25,000" },
            { label: "Vibe", value: "Relaxing & Coastal" }
          ],
          topItems: [
            { number: 1, title: "Baga Beach", description: "High-energy beach with water sports, beach shacks, and vibrant sunset cafes.", image: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?q=80&w=500&auto=format&fit=crop" },
            { number: 2, title: "Fort Aguada", description: "17th-century Portuguese fortress overlooking the vast Arabian Sea with a classic lighthouse.", image: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?q=80&w=500&auto=format&fit=crop" },
            { number: 3, title: "Calangute Beach", description: "The famous Queen of Beaches with sprawling golden sands and water activities.", image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=500&auto=format&fit=crop" }
          ],
          placesCovered: [
            { name: "Baga Beach", city: "Goa", location: "Calangute-Baga Road", image: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2", source: "sightseeing" },
            { name: "Calangute Beach", city: "Goa", location: "Calangute", image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e", source: "sightseeing" },
            { name: "Fort Aguada", city: "Goa", location: "Candolim", image: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220", source: "sightseeing" }
          ]
        },

        // 5. How to Plan Budget Trip to Himachal
        {
          title: "How to Plan Budget Trip to Himachal",
          slug: "how-to-plan-budget-trip-to-himachal",
          blogType: "top_list",
          category: "Travel Tips",
          excerpt: "Save more while exploring the beauty of Himachal with these practical tips and budget travel strategies.",
          content: "Traveling in the Himalayas doesn't have to break the bank. By choosing HRTC government buses, staying in family homestays in villages like Jibhi, and savoring local dhabas, you can enjoy a 6-day Himachal holiday under ₹10,000.",
          coverImage: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?q=80&w=800&auto=format&fit=crop",
          author: "Bharat Yatra Editorial",
          readTime: "7 min read",
          rating: "4.9",
          ratingCount: 75,
          publishDate: "09 Jun 2026",
          status: "Published",
          highlights: ["Budget transport", "Affordable homestays", "Local dining hacks", "Permits guide"],
          topItems: [
            { number: 1, title: "Opt for State HRTC Buses", description: "Night Volvo and ordinary buses provide reliable scenic mountain transit at a fraction of cab costs.", image: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=500&auto=format&fit=crop" },
            { number: 2, title: "Stay in Community Homestays", description: "Homestays in Tirthan and Jibhi offer warm hospitality, homemade siddu, and economical nightly rates.", image: "https://images.unsplash.com/photo-1586348943529-beaae6c28db9?q=80&w=500&auto=format&fit=crop" }
          ]
        },

        // 6. Best Adventure Activities in Rishikesh
        {
          title: "Best Adventure Activities in Rishikesh",
          slug: "best-adventure-activities-in-rishikesh",
          blogType: "destination",
          category: "Adventure",
          excerpt: "From river rafting on the Ganges to high-adrenaline bungee jumping, enjoy the thrill of Rishikesh.",
          content: "Rishikesh is India's undisputed adventure capital. Here, holy temple bells mingle with the cheers of rafters plunging down the Grade IV rapids of the Ganges.",
          coverImage: "https://images.unsplash.com/photo-1591017683607-b8b0f2f5ba1e?q=80&w=800&auto=format&fit=crop",
          author: "Bharat Yatra Editorial",
          readTime: "5 min read",
          rating: "4.8",
          ratingCount: 104,
          publishDate: "08 Jun 2026",
          status: "Published",
          journeyStats: { totalDistance: "240 km", totalTime: "5h 15m", travelMode: "🚗 By Road", tripDuration: "3 Days / 2 Nights" },
          placesExplored: [
            { number: 1, name: "Shivpuri Rafting Point", rating: "4.9", description: "Exciting 16 km white water rafting stretch through Roller Coaster and Golf Course rapids.", timing: "09:00 AM – 01:00 PM", image: "https://images.unsplash.com/photo-1591017683607-b8b0f2f5ba1e?q=80&w=400&auto=format&fit=crop" },
            { number: 2, name: "Mohan Chatti Bungee", rating: "4.9", description: "India's highest fixed cantilever bungee jumping platform at 83 meters.", timing: "02:00 PM – 04:00 PM", image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=400&auto=format&fit=crop" }
          ]
        }
      ]);
    }
  } catch (err) {
    console.error("Database initialization warning:", err.message);
  }
}
