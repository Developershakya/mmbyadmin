import { DataTypes } from "sequelize";
import sequelize from "../config/sequelize.js";

const AirportList = sequelize.define(
  "AirportList",
  {
    airport_id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
    },
    airport_entry_date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    airport_update_date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    airport_code: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    airport_name: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    airport_city_code: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    airport_city_name: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    airport_country_name: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    airport_country_code: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    airport_timezone: {
      type: DataTypes.STRING(8),
      allowNull: false,
      defaultValue: "+05:30",
    },
    airport_lat: {
      type: DataTypes.STRING(32),
      allowNull: false,
      defaultValue: "0",
    },
    airport_lon: {
      type: DataTypes.STRING(32),
      allowNull: false,
      defaultValue: "0",
    },
    airport_num_airports: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    airport_city: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    airport_added_by_dsa_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
  },
  {
    tableName: "airport_list",
    timestamps: false,
  }
);

export default AirportList;
