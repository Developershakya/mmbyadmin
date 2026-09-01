import { handleApiError } from "@/lib/apiError";
import { getUserFromRequest } from '@/lib/auth';
async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const user = getUserFromRequest(req);
  if (!user) {
    return res.status(401).json({ success: false, message: 'Login required' });
  }

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return res.status(400).json({ success: false, message: 'Payment details missing' });
  }

  const generatedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex');

  if (generatedSignature === razorpay_signature) {
    // Yaha aap apna DB me booking record save/update karo
    return res.status(200).json({ success: true, message: 'Payment verified' });
  }

  return res.status(400).json({ success: false, message: 'Invalid signature' });
}

export async function GET(req, res) { return handler(req, res); }
export async function POST(req, res) { return handler(req, res); }
