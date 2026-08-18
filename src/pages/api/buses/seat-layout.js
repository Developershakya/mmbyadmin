import { callSrdvApi } from '../../../lib/srdvApi';

const SEAT_LAYOUT_ENDPOINTS = [
  'GetSeatLayout',
  'SeatLayout',
  'GetBusSeatLayout',
  'BusSeatLayout',
  'GetSeatDetails',
];

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { traceId, resultIndex } = req.body;

  if (!traceId || !resultIndex) {
    return res.status(400).json({ success: false, message: 'traceId aur resultIndex zaroori hain' });
  }

  for (const endpointName of SEAT_LAYOUT_ENDPOINTS) {
    try {
      const payload = { TraceId: traceId, ResultIndex: resultIndex };
      console.log(`TRY endpoint "${endpointName}" with payload:`, JSON.stringify(payload));

      const data = await callSrdvApi(process.env.BUS_API_URL, endpointName, payload);
      console.log(`RESPONSE from "${endpointName}":`, JSON.stringify(data).slice(0, 600));

      if (!data.Error || Number(data.Error.ErrorCode) === 0) {
        console.log('WORKING ENDPOINT:', endpointName);
        console.log('FULL RESPONSE:', JSON.stringify(data, null, 2));
        return res.status(200).json({ success: true, endpoint: endpointName, data });
      }
    } catch (err) {
      console.log(`FAILED endpoint "${endpointName}":`, err.message);
    }
  }

  return res.status(200).json({
    success: false,
    message: 'Koi bhi seat layout endpoint kaam nahi kiya. Terminal check karo.',
  });
}