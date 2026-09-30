
import sequelize from "../config/sequelize.js";
import User from "./User.js";
// import BusBooking from "./BusBooking.js";
// import CarBooking from "./CarBooking.js";
// import FlightBooking from "./FlightBooking.js";
// import HotelBooking from "./HotelBooking.js";
// import PackageBooking from "./PackageBooking.js";
// import Blog from "./Blog.js";
// import BlogCategory from "./BlogCategory.js";
// import Booking from "./Booking.js";
// import BookingLeg from "./BookingLeg.js";
// import BookingPassenger from "./BookingPassenger.js";
// import BusBookingPassenger from "./BusBookingPassenger.js";
// import BusBooking from "./BusBooking.js";
// import CarOnCityList from "./CarOnCityList.js";
// import Itinerary from "./Itinerary.js";
// import PackageBooking from "./PackageBooking.js";
// import PackagePhoto from "./PackagePhoto.js";
// import Sightseeing from "./Sightseeing.js";


async function syncDB() {
  try {
    await sequelize.authenticate();

    console.log("✅ Connection has been established successfully.");

    await sequelize.sync({
      alter: true,
      force: false,
    });

    console.log("✅ Existing tables were not modified.");

    await sequelize.close();
    console.log("✅ Database connection closed.");
  } catch (error) {
    console.error("❌ Unable to sync database:", error);

    await sequelize.close();
    process.exit(1);
  }
}

syncDB();

