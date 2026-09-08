import { callSrdvApi } from '@/lib/srdvApi';
import { NextResponse } from "next/server";
function parseBusItem(item, traceId) {
  return {
    id: item.ResultIndex,
    resultIndex: item.ResultIndex,
    traceId,
    operator_name: item.TravelName,
    bus_type: item.BusType,
    origin: item.BoardingPoints?.[0]?.CityPointLocation || '',
    destination: item.DroppingPoints?.[0]?.CityPointLocation || '',
    departure_time: item.DepartureTime,
    arrival_time: item.ArrivalTime,
    price: item.Price?.OfferedPrice,
    seats_available: item.AvailableSeats,
    max_seats_per_ticket: item.MaxSeatsPerTicket,
    id_proof_required: item.IdProofRequired,
    live_tracking: item.LiveTrackingAvailable,
    boarding_points: item.BoardingPoints || [],
    dropping_points: item.DroppingPoints || [],
    cancellation_policies: item.CancellationPolicies || [],
  };
}

async function resolveCityId(cityName) {
  const data = await callSrdvApi(process.env.BUS_API_URL, 'GetBusCityList', {});
  const list = data.Result?.CityList || [];
  const cleanName = cityName.trim().toLowerCase();

  let match = list.find((c) => c.CityName.trim().toLowerCase() === cleanName);
  if (!match) {
    match = list.find((c) => c.CityName.trim().toLowerCase().includes(cleanName));
  }
  return match ? match.CityId : null;
}

export async function POST(request) {
  const { sourceCity, destinationCity, journeyDate } = await request.json();

  console.log('BUS SEARCH REQUEST BODY:', { sourceCity, destinationCity, journeyDate });

  if (!sourceCity || !destinationCity || !journeyDate) {
    return NextResponse.json({
      success: false,
      message: 'sourceCity, destinationCity aur journeyDate zaroori hain',
    }, { status: 400 });
  }

  try {
    const sourceId = await resolveCityId(sourceCity);
    const destinationId = await resolveCityId(destinationCity);

    console.log('RESOLVED IDS:', { sourceCity, sourceId, destinationCity, destinationId });

    if (!sourceId || !destinationId) {
      return NextResponse.json({
        success: false,
        message: `"${sourceCity}" ya "${destinationCity}" SRDV city list me nahi mila.`,
      });
    }

    const searchPayload = {
      source_city: sourceCity,
      source_code: String(sourceId),
      destination_city: destinationCity,
      destination_code: String(destinationId),
      depart_date: journeyDate,
    };

    console.log('SEARCH PAYLOAD SENDING:', JSON.stringify(searchPayload, null, 2));

    const data = await callSrdvApi(process.env.BUS_API_URL, 'Search', searchPayload);

    console.log('RAW BUS SEARCH RESPONSE:', JSON.stringify(data, null, 2));

    if (data.Error && Number(data.Error.ErrorCode) !== 0) {
      return NextResponse.json({ success: false, message: data.Error.ErrorMessage });
    }

    const rawResults = Array.isArray(data.Result) ? data.Result : [];

    if (rawResults.length > 0) {
      const results = rawResults.map((item) => parseBusItem(item, data.TraceId));
      return NextResponse.json({ success: true, traceId: data.TraceId, results });
    }

    return NextResponse.json({ success: false, message: 'No bus was available for this route.' });
  } catch (error) {
    console.error('Bus search error:', error.message);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

