import { DataTypes } from 'sequelize';
import sequelize from '../config/sequelize.js';

const ServiceApiLog = sequelize.define(
  'ServiceApiLog',
  {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
      defaultValue: () => `LOG-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
    },
    userId: {
      type: DataTypes.STRING,
      allowNull: true
    },
    packageId: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    serviceItemId: {
      type: DataTypes.STRING,
      allowNull: true
    },
    bookingId: {
      type: DataTypes.STRING,
      allowNull: true
    },
    serviceType: {
      type: DataTypes.STRING,
      allowNull: false // FLIGHT, HOTEL, BUS, CAR, PAYMENT
    },
    action: {
      type: DataTypes.STRING,
      allowNull: false // Search, FareRule, SeatMap, SSR, HotelInfo, HotelRoom, BoardingPoints, SeatLayout, Book, Cancel
    },
    provider: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'SRDV'
    },
    endpoint: {
      type: DataTypes.STRING,
      allowNull: false
    },
    httpMethod: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'POST'
    },
    requestJson: {
      type: DataTypes.JSON,
      allowNull: true
    },
    responseJson: {
      type: DataTypes.JSON,
      allowNull: true
    },
    httpStatus: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    providerErrorCode: {
      type: DataTypes.STRING,
      allowNull: true
    },
    providerErrorMessage: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    traceId: {
      type: DataTypes.STRING,
      allowNull: true
    },
    latency: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: 'SUCCESS' // SUCCESS, ERROR
    }
  },
  {
    tableName: 'service_api_logs',
    timestamps: true,
    indexes: [
      { fields: ['serviceType'] },
      { fields: ['action'] },
      { fields: ['traceId'] },
      { fields: ['bookingId'] },
      { fields: ['createdAt'] }
    ]
  }
);

export default ServiceApiLog;
