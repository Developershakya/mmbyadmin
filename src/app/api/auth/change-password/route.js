import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getUserFromRequest } from "@/lib/auth";
import User from "../../../../../models/User.js";

export async function POST(request) {
  try {
    const tokenUser = getUserFromRequest({
      cookies: { token: request.cookies.get("token")?.value },
    });
    if (!tokenUser?.id) {
      return NextResponse.json({ message: "Authentication required" }, { status: 401 });
    }

    const { currentPassword, newPassword, confirmPassword } = await request.json();
    if (!currentPassword || !newPassword || !confirmPassword) {
      return NextResponse.json({ message: "Complete all password fields." }, { status: 400 });
    }
    if (newPassword.length < 8) {
      return NextResponse.json({ message: "New password must be at least 8 characters." }, { status: 400 });
    }
    if (newPassword !== confirmPassword) {
      return NextResponse.json({ message: "New password and confirmation do not match." }, { status: 400 });
    }

    const user = await User.findByPk(tokenUser.id);
    if (!user) return NextResponse.json({ message: "User not found" }, { status: 404 });
    if (!(await bcrypt.compare(currentPassword, user.password))) {
      return NextResponse.json({ message: "Current password is incorrect." }, { status: 400 });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save({ fields: ["password"] });
    return NextResponse.json({ message: "Password updated successfully." });
  } catch (error) {
    console.error("Password update error:", error);
    return NextResponse.json({ message: "Unable to update password." }, { status: 500 });
  }
}