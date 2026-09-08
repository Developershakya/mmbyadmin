import { getUserFromRequest } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const user = getUserFromRequest({ cookies: { token: request.cookies.get("token")?.value } });
    return NextResponse.json({ user });
  } catch (error) {
    console.error("Auth me API error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

