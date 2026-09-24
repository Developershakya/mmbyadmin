import { DataTypes } from 'sequelize';
import sequelize from '../config/sequelize.js';

const BlogCategory = sequelize.define(
  'BlogCategory',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true
    },
    slug: {
      type: DataTypes.STRING(120),
      allowNull: false,
      unique: true
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    icon: {
      type: DataTypes.STRING(50),
      defaultValue: 'Compass'
    },
    postCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    status: {
      type: DataTypes.STRING(20),
      defaultValue: 'Active'
    }
  },
  {
    tableName: 'blog_categories',
    timestamps: true
  }
);

export default BlogCategory;
