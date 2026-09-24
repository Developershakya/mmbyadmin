import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json({
    success: true,
    bookingId: `SRDV-HOT-${Date.now()}`,
    status: 'CONFIRMED',
    message: 'Dummy booking for frontend flow testing. Live SRDV hotel booking is intentionally disabled in this build.',
  });
}
