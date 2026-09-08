import { DataTypes } from "sequelize";
import sequelize from "../config/sequelize.js";

const BusBooking = sequelize.define("BusBooking", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  booking_ref: { type: DataTypes.STRING, allowNull: false },
  operator_name: { type: DataTypes.STRING, allowNull: true },
  bus_type: { type: DataTypes.STRING, allowNull: true },
  pnr: { type: DataTypes.STRING, allowNull: true },
  trace_id: { type: DataTypes.STRING, allowNull: false },
  result_index: { type: DataTypes.STRING, allowNull: false },
  boarding_point: { type: DataTypes.STRING, allowNull: true },
  dropping_point: { type: DataTypes.STRING, allowNull: true },
  contact_name: { type: DataTypes.STRING, allowNull: false },
  contact_email: { type: DataTypes.STRING, allowNull: false },
  contact_phone: { type: DataTypes.STRING, allowNull: false },
  total_price: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
  status: { type: DataTypes.STRING, allowNull: false },
}, { tableName: "bus_bookings", timestamps: false });

export default BusBooking;