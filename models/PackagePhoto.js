import { DataTypes } from "sequelize";
import sequelize from "../config/sequelize.js";

const PackagePhoto = sequelize.define("PackagePhoto", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  package_id: { type: DataTypes.INTEGER, allowNull: false },
  photo: { type: DataTypes.STRING, allowNull: false },
}, { tableName: "package_photos", timestamps: false });

export default PackagePhoto;