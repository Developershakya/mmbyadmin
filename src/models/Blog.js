import { DataTypes } from 'sequelize';
import sequelize from '../config/sequelize.js';

const Blog = sequelize.define(
  'Blog',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    title: {
      type: DataTypes.STRING(300),
      allowNull: false
    },
    slug: {
      type: DataTypes.STRING(300),
      allowNull: false,
      unique: true
    },
    blogType: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: 'top_list' // 'top_list' | 'food' | 'destination'
    },
    category: {
      type: DataTypes.STRING(100),
      allowNull: false,
      defaultValue: 'Destinations'
    },
    categoryId: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    excerpt: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    coverImage: {
      type: DataTypes.STRING(1000),
      allowNull: false
    },
    author: {
      type: DataTypes.STRING(100),
      defaultValue: 'Bharat Yatra Editorial'
    },
    readTime: {
      type: DataTypes.STRING(50),
      defaultValue: '6 min read'
    },
    rating: {
      type: DataTypes.STRING(10),
      defaultValue: '4.8'
    },
    ratingCount: {
      type: DataTypes.INTEGER,
      defaultValue: 98
    },
    publishDate: {
      type: DataTypes.STRING(50),
      defaultValue: '15 Jun 2026'
    },
    status: {
      type: DataTypes.STRING(20),
      defaultValue: 'Published' // 'Published' | 'Draft'
    },
    // Top 10 / Top 5 dynamic items
    topItems: {
      type: DataTypes.JSON,
      defaultValue: []
    },
    // Highlights checklist
    highlights: {
      type: DataTypes.JSON,
      defaultValue: []
    },
    // Quick info key-value list
    quickInfo: {
      type: DataTypes.JSON,
      defaultValue: []
    },
    // Places I Explored (rich sightseeing objects)
    placesExplored: {
      type: DataTypes.JSON,
      defaultValue: []
    },
    // Places Covered (rich sightseeing objects)
    placesCovered: {
      type: DataTypes.JSON,
      defaultValue: []
    },
    // My Journey Route (step items with origin, stops, destination, distance, transport)
    journeyRoute: {
      type: DataTypes.JSON,
      defaultValue: []
    },
    // Journey Stats summary (Distance, Time, Travel Mode, Duration)
    journeyStats: {
      type: DataTypes.JSON,
      defaultValue: {}
    },
    // Food Blog: Must try dishes
    foodDishes: {
      type: DataTypes.JSON,
      defaultValue: []
    },
    // Food Blog: Best places to eat
    foodPlaces: {
      type: DataTypes.JSON,
      defaultValue: []
    },
    // Food / Travel Tips
    tips: {
      type: DataTypes.JSON,
      defaultValue: []
    },
    tipsImage: {
      type: DataTypes.STRING(1000),
      allowNull: true
    },
    // Traveler Experience quote & photos
    experience: {
      type: DataTypes.JSON,
      defaultValue: {}
    },
    // Trip Snapshot
    tripSnapshot: {
      type: DataTypes.JSON,
      defaultValue: {}
    },
    // SEO Data
    seo: {
      type: DataTypes.JSON,
      defaultValue: {}
    }
  },
  {
    tableName: 'blogs',
    timestamps: true
  }
);

export default Blog;
