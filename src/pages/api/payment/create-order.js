import Razorpay from 'razorpay';
import { getUserFromRequest } from '../../../lib/auth';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const user = getUserFromRequest(req);
  if (!user) {
    return res.status(401).json({ success: false, message: 'Login required' });
  }

  const { amount } = req.body; // amount in Rupees

  if (!amount || amount <= 0) {
    return res.status(400).json({ success: false, message: 'Invalid amount' });
  }

  try {
    const order = await razorpay.orders.create({
      receipt: 'receipt_' + Date.now(),
      amount: Math.round(amount * 100), // paise me
      currency: 'INR'
    });

    res.status(200).json({
      success: true,
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      key_id: process.env.RAZORPAY_KEY_ID
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}