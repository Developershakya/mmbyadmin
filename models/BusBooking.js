import { DataTypes } from 'sequelize';
import sequelize from '../config/sequelize.js';

const BusBooking = sequelize.define(
  'BusBooking',
  {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
      defaultValue: () => `BS-BKG-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`
    },
    bookingId: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    ticketNo: {
      type: DataTypes.STRING,
      allowNull: false
    },
    operatorPnr: {
      type: DataTypes.STRING,
      allowNull: false
    },
    busId: {
      type: DataTypes.STRING,
      allowNull: true
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
    operator: {
      type: DataTypes.STRING,
      allowNull: false
    },
    busType: {
      type: DataTypes.STRING,
      allowNull: false
    },
    route: {
      type: DataTypes.STRING,
      allowNull: true
    },
    fromCity: {
      type: DataTypes.STRING,
      allowNull: false
    },
    toCity: {
      type: DataTypes.STRING,
      allowNull: false
    },
    travelDate: {
      type: DataTypes.STRING,
      allowNull: false
    },
    departureTime: {
      type: DataTypes.STRING,
      allowNull: false
    },
    arrivalTime: {
      type: DataTypes.STRING,
      allowNull: false
    },
    duration: {
      type: DataTypes.STRING,
      allowNull: true
    },
    boardingPoint: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: {}
    },
    droppingPoint: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: {}
    },
    passengers: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: []
    },
    seats: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: []
    },
    fare: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    tax: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0
    },
    totalAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    currency: {
      type: DataTypes.STRING,
      defaultValue: 'INR'
    },
    ticketPdfUrl: {
      type: DataTypes.STRING,
      allowNull: true
    },
    traceId: {
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
    tableName: 'bus_bookings',
    timestamps: true,
    indexes: [
      { fields: ['bookingId'], unique: true },
      { fields: ['ticketNo'] },
      { fields: ['operatorPnr'] },
      { fields: ['status'] },
      { fields: ['packageId'] },
      { fields: ['serviceItemId'] },
      { fields: ['createdAt'] }
    ]
  }
);

export default BusBooking;
