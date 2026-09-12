import { DataTypes } from "sequelize";
import sequelize from "../config/sequelize.js";

const Hotel = sequelize.define(
  "Hotel",
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },

    tjhoccd_entry_date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },

    tjhoccd_update_date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },

    Destination: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },

    cityid: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },

    country: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },

    status: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: "Active",
    },

    countrycode: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },

    stateprovince: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
  },
  {
    tableName: "hotel",
    timestamps: false,
  }
);

export default Hotel;
