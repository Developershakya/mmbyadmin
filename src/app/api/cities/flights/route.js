import { callSrdvApi } from '@/lib/srdvApi';
import { NextResponse } from "next/server";
export async function POST(request) {

  const { adultCount, childCount, infantCount, journeyType, segments } = await request.json();

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
      return NextResponse.json({
        success: true,
        traceId: data.TraceId,
        results: data.Results
      });
    }
    return NextResponse.json({ success: false, message: 'No flights found' });
  } catch (error) {
    console.error("Flight city API error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
