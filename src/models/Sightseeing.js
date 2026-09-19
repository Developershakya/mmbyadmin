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
    slug: {
      type: DataTypes.STRING(250),
      allowNull: true,
    },
    cityName: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    city: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    state: {
      type: DataTypes.STRING(100),
      allowNull: true,
      defaultValue: "",
    },
    country: {
      type: DataTypes.STRING(100),
      allowNull: true,
      defaultValue: "India",
    },
    location: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: "",
    },
    latitude: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    longitude: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    image: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?w=800&auto=format&fit=crop&q=80",
    },
    gallery: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
    },
    shortDescription: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    masterDescription: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    duration: {
      type: DataTypes.STRING(50),
      allowNull: true,
      defaultValue: "2 - 3 Hours",
    },
    bestTimeToVisit: {
      type: DataTypes.STRING(100),
      allowNull: true,
      defaultValue: "October to March",
    },
    entryFee: {
      type: DataTypes.STRING(100),
      allowNull: true,
      defaultValue: "Free Entry",
    },
    openingTime: {
      type: DataTypes.STRING(50),
      allowNull: true,
      defaultValue: "09:00 AM",
    },
    closingTime: {
      type: DataTypes.STRING(50),
      allowNull: true,
      defaultValue: "06:00 PM",
    },
    category: {
      type: DataTypes.STRING(100),
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
