import { signToken } from "@/lib/auth";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import User from "../../../../../models/User.js";

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return NextResponse.json({ error: "Invalid email ya password" }, { status: 401 });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return NextResponse.json({ error: "Invalid email ya password" }, { status: 401 });
    }

    const token = signToken({ id: user.id, email: user.email });
    const response = NextResponse.json({
      message: "Login successful",
      user: { id: user.id, email: user.email, name: user.name },
    });
    response.cookies.set("token", token, { httpOnly: true, path: "/", maxAge: 7 * 24 * 60 * 60, sameSite: "lax", secure: process.env.NODE_ENV === "production" });
    return response;
  } catch (err) {
    console.error("Login API error:", err);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
