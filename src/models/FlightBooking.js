import { DataTypes } from 'sequelize';
import sequelize from '../config/sequelize.js';

const FlightBooking = sequelize.define(
  'FlightBooking',
  {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
      defaultValue: () => `FL-BKG-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`
    },
    bookingId: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    pnr: {
      type: DataTypes.STRING,
      allowNull: false
    },
    ticketNumber: {
      type: DataTypes.STRING,
      allowNull: false
    },
    invoiceNumber: {
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
      defaultValue: 'CONFIRMED' // CONFIRMED, CANCEL_REQUESTED, CANCELLED, PARTIALLY_CANCELLED, REFUND_PENDING, REFUNDED
    },
    airline: {
      type: DataTypes.STRING,
      allowNull: false
    },
    airlineCode: {
      type: DataTypes.STRING,
      allowNull: false
    },
    flightNumber: {
      type: DataTypes.STRING,
      allowNull: false
    },
    origin: {
      type: DataTypes.STRING,
      allowNull: false
    },
    originCity: {
      type: DataTypes.STRING,
      allowNull: true
    },
    destination: {
      type: DataTypes.STRING,
      allowNull: false
    },
    destinationCity: {
      type: DataTypes.STRING,
      allowNull: true
    },
    departureTime: {
      type: DataTypes.STRING,
      allowNull: false
    },
    arrivalTime: {
      type: DataTypes.STRING,
      allowNull: false
    },
    departureDate: {
      type: DataTypes.STRING,
      allowNull: false
    },
    arrivalDate: {
      type: DataTypes.STRING,
      allowNull: true
    },
    duration: {
      type: DataTypes.STRING,
      allowNull: true
    },
    stops: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: 'Direct'
    },
    cabinClass: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'Economy'
    },
    isLcc: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    isRefundable: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    fare: {
      type: DataTypes.DECIMAL,
      allowNull: false
    },
    baseFare: {
      type: DataTypes.DECIMAL,
      allowNull: false
    },
    tax: {
      type: DataTypes.DECIMAL,
      allowNull: false
    },
    totalAmount: {
      type: DataTypes.DECIMAL,
      allowNull: false
    },
    currency: {
      type: DataTypes.STRING,
      defaultValue: 'INR'
    },
    segments: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: []
    },
    passengers: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: []
    },
    seats: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: []
    },
    ssr: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: {}
    },
    fareRules: {
      type: DataTypes.JSON,
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
    ticketPdfUrl: {
      type: DataTypes.STRING,
      allowNull: true
    },
    bookingSnapshot: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: {}
    }
  },
  {
    tableName: 'flight_bookings',
    timestamps: true,
    indexes: [
      { fields: ['bookingId'], unique: true },
      { fields: ['pnr'] },
      { fields: ['ticketNumber'] },
      { fields: ['status'] },
      { fields: ['packageId'] },
      { fields: ['serviceItemId'] },
      { fields: ['createdAt'] }
    ]
  }
);

export default FlightBooking;
