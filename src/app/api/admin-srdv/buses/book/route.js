import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json({
    success: true,
    bookingId: `SRDV-BUS-${Date.now()}`,
    status: 'CONFIRMED',
    message: 'Dummy booking for frontend flow testing. Live SRDV bus booking is intentionally disabled in this build.',
  });
}
