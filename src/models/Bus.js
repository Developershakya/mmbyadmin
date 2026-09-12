import { DataTypes } from "sequelize";
import sequelize from "../config/sequelize.js";

const Bus = sequelize.define(
  "Bus",
  {
    id: {
      autoIncrement: true,
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      primaryKey: true,
    },
    CityId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    CityName: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
  },
  {
    tableName: "bus",
    timestamps: true,
  }
);

export default Bus;
