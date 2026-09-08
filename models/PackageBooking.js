import { DataTypes } from "sequelize";
import sequelize from "../config/sequelize.js";

const PackageBooking = sequelize.define("PackageBooking", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false },
  phone: { type: DataTypes.STRING, allowNull: false },
  alt_phone: { type: DataTypes.STRING, allowNull: true },
  address: { type: DataTypes.TEXT, allowNull: false },
  city: { type: DataTypes.STRING, allowNull: false },
  pincode: { type: DataTypes.STRING, allowNull: false },
  travel_date: { type: DataTypes.DATE, allowNull: false },
  package_name: { type: DataTypes.STRING, allowNull: false },
  offer_price: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
  razorpay_payment_id: { type: DataTypes.STRING, allowNull: true },
}, { tableName: "package_book", timestamps: false });

export default PackageBooking;