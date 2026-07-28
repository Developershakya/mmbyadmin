import { getUserFromRequest } from "../../../lib/auth";

export default function handler(req, res) {
  const user = getUserFromRequest(req);
  return res.status(200).json({ user });
}