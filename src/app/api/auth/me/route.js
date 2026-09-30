import { getUserFromRequest } from "@/lib/auth";
import { signToken } from "@/lib/auth";
import { NextResponse } from "next/server";
import User from "../../../../../models/User.js";

function authenticatedUser(request) {
  return getUserFromRequest({
    cookies: { token: request.cookies.get("token")?.value },
  });
}

function isMissingPhoneColumn(error) {
  const message = String(error?.message || "").toLowerCase();
  return message.includes("phone") && (message.includes("unknown column") || message.includes("no such column") || message.includes("does not exist"));
}

export async function GET(request) {
  try {
    const tokenUser = authenticatedUser(request);
    if (!tokenUser?.id) {
      return NextResponse.json({ user: null }, { status: 401 });
    }
    let user;
    try {
      user = await User.findByPk(tokenUser.id, { attributes: ["id", "name", "email", "phone"] });
    } catch (error) {
      if (!isMissingPhoneColumn(error)) throw error;
      user = await User.findByPk(tokenUser.id, { attributes: ["id", "name", "email"] });
    }
    if (!user) return NextResponse.json({ user: null }, { status: 401 });
    return NextResponse.json({ user: { id: user.id, name: user.name, email: user.email, phone: user.phone || null } });
  } catch (error) {
    console.error("Auth me API error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const tokenUser = authenticatedUser(request);
    if (!tokenUser?.id) {
      return NextResponse.json({ message: "Authentication required" }, { status: 401 });
    }

    const user = await User.findByPk(tokenUser.id, { attributes: ["id", "name", "email"] });
    if (!user) return NextResponse.json({ message: "User not found" }, { status: 404 });
    const body = await request.json();
    const fields = [];

    if (body.name !== undefined) {
      const name = String(body.name).trim();
      if (!name || name.length > 120) {
        return NextResponse.json({ message: "Enter a name under 120 characters." }, { status: 400 });
      }
      user.name = name;
      fields.push("name");
    }

    if (body.email !== undefined) {
      const email = String(body.email).trim().toLowerCase();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return NextResponse.json({ message: "Enter a valid email address." }, { status: 400 });
      }
      const duplicate = await User.findOne({ where: { email } });
      if (duplicate && String(duplicate.id) !== String(user.id)) {
        return NextResponse.json({ message: "That email is already in use." }, { status: 409 });
      }
      user.email = email;
      fields.push("email");
    }

    if (body.phone !== undefined) {
      const phone = String(body.phone).trim();
      if (phone && !/^\+?[0-9()\s-]{7,31}$/.test(phone)) {
        return NextResponse.json({ message: "Enter a valid phone number." }, { status: 400 });
      }
      user.phone = phone || null;
      fields.push("phone");
    }

    if (!fields.length) {
      return NextResponse.json({ message: "No profile fields were provided." }, { status: 400 });
    }

    try {
      await user.save({ fields });
    } catch (error) {
      if (fields.includes("phone") && isMissingPhoneColumn(error)) {
        return NextResponse.json({ message: "Apply the user phone database migration before updating mobile number." }, { status: 503 });
      }
      throw error;
    }
    const response = NextResponse.json({
      user: { id: user.id, name: user.name, email: user.email, phone: user.phone },
    });
    response.cookies.set("token", signToken({ id: user.id, email: user.email }), {
      httpOnly: true,
      path: "/",
      maxAge: 7 * 24 * 60 * 60,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });
    return response;
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json({ message: "Unable to update profile." }, { status: 500 });
  }
}

