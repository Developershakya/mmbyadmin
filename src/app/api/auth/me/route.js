import { getUserFromRequest } from "@/lib/auth";
import { handleApiError } from "@/lib/apiError";
import { withAppRoute } from '@/lib/routeCompat';

async function handler(req) {
  try {
    const user = getUserFromRequest(req);
    return Response.json({ user });
  } catch (error) {
    return handleApiError(undefined, error, 'Something went wrong');
  }
}

export const GET = withAppRoute(handler);
export const POST = withAppRoute(handler);
