import { DataTypes } from 'sequelize';
import sequelize from '../config/sequelize.js';

const CarBooking = sequelize.define(
  'CarBooking',
  {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
      defaultValue: () => `CR-BKG-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`
    },
    bookingId: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    confirmationNo: {
      type: DataTypes.STRING,
      allowNull: false
    },
    referenceNo: {
      type: DataTypes.STRING,
      allowNull: false
    },
    userId: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: 'usr_admin_1'
    },
    packageId: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    itineraryDayId: {
      type: DataTypes.STRING,
      allowNull: true
    },
    serviceItemId: {
      type: DataTypes.STRING,
      allowNull: true
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'CONFIRMED' // CONFIRMED, CANCEL_REQUESTED, CANCELLED, REFUND_PENDING, REFUNDED
    },
    vehicleName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    category: {
      type: DataTypes.STRING,
      allowNull: false
    },
    type: {
      type: DataTypes.STRING,
      defaultValue: 'Sedan'
    },
    seatingCapacity: {
      type: DataTypes.INTEGER,
      defaultValue: 4
    },
    pickupCity: {
      type: DataTypes.STRING,
      allowNull: false
    },
    dropCity: {
      type: DataTypes.STRING,
      allowNull: false
    },
    pickupLocation: {
      type: DataTypes.STRING,
      allowNull: true
    },
    dropLocation: {
      type: DataTypes.STRING,
      allowNull: true
    },
    pickupDate: {
      type: DataTypes.STRING,
      allowNull: false
    },
    pickupTime: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: '09:00 AM'
    },
    tripType: {
      type: DataTypes.STRING,
      defaultValue: 'OneWay'
    },
    passengers: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: []
    },
    driverDetails: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: {
        driverName: 'Assigned 2 Hours Prior to Pickup',
        contact: '+91 98765 43210',
        vehicleNumber: 'DL 01 AB 9988'
      }
    },
    perKmRate: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 14
    },
    baseFare: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    driverAllowance: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 350
    },
    tollIncluded: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    totalAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    currency: {
      type: DataTypes.STRING,
      defaultValue: 'INR'
    },
    voucherPdfUrl: {
      type: DataTypes.STRING,
      allowNull: true
    },
    traceId: {
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
    cancellationDetails: {
      type: DataTypes.JSON,
      allowNull: true
    },
    refundDetails: {
      type: DataTypes.JSON,
      allowNull: true
    },
    bookingSnapshot: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: {}
    }
  },
  {
    tableName: 'car_bookings',
    timestamps: true,
    indexes: [
      { fields: ['bookingId'], unique: true },
      { fields: ['confirmationNo'] },
      { fields: ['referenceNo'] },
      { fields: ['status'] },
      { fields: ['packageId'] },
      { fields: ['serviceItemId'] },
      { fields: ['createdAt'] }
    ]
  }
);

export default CarBooking;
