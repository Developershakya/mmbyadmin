import { callSrdvApi } from '../../../lib/srdvApi';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { legs } = req.body; // [{ traceId, resultIndex, legIndex }]

  if (!Array.isArray(legs) || legs.length === 0) {
    return res.status(400).json({ success: false, message: 'Legs required hain.' });
  }

  try {
    const results = await Promise.all(
      legs.map(async (leg) => {
        if (!leg.traceId || !leg.resultIndex) {
          throw new Error(`Missing traceId/resultIndex for leg ${leg.legIndex}: traceId=${leg.traceId}, resultIndex=${leg.resultIndex}`);
        }

        const data = await callSrdvApi(process.env.FLIGHT_API_URL, 'FareQuote', {
          TraceId: leg.traceId,
          ResultIndex: leg.resultIndex,
        });

        // ⭐ TEMP DEBUG — poora raw response console mein dikhao
        console.log(`FareQuote RAW response for leg ${leg.legIndex}:`, JSON.stringify(data, null, 2));

        if (data.Error?.ErrorCode && data.Error.ErrorCode !== '0') {
          throw new Error(`SRDV Error [${data.Error.ErrorCode}]: ${data.Error.ErrorMessage}`);
        }

        return { legIndex: leg.legIndex, quote: data.Results || data.Response };
      })
    );

    return res.status(200).json({ success: true, legs: results });
  } catch (err) {
    console.error('fare-quote error (actual):', err.message);
    return res.status(409).json({ success: false, message: err.message });
  }
}