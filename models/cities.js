import { DataTypes } from "sequelize";
import sequelize from "../config/sequelize.js";

const Cities = sequelize.define("Cities", {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    state_id: {
      type: DataTypes.TINYINT,
      allowNull: false
    },
    city_name: {
      type: DataTypes.STRING(100),
      allowNull: false
    }
  }, {
    tableName: 'cities',
    timestamps: true
  });

export default Cities;
