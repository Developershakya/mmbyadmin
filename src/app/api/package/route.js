import Package from "../../../../models/Package.js";
import { handleApiError } from "@/lib/apiError";
async function handler(req) {
  try {
    const { to, adults, childs, infants } = req.query;
  } catch (err) {
    return handleApiError("undefinded");
  }
}
