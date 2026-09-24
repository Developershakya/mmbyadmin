import { DataTypes } from 'sequelize';
import sequelize from '../config/sequelize.js';

const PackageServiceItem = sequelize.define(
  'PackageServiceItem',
  {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
      defaultValue: () => `PSI-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`
    },
    packageId: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    itineraryDayId: {
      type: DataTypes.STRING,
      allowNull: false
    },
    serviceType: {
      type: DataTypes.STRING,
      allowNull: false
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'SELECTED' // 'SELECTED', 'READY_FOR_PAYMENT', 'BOOKED', 'CANCELLED'
    },
    provider: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'SRDV'
    },
    traceId: {
      type: DataTypes.STRING,
      allowNull: true
    },
    srdvType: {
      type: DataTypes.STRING,
      allowNull: true
    },
    srdvIndex: {
      type: DataTypes.STRING,
      allowNull: true
    },
    resultIndex: {
      type: DataTypes.STRING,
      allowNull: true
    },
    hotelCode: {
      type: DataTypes.STRING,
      allowNull: true
    },
    providerReferences: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: {}
    },
    searchSnapshot: {
      type: DataTypes.JSON,
      allowNull: true
    },
    selectedResultSnapshot: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: {}
    },
    detailSnapshot: {
      type: DataTypes.JSON,
      allowNull: true
    },
    fareRuleSnapshot: {
      type: DataTypes.JSON,
      allowNull: true
    },
    seatMapSnapshot: {
      type: DataTypes.JSON,
      allowNull: true
    },
    ssrSnapshot: {
      type: DataTypes.JSON,
      allowNull: true
    },
    roomSnapshot: {
      type: DataTypes.JSON,
      allowNull: true
    },
    boardingSnapshot: {
      type: DataTypes.JSON,
      allowNull: true
    },
    selectedOptions: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: {}
    },
    pricingSnapshot: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: {}
    }
  },
  {
    tableName: 'package_service_items',
    timestamps: true,
    indexes: [
      { fields: ['packageId'] },
      { fields: ['itineraryDayId'] },
      { fields: ['serviceType'] },
      { fields: ['traceId'] },
      { fields: ['status'] }
    ]
  }
);

export default PackageServiceItem;
