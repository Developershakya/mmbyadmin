import { DataTypes } from "sequelize";
import sequelize from "../config/sequelize.js";

const Booking = sequelize.define("Booking", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  booking_ref: { type: DataTypes.STRING, allowNull: false },
  trip_type: { type: DataTypes.STRING, allowNull: true },
  contact_name: { type: DataTypes.STRING, allowNull: false },
  contact_email: { type: DataTypes.STRING, allowNull: false },
  contact_phone: { type: DataTypes.STRING, allowNull: false },
  total_price: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
  status: { type: DataTypes.STRING, allowNull: false },
}, { tableName: "bookings", timestamps: false });

export default Booking;