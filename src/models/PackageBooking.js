import { DataTypes } from 'sequelize';
import sequelize from '../config/sequelize.js';

const PackageBooking = sequelize.define(
  'PackageBooking',
  {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
      defaultValue: () => `PKG-BKG-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`
    },
    bookingId: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    packageId: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    packageName: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'Custom Bharat Yatra Tour'
    },
    userId: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: 'usr_admin_1'
    },
    customerName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    customerEmail: {
      type: DataTypes.STRING,
      allowNull: true
    },
    customerPhone: {
      type: DataTypes.STRING,
      allowNull: true
    },
    destination: {
      type: DataTypes.STRING,
      allowNull: true
    },
    travelDate: {
      type: DataTypes.STRING,
      allowNull: true
    },
    passengersCount: {
      type: DataTypes.INTEGER,
      defaultValue: 1
    },
    totalAmount: {
      type: DataTypes.DECIMAL,
      allowNull: false,
      defaultValue: 0
    },
    currency: {
      type: DataTypes.STRING,
      defaultValue: 'INR'
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'CONFIRMED' // CONFIRMED, PENDING, CANCELLED, FAILED
    },
    paymentId: {
      type: DataTypes.STRING,
      allowNull: true
    },
    servicesBooked: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: []
    },
    bookingDetails: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: {}
    },
    isDummy: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  },
  {
    tableName: 'package_bookings',
    timestamps: true,
    indexes: [
      { fields: ['bookingId'], unique: true },
      { fields: ['packageId'] },
      { fields: ['status'] },
      { fields: ['createdAt'] }
    ]
  }
);

export default PackageBooking;
