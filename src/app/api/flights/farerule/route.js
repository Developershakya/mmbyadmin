import { callSrdvApi } from '@/lib/srdvApi';
import { handleApiError } from "@/lib/apiError";
// Response ke andar kahin bhi (kisi bhi key ke neeche) HTML table wala string dhoondta hai
function findFareRuleHtml(obj) {
  if (!obj) return null;

  if (typeof obj === 'string') {
    return obj.toLowerCase().includes('<table') ? obj : null;
  }

  if (Array.isArray(obj)) {
    for (const item of obj) {
      const found = findFareRuleHtml(item);
      if (found) return found;
    }
    return null;
  }

  if (typeof obj === 'object') {
    for (const key of Object.keys(obj)) {
      const found = findFareRuleHtml(obj[key]);
      if (found) return found;
    }
  }

  return null;
}

async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { traceId, resultIndex, srdvType, srdvIndex } = req.body;

  if (!traceId || !resultIndex) {
    return res.status(400).json({ success: false, message: 'traceId ya resultIndex missing hai.' });
  }

  try {
    const data = await callSrdvApi(process.env.FLIGHT_API_URL, 'FareRule', {
      TraceId: traceId,
      ResultIndex: resultIndex,
      SrdvType: srdvType,
      SrdvIndex: srdvIndex,
    });

    console.log('FareRule RAW:', JSON.stringify(data, null, 2));

    const fareRuleText = findFareRuleHtml(data);

    if (!fareRuleText) {
      return res.status(200).json({ success: false, message: 'Fare rules is flight ke liye available nahi hain.' });
    }

    return res.status(200).json({ success: true, fareRuleText });
  } catch (error) {
    console.error('FareRule error:', error.message);
    return handleApiError(res, error, "Something went wrong");
  }
}

export async function GET(req, res) { return handler(req, res); }
export async function POST(req, res) { return handler(req, res); }
