import { NextResponse } from "next/server";
import { signToken } from "@/lib/auth";
import User from "../../../../../models/User.js";

export async function POST(request) {
  try {
    const { name, email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email aur password required hai" }, { status: 400 });
    }

    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Ye email pehle se registered hai" }, { status: 409 });
    }

    const user = await User.create({ name, email, password });

    const token = signToken({ id: user.id, email: user.email });
    const response = NextResponse.json({
      message: "Registered successfully",
      user: { id: user.id, email: user.email, name: user.name },
    }, { status: 201 });
    response.cookies.set("token", token, { httpOnly: true, path: "/", maxAge: 7 * 24 * 60 * 60, sameSite: "lax", secure: process.env.NODE_ENV === "production" });
    return response;
  } catch (err) {
    console.error("Register API error:", err);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
