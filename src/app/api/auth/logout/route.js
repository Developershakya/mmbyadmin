import { clearAuthCookie } from "@/lib/auth";
import { handleApiError } from "@/lib/apiError";
async function handler(req, res) {
  clearAuthCookie(res);
  return res.status(200).json({ message: "Logged out" });
}

export async function GET(req, res) { return handler(req, res); }
export async function POST(req, res) { return handler(req, res); }
