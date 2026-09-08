import Razorpay from 'razorpay';
import { NextResponse } from "next/server";
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

export async function POST(request) {
  const { amount } = await request.json(); // amount in Rupees

  if (!amount || amount <= 0) {
    return NextResponse.json({ success: false, message: 'Invalid amount' }, { status: 400 });
  }

  try {
    const order = await razorpay.orders.create({
      receipt: 'holiday_receipt_' + Date.now(),
      amount: Math.round(amount * 100), // paise me
      currency: 'INR'
    });

    return NextResponse.json({
      success: true,
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      key_id: process.env.RAZORPAY_KEY_ID
    });
  } catch (error) {
    console.error("Holiday payment order error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
