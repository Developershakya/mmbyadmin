import { DataTypes } from "sequelize";
import sequelize from "../config/sequelize.js";

const Sightseeing = sequelize.define(
  "Sightseeing",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    cityName: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    location: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    image: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },
    masterDescription: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    duration: {
      type: DataTypes.STRING(50),
      allowNull: true,
      defaultValue: "2 - 3 Hours",
    },
    category: {
      type: DataTypes.STRING(50),
      allowNull: true,
      defaultValue: "Monument & Heritage",
    },
    status: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: "Active",
    },
  },
  {
    tableName: "sightseeing_master",
    timestamps: true,
  }
);

export default Sightseeing;
