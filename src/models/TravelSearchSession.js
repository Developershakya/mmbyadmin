import { DataTypes } from 'sequelize';
import sequelize from '../config/sequelize.js';

const TravelSearchSession = sequelize.define(
  'TravelSearchSession',
  {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
      defaultValue: () => `SRCH-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
    },
    userId: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: 'usr_admin_1'
    },
    serviceType: {
      type: DataTypes.ENUM('FLIGHT', 'HOTEL', 'BUS', 'CAR'),
      allowNull: false
    },
    provider: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'SRDV'
    },
    searchParams: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: {}
    },
    requestSnapshot: {
      type: DataTypes.JSON,
      allowNull: true
    },
    resultSnapshot: {
      type: DataTypes.JSON,
      allowNull: true
    },
    traceId: {
      type: DataTypes.STRING,
      allowNull: true
    },
    resultCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: 'COMPLETED'
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: true
    }
  },
  {
    tableName: 'travel_search_sessions',
    timestamps: true,
    indexes: [
      { fields: ['userId'] },
      { fields: ['serviceType'] },
      { fields: ['traceId'] },
      { fields: ['createdAt'] }
    ]
  }
);

export default TravelSearchSession;
