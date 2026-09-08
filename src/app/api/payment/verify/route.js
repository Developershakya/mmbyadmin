import { getUserFromRequest } from '@/lib/auth';
import { NextResponse } from "next/server";
import crypto from "crypto";
export async function POST(request) {

  const user = getUserFromRequest({ cookies: { token: request.cookies.get("token")?.value } });
  if (!user) {
    return NextResponse.json({ success: false, message: 'Login required' }, { status: 401 });
  }

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await request.json();

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return NextResponse.json({ success: false, message: 'Payment details missing' }, { status: 400 });
  }

  const generatedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex');

  if (generatedSignature === razorpay_signature) {
    // Yaha aap apna DB me booking record save/update karo
    return NextResponse.json({ success: true, message: 'Payment verified' });
  }

  return NextResponse.json({ success: false, message: 'Invalid signature' }, { status: 400 });
}
