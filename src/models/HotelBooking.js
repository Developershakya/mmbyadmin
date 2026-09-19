import { DataTypes } from 'sequelize';
import sequelize from '../config/sequelize.js';

const HotelBooking = sequelize.define(
  'HotelBooking',
  {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
      defaultValue: () => `HT-BKG-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`
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
    bookingRefNo: {
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
      defaultValue: 'CONFIRMED' // CONFIRMED, CANCEL_REQUESTED, CANCELLED, REFUND_PENDING, REFUNDED
    },
    hotelName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    hotelCode: {
      type: DataTypes.STRING,
      allowNull: true
    },
    starRating: {
      type: DataTypes.INTEGER,
      defaultValue: 4
    },
    category: {
      type: DataTypes.STRING,
      defaultValue: '4 Star'
    },
    address: {
      type: DataTypes.STRING,
      allowNull: true
    },
    city: {
      type: DataTypes.STRING,
      allowNull: false
    },
    state: {
      type: DataTypes.STRING,
      allowNull: true
    },
    country: {
      type: DataTypes.STRING,
      defaultValue: 'India'
    },
    checkInDate: {
      type: DataTypes.STRING,
      allowNull: false
    },
    checkOutDate: {
      type: DataTypes.STRING,
      allowNull: false
    },
    nights: {
      type: DataTypes.INTEGER,
      defaultValue: 1
    },
    roomsCount: {
      type: DataTypes.INTEGER,
      defaultValue: 1
    },
    guestCount: {
      type: DataTypes.INTEGER,
      defaultValue: 2
    },
    roomTypeName: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'Deluxe Room'
    },
    ratePlanCode: {
      type: DataTypes.STRING,
      allowNull: true
    },
    inclusions: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: ['Breakfast Included', 'Free Wi-Fi']
    },
    cancellationPolicy: {
      type: DataTypes.JSON,
      allowNull: true
    },
    guests: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: []
    },
    rooms: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: []
    },
    pricePerNight: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    basePrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    tax: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    totalAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    currency: {
      type: DataTypes.STRING,
      defaultValue: 'INR'
    },
    voucherStatus: {
      type: DataTypes.STRING,
      defaultValue: 'CONFIRMED'
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
    tableName: 'hotel_bookings',
    timestamps: true,
    indexes: [
      { fields: ['bookingId'], unique: true },
      { fields: ['confirmationNo'] },
      { fields: ['bookingRefNo'] },
      { fields: ['status'] },
      { fields: ['packageId'] },
      { fields: ['serviceItemId'] },
      { fields: ['createdAt'] }
    ]
  }
);

export default HotelBooking;
