import { DataTypes } from "sequelize";
import sequelize from "../config/sequelize.js";

const BookingPassenger = sequelize.define("BookingPassenger", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  booking_id: { type: DataTypes.INTEGER, allowNull: false },
  passenger_type: { type: DataTypes.STRING, allowNull: false },
  title: { type: DataTypes.STRING, allowNull: true },
  first_name: { type: DataTypes.STRING, allowNull: false },
  last_name: { type: DataTypes.STRING, allowNull: true },
  gender: { type: DataTypes.STRING, allowNull: true },
  dob: { type: DataTypes.DATEONLY, allowNull: true },
  contact_number: { type: DataTypes.STRING, allowNull: true },
  email: { type: DataTypes.STRING, allowNull: true },
  passport_number: { type: DataTypes.STRING, allowNull: true },
  passport_issue_date: { type: DataTypes.DATEONLY, allowNull: true },
  passport_expiry: { type: DataTypes.DATEONLY, allowNull: true },
}, { tableName: "booking_passengers", timestamps: false });

export default BookingPassenger;