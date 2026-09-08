import { DataTypes } from "sequelize";
import sequelize from "../config/sequelize.js";

const Bus = sequelize.define("Bus", {
    id: {
      autoIncrement: true,
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      primaryKey: true
    },
    CityId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: "bus_cityid_unique"
    },
    CityName: {
      type: DataTypes.STRING(255),
      allowNull: false
    }
  }, {
    tableName: 'bus',
    timestamps: true,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id" },
        ]
      },
      {
        name: "bus_cityid_unique",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "CityId" },
        ]
      },
    ]
  });

export default Bus;
