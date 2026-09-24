import Razorpay from 'razorpay';
import { getUserFromRequest } from '@/lib/auth';
import { NextResponse } from 'next/server';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export async function POST(request) {
  try {
    const user = getUserFromRequest({
      cookies: {
        token: request.cookies.get('token')?.value,
      },
    });

    if (!user) {
      return NextResponse.json({ success: false, message: 'Login required' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const amount = Number(body.amount ?? 0);
    const currency = String(body.currency || 'INR').toUpperCase();
    const serviceType = String(body.serviceType || 'general').trim();
    const packageId = body.packageId ? String(body.packageId) : '';
    const serviceItemId = body.serviceItemId ? String(body.serviceItemId) : '';

    if (!amount || amount <= 0) {
      return NextResponse.json({ success: false, message: 'Invalid amount' }, { status: 400 });
    }

    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      return NextResponse.json(
        { success: false, message: 'Razorpay is not configured on the server.' },
        { status: 500 },
      );
    }

    const receipt = `receipt_${serviceType}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const order = await razorpay.orders.create({
      receipt,
      amount: Math.round(amount * 100),
      currency,
      notes: {
        serviceType,
        packageId,
        serviceItemId,
      },
    });

    console.log('SRDV Razorpay create-order payload:', {
      receipt,
      amount: order.amount,
      currency: order.currency,
      serviceType,
      packageId,
      serviceItemId,
    });

    return NextResponse.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
      receipt: order.receipt,
      order,
    });
  } catch (error) {
    console.error('SRDV Razorpay create-order error:', error);
    return NextResponse.json(
      { success: false, message: error?.message || 'Failed to create Razorpay order' },
      { status: 500 },
    );
  }
}
