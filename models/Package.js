import { DataTypes } from "sequelize";
import sequelize from "../config/sequelize.js";

const Package = sequelize.define("Package", {
  packageName: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  coverLocation: {
    type: DataTypes.JSON,
    allowNull: false,
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
  },

  offerPrice: {
    type: DataTypes.INTEGER,
    allowNull: false,
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
  },

  rating: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  days: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  tagType: {
    type: DataTypes.STRING,
    allowNull: true,
  },

  coverImage: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

export default Package;