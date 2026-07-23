import { callSrdvApi } from '../../../lib/srdvApi';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { traceId, resultIndex } = req.body;

  try {
    const data = await callSrdvApi(process.env.FLIGHT_API_URL, 'SeatMap', {
      TraceId: traceId,
      ResultIndex: resultIndex,
    });

    console.log('SEATMAP RAW response:', JSON.stringify(data, null, 2));

    if (data.Error?.ErrorCode && data.Error.ErrorCode !== '0') {
      return res.status(409).json({ success: false, message: data.Error.ErrorMessage });
    }

    return res.status(200).json({ success: true, data });
  } catch (err) {
    console.error('seatmap error:', err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
}