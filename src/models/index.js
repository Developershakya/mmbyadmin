import sequelize from "../config/sequelize.js";
import Hotel from "./Hotel.js";
import Package from "./Package.js";
import AirportList from "./AirportList.js";
import Bus from "./Bus.js";
import Cities from "./Cities.js";
import User from "./User.js";
import Sightseeing from "./Sightseeing.js";

export {
  sequelize,
  Hotel,
  Package,
  AirportList,
  Bus,
  Cities,
  User,
  Sightseeing,
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

    // Seed Bus Cities
    const busCount = await Bus.count();
    if (busCount === 0) {
      await Bus.bulkCreate([
        { CityId: 1, CityName: "Delhi (ISBT Kashmiri Gate / Majnu Ka Tila)" },
        { CityId: 2, CityName: "Manali (Private Bus Stand / Mall Road)" },
        { CityId: 3, CityName: "Shimla (ISBT Tutikandi)" },
        { CityId: 4, CityName: "Chandigarh (Sector 43 ISBT)" },
        { CityId: 5, CityName: "Jaipur (Sindhi Camp)" },
        { CityId: 6, CityName: "Amritsar (ISBT Railway Link)" },
        { CityId: 7, CityName: "Dharamshala (McLeodGanj)" },
        { CityId: 8, CityName: "Haridwar / Rishikesh" },
      ]);
    }

    // Seed Hotels
    const hotelCount = await Hotel.count();
    if (hotelCount === 0) {
      await Hotel.bulkCreate([
        {
          Destination: "Manali",
          cityid: "725862",
          country: "India",
          countrycode: "IN",
          stateprovince: "Himachal Pradesh",
          status: "Active",
        },
        {
          Destination: "Shimla",
          cityid: "725863",
          country: "India",
          countrycode: "IN",
          stateprovince: "Himachal Pradesh",
          status: "Active",
        },
        {
          Destination: "Delhi",
          cityid: "725864",
          country: "India",
          countrycode: "IN",
          stateprovince: "Delhi",
          status: "Active",
        },
        {
          Destination: "Jaipur",
          cityid: "725865",
          country: "India",
          countrycode: "IN",
          stateprovince: "Rajasthan",
          status: "Active",
        },
        {
          Destination: "Goa",
          cityid: "725866",
          country: "India",
          countrycode: "IN",
          stateprovince: "Goa",
          status: "Active",
        },
      ]);
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
      ]);
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
  } catch (err) {
    console.error("Database initialization warning:", err.message);
  }
}
