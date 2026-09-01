import sequelize from "../config/sequelize.js";

import User from "./User.js";
import Package from "./Package.js";
// import Booking from "../models/Booking.js";
// import Itinerary from "../models/Itinerary.js";
// import PackagePhoto from "../models/PackagePhoto.js";

async function syncDB() {
  try {
    await sequelize.authenticate();

    console.log("✅ Connection has been established successfully.");

    // Disable foreign key checks
    await sequelize.query("SET FOREIGN_KEY_CHECKS = 0");

    // Drop and recreate all tables
    await sequelize.sync({ force: true });

    // Enable foreign key checks
    await sequelize.query("SET FOREIGN_KEY_CHECKS = 1");

    console.log("✅ All tables synced successfully.");

    await sequelize.close();

    process.exit(0);
  } catch (error) {
    // Make sure FK checks are enabled even if something fails
    try {
      await sequelize.query("SET FOREIGN_KEY_CHECKS = 1");
    } catch {}

    console.error("❌ Unable to sync database:");
    console.error(error);

    process.exit(1);
  }
}

syncDB();