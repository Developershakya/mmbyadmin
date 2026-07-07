import { callSrdvApi } from '../../../lib/srdvApi';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { sourceCity, sourceCode, destinationCity, destinationCode, departDate } = req.body;

  try {
    const data = await callSrdvApi(process.env.BUS_API_URL, 'Search', {
      source_city: sourceCity,
      source_code: Number(sourceCode),
      destination_city: destinationCity,
      destination_code: Number(destinationCode),
      depart_date: departDate // format: YYYY-MM-DD
    });

    if (data.Result && data.Result.length > 0) {
      return res.status(200).json({
        success: true,
        traceId: data.TraceId,
        data: data.Result
      });
    }
    return res.status(200).json({ success: false, message: 'No buses found' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}