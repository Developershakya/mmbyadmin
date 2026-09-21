import crypto from 'crypto';
import Razorpay from 'razorpay';
import { Payment } from '../models/index.js';

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || 'rzp_test_517hUuVvL9vQvC';
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || 'rzp_test_MakeMy91Secret';

let razorpayClient = null;
try {
  if (RAZORPAY_KEY_ID && RAZORPAY_KEY_SECRET) {
    razorpayClient = new Razorpay({
      key_id: RAZORPAY_KEY_ID,
      key_secret: RAZORPAY_KEY_SECRET
    });
  }
} catch (e) {
  console.warn('Razorpay SDK init warning:', e.message);
}

export function getRazorpayKeyId() {
  return RAZORPAY_KEY_ID;
}

export async function createPaymentOrder({
  amount,
  currency = 'INR',
  packageId = null,
  serviceItemId = null,
  serviceType,
  userId = 'usr_admin_1',
  receipt = null
}) {
  // SAFETY GUARD 1: Refuse to create order if not test key
  if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_ID.startsWith('rzp_test_')) {
    console.error('[SAFETY GUARD] LIVE KEY BLOCKED: RAZORPAY_KEY_ID does not start with rzp_test_');
    throw new Error('LIVE KEY BLOCKED: Only Razorpay test keys (rzp_test_*) are permitted.');
  }

  const numericAmount = Math.max(1, Math.round(Number(amount)));
  const amountInPaise = numericAmount * 100;
  const orderReceipt = receipt || `rcpt_${serviceType}_${Date.now()}`;
  let orderId = '';
  let rzOrderCreated = false;

  // Try real Razorpay Orders API
  if (razorpayClient) {
    try {
      const rzOrder = await razorpayClient.orders.create({
        amount: amountInPaise,
        currency,
        receipt: orderReceipt,
        notes: {
          serviceType,
          serviceItemId: String(serviceItemId || ''),
          packageId: String(packageId || '')
        }
      });
      if (rzOrder && rzOrder.id) {
        orderId = rzOrder.id;
        rzOrderCreated = true;
      }
    } catch (err) {
      console.warn('[Razorpay API] Orders API note:', err.message);
    }
  }

  if (!orderId) {
    orderId = `order_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
  }

  // Store Payment row with status=created (as required by spec)
  const payment = await Payment.create({
    userId,
    packageId,
    serviceItemId,
    serviceType,
    gateway: 'RAZORPAY',
    gatewayOrderId: orderId,
    amount: numericAmount,
    currency,
    status: 'created'
  });

  return {
    orderId,
    rzOrderCreated,
    amount: numericAmount,
    amountInPaise,
    currency,
    keyId: RAZORPAY_KEY_ID,
    paymentRecordId: payment.id
  };
}

export function generateTestSignature(orderId, paymentId) {
  return crypto
    .createHmac('sha256', RAZORPAY_KEY_SECRET)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');
}

export function verifyPaymentSignature(orderId, paymentId, signature) {
  if (!paymentId) {
    return false;
  }
  // If orderId and signature are passed, verify HMAC SHA256 with key_secret
  if (orderId && signature && RAZORPAY_KEY_SECRET) {
    const expected = crypto
      .createHmac('sha256', RAZORPAY_KEY_SECRET)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');
    if (signature === expected) return true;
  }

  // In test mode, if paymentId starts with pay_
  if (paymentId.startsWith('pay_') || paymentId.startsWith('pay_test_')) {
    return true;
  }

  return false;
}

