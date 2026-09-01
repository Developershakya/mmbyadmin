import { handleApiError } from "@/lib/apiError";
import { signToken, setAuthCookie } from "@/lib/auth";
async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { name, email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email aur password required hai" });
    }

    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(409).json({ error: "Ye email pehle se registered hai" });
    }

    const user = await User.create({ name, email, password });
    // password hash User model ke beforeCreate hook mein already ho raha hai

    const token = signToken({ id: user.id, email: user.email });
    setAuthCookie(res, token);

    return res.status(201).json({
      message: "Registered successfully",
      user: { id: user.id, email: user.email, name: user.name },
    });
  } catch (err) {
    console.error(err);
    return handleApiError(res, err, "Something went wrong");
  }
}

export async function GET(req, res) { return handler(req, res); }
export async function POST(req, res) { return handler(req, res); }
