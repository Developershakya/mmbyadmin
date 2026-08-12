import { callSrdvApi } from '../../../lib/srdvApi';

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

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { sourceCity, destinationCity, journeyDate } = req.body;

  if (!sourceCity || !destinationCity || !journeyDate) {
    return res.status(400).json({
      success: false,
      message: 'sourceCity, destinationCity aur journeyDate zaroori hain',
    });
  }

  try {
    const sourceId = await resolveCityId(sourceCity);
    const destinationId = await resolveCityId(destinationCity);

    if (!sourceId || !destinationId) {
      return res.status(200).json({
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

    const data = await callSrdvApi(process.env.BUS_API_URL, 'Search', searchPayload);

    if (data.Error && Number(data.Error.ErrorCode) !== 0) {
      return res.status(200).json({ success: false, message: data.Error.ErrorMessage });
    }

    const rawResults = Array.isArray(data.Result) ? data.Result : [];

    if (rawResults.length > 0) {
      const results = rawResults.map((item) => parseBusItem(item, data.TraceId));
      return res.status(200).json({ success: true, traceId: data.TraceId, results });
    }

    return res.status(200).json({ success: false, message: 'No bus was available for this route.' });
  } catch (error) {
    console.error('Bus search error:', error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
}