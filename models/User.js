import { DataTypes } from "sequelize";
import sequelize from "../config/sequelize.js";
import bcrypt from "bcryptjs";

const User = sequelize.define("User", {
  
name: {
  type: DataTypes.STRING,
  allowNull: false,
},
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  phone: {
    type: DataTypes.STRING(32),
    allowNull: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

User.beforeCreate(async (user) => {
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);
});

export default User;
