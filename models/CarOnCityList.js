import { DataTypes } from "sequelize";
import sequelize from "../config/sequelize.js";

const CarOnCityList = sequelize.define("CarOnCityList", {
  caoncitlst_mti_code: { type: DataTypes.STRING(100), primaryKey: true },
  caoncitlst_city_name: { type: DataTypes.STRING(200), allowNull: false },
  caoncitlst_state: { type: DataTypes.STRING(200), allowNull: false },
  caoncitlst_status: { type: DataTypes.STRING(20), allowNull: false },
}, { tableName: "car_on_city_list", timestamps: false });

export default CarOnCityList;