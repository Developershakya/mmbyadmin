import { DataTypes } from "sequelize";
import sequelize from "../config/sequelize.js";

const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "Admin User",
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "admin@makemybharatyatra.com",
    },
    role: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "admin",
    },
  },
  {
    tableName: "users",
    timestamps: true,
  }
);

export default User;
