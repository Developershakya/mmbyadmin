import jwt from "jsonwebtoken";

export function signToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    return null;
  }
}

// Pages Router API routes mein req.cookies already parsed object hota hai
export function getUserFromRequest(req) {
  const token = req.cookies?.token;
  if (!token) return null;
  return verifyToken(token); // { id, email }
}

// Cookie set karne ka helper (Pages Router mein res.setHeader use hota hai)
export function setAuthCookie(res, token) {
  const isProd = process.env.NODE_ENV === "production";
  const maxAge = 7 * 24 * 60 * 60; // 7 din
  res.setHeader(
    "Set-Cookie",
    `token=${token}; HttpOnly; Path=/; Max-Age=${maxAge}; SameSite=Lax${isProd ? "; Secure" : ""}`
  );
}

export function clearAuthCookie(res) {
  res.setHeader("Set-Cookie", `token=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax`);
}