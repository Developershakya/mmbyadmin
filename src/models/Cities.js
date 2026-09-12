import { DataTypes } from "sequelize";
import sequelize from "../config/sequelize.js";

const Cities = sequelize.define(
  "Cities",
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    state_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    city_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
  },
  {
    tableName: "cities",
    timestamps: true,
  }
);

export default Cities;
