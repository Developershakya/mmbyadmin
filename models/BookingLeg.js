import { DataTypes } from "sequelize";
import sequelize from "../config/sequelize.js";

const BookingLeg = sequelize.define("BookingLeg", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  booking_id: { type: DataTypes.INTEGER, allowNull: false },
  leg_index: { type: DataTypes.INTEGER, allowNull: false },
  trace_id: { type: DataTypes.STRING, allowNull: false },
  result_index: { type: DataTypes.STRING, allowNull: false },
  pnr: { type: DataTypes.STRING, allowNull: true },
  airline_name: { type: DataTypes.STRING, allowNull: true },
  flight_number: { type: DataTypes.STRING, allowNull: true },
  origin_code: { type: DataTypes.STRING, allowNull: true },
  destination_code: { type: DataTypes.STRING, allowNull: true },
  price: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
}, { tableName: "booking_legs", timestamps: false });

export default BookingLeg;