import { DataTypes } from 'sequelize';
import sequelize from '../config/sequelize.js';

const Payment = sequelize.define(
  'Payment',
  {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
      defaultValue: () => `PAY-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`
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
      allowNull: false
    },
    gateway: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'RAZORPAY_TEST'
    },
    gatewayOrderId: {
      type: DataTypes.STRING,
      allowNull: false
    },
    gatewayPaymentId: {
      type: DataTypes.STRING,
      allowNull: true
    },
    gatewaySignature: {
      type: DataTypes.STRING,
      allowNull: true
    },
    amount: {
      type: DataTypes.DECIMAL,
      allowNull: false
    },
    currency: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'INR'
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'PENDING' // 'PENDING', 'PAID', 'FAILED', 'REFUNDED'
    },
    rawResponse: {
      type: DataTypes.JSON,
      allowNull: true
    },
    paidAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    refundAmount: {
      type: DataTypes.DECIMAL,
      allowNull: true,
      defaultValue: 0
    },
    refundId: {
      type: DataTypes.STRING,
      allowNull: true
    },
    refundStatus: {
      type: DataTypes.STRING,
      allowNull: true
    }
  },
  {
    tableName: 'payments',
    timestamps: true,
    indexes: [
      { fields: ['gatewayOrderId'], unique: true },
      { fields: ['gatewayPaymentId'] },
      { fields: ['bookingId'] },
      { fields: ['status'] },
      { fields: ['serviceType'] }
    ]
  }
);

export default Payment;
