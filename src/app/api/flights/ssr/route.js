import { callSrdvApi } from '@/lib/srdvApi';
import { handleApiError } from "@/lib/apiError";
async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { traceId, resultIndex, srdvType, srdvIndex } = req.body;

  try {
    const data = await callSrdvApi(process.env.FLIGHT_API_URL, 'SSR', {
      TraceId: traceId,
      SrdvType: srdvType,
      SrdvIndex: srdvIndex,
      ResultIndex: resultIndex,
    });

    console.log('SSR RAW response:', JSON.stringify(data, null, 2));

    if (data.Error?.ErrorCode && data.Error.ErrorCode !== '0') {
      return res.status(409).json({ success: false, message: data.Error.ErrorMessage });
    }

    return res.status(200).json({ success: true, data });
  } catch (err) {
    console.error('ssr error:', err.message);
    return handleApiError(res, err, "Something went wrong");
  }
}

export async function GET(req, res) { return handler(req, res); }
export async function POST(req, res) { return handler(req, res); }
