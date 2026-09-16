import { DataTypes } from "sequelize";
import sequelize from "../config/sequelize.js";

const Package = sequelize.define(
  "Package",
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    packageName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    coverLocation: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [],
    },
    city: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    state: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    totalPrice: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    offerPrice: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    hotel: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    foodType: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    totalTransfer: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    rating: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "4.8",
    },
    days: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "5 Days / 4 Nights",
    },
    tagType: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "Trending",
    },
    coverImage: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "https://images.unsplash.com/photo-1506744038136-46273834b3fb",
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "Draft",
    },
    destination: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    originCity: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "Delhi",
    },
    startDate: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    endDate: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    nights: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 3,
    },
    travelers: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: { adults: 2, children: 0, infants: 0 },
    },
    customerInfo: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    pricingBreakdown: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    pricingRules: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    itineraryData: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    dayWiseItinerary: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
    },
    destinationWiseItinerary: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
    },
    hotelsList: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
    },
    flightsList: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
    },
    cabsList: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
    },
    busesList: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
    },
    mealsList: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
    },
    activitiesList: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
    },
    sightseeingList: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
    },
    inclusions: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
    },
    exclusions: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
    },
    termsAndConditions: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
    },
    cancellationPolicy: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    dateChangePolicy: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    otherPolicies: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
    },
    customization: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    tags: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
    },
    galleryImages: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
    },
  },
  {
    tableName: "packages",
    timestamps: true,
  }
);

export default Package;
