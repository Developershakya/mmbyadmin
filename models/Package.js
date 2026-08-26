import { DataTypes } from "sequelize";
import sequelize from "../config/sequelize";

const Package = sequelize.define("Package", {
  packageName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  coverLocation: {
    type: DataTypes.ARRAY,
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
    type: DataTypes.NUMBER,
    allowNull: false,
  },
  offerPrice: {
    type: DataTypes.NUMBER,
    allowNull: false,
  },
  hotel: {
    type: DataTypes.ARRAY,
    allowNull: true,
  },
  foodType: {
    type: DataTypes.ARRAY,
    allowNull: true,
  },
  totalTransfer: {
    type: DataTypes.NUMBER,
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