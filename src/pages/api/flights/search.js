import { callSrdvApi } from '../../../lib/srdvApi';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { adultCount, childCount, infantCount, journeyType, segments } = req.body;

  try {
    const data = await callSrdvApi(process.env.FLIGHT_API_URL, 'Search', {
      AdultCount: String(adultCount),
      ChildCount: String(childCount),
      InfantCount: String(infantCount),
      JourneyType: journeyType, // "1" One Way, "2" Round Trip
      FareType: "1",
      Segments: segments.map(seg => ({
        Origin: seg.origin.toUpperCase(),
        Destination: seg.destination.toUpperCase(),
        FlightCabinClass: "1",
        PreferredDepartureTime: `${seg.date}T00:00:00`,
        PreferredArrivalTime: `${seg.date}T23:59:00`
      }))
    });

    if (data.Results && data.Results.length > 0) {
      return res.status(200).json({
        success: true,
        traceId: data.TraceId,
        results: data.Results
      });
    }
    return res.status(200).json({ success: false, message: 'No flights found' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}