import sequelize from "../config/sequelize.js";

async function syncDB() {
  try {
    await sequelize.authenticate();

    console.log("✅ Connection has been established successfully.");
    
    console.log("✅ Existing tables were not modified.");
    
    await sequelize.close();
  } catch (error) {
    console.error("❌ Unable to sync database:", error);

    process.exit(1);
  }
}

syncDB();