import { DataTypes } from "sequelize";
import sequelize from "../config/sequelize.js";

const BusBookingPassenger = sequelize.define("BusBookingPassenger", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  booking_id: { type: DataTypes.INTEGER, allowNull: false },
  first_name: { type: DataTypes.STRING, allowNull: false },
  last_name: { type: DataTypes.STRING, allowNull: true },
  gender: { type: DataTypes.STRING, allowNull: true },
  age: { type: DataTypes.INTEGER, allowNull: true },
  seat_name: { type: DataTypes.STRING, allowNull: true },
}, { tableName: "bus_booking_passengers", timestamps: false });

export default BusBookingPassenger;