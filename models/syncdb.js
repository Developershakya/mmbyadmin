import sequelize from "../config/sequelize.js";
import User from "./User.js";
import Package from "./Package.js";

async function syncDB() {
  try {
    await sequelize.authenticate();

    console.log("✅ Connection has been established successfully.");

    await sequelize.query("SET FOREIGN_KEY_CHECKS = 0");

    await sequelize.sync({ force: true });

    await sequelize.query("SET FOREIGN_KEY_CHECKS = 1");

    console.log("✅ All tables synced successfully.");

    await sequelize.close();
  } catch (error) {
    console.error("❌ Unable to sync database:", error);

    try {
      await sequelize.query("SET FOREIGN_KEY_CHECKS = 1");
    } catch {}

    process.exit(1);
  }
}

syncDB();