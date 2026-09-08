import { NextResponse } from "next/server";

export async function POST() {
	return NextResponse.json(
		{ success: false, message: "Cab booking is not available yet." },
		{ status: 501 }
	);
}