import { DataTypes } from "sequelize";
import sequelize from "../config/sequelize.js";

const Itinerary = sequelize.define("Itinerary", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  package_id: { type: DataTypes.INTEGER, allowNull: false },
  day_number: { type: DataTypes.INTEGER, allowNull: false },
  title: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: true },
  image: { type: DataTypes.STRING, allowNull: true },
}, { tableName: "itineraries", timestamps: false });

export default Itinerary;