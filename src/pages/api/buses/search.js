import { callSrdvApi } from '../../../lib/srdvApi';

function parseBusItem(item, traceId) {
  return {
    id: item.ServiceId || item.ResultIndex,
    resultIndex: item.ResultIndex,
    traceId,
    operator_name: item.TravelName,
    bus_type: item.BusType || item.BusTypeName,
    origin: item.BoardingPointsDetails?.[0]?.CityPointLocation || item.Origin,
    destination: item.DroppingPointsDetails?.[0]?.CityPointLocation || item.Destination,
    departure_time: item.DepartureTime?.split('T')[1]?.slice(0, 5) || item.DepartureTime,
    arrival_time: item.ArrivalTime?.split('T')[1]?.slice(0, 5) || item.ArrivalTime,
    duration: item.Duration || null,
    price: item.Fare || item.OfferedPrice,
    seats_available: item.AvailableSeats,
    rating: item.Rating || null,
    boarding_points: item.BoardingPointsDetails || [],
    dropping_points: item.DroppingPointsDetails || [],
    is_ac: item.IsAC,
    is_sleeper: item.IsSleeper,
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
  return match ? String(match.CityId) : null;
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

    console.log('RESOLVED IDS:', { sourceCity, sourceId, destinationCity, destinationId });

    if (!sourceId || !destinationId) {
      return res.status(200).json({
        success: false,
        message: `"${sourceCity}" ya "${destinationCity}" SRDV city list me nahi mila.`,
      });
    }

    const idFieldCombos = [
      { source: 'SourceId', dest: 'DestinationId' },
      { source: 'OriginId', dest: 'DestinationId' },
      { source: 'SourceCityId', dest: 'DestinationCityId' },
      { source: 'FromCityId', dest: 'ToCityId' },
    ];

    let data = null;
    let workingCombo = null;

    for (const combo of idFieldCombos) {
      const payload = {
        [combo.source]: sourceId,
        [combo.dest]: destinationId,
        DateOfJourney: journeyDate,
      };

      const attempt = await callSrdvApi(process.env.BUS_API_URL, 'Search', payload);
      console.log(`TRY combo "${combo.source}/${combo.dest}":`, JSON.stringify(attempt).slice(0, 300));

      if (!attempt.Error || (attempt.Error.ErrorCode !== '251' && attempt.Error.ErrorCode !== 251)) {
        data = attempt;
        workingCombo = combo;
        break;
      }
    }

    console.log('WORKING COMBO:', workingCombo);
    console.log('FINAL RESPONSE:', JSON.stringify(data, null, 2));

    if (!data) {
      return res.status(200).json({
        success: false,
        message: 'Koi bhi ID field combo kaam nahi kiya. Terminal check karo.',
      });
    }

    if (data.Error && data.Error.ErrorCode !== 0 && data.Error.ErrorCode !== 1) {
      return res.status(200).json({ success: false, message: data.Error.ErrorMessage });
    }

    const rawResults = data.Result?.BusRouteList || data.GetBusRouteResult || data.Results || [];

    if (rawResults.length > 0) {
      const results = rawResults.map((item) => parseBusItem(item, data.TraceId));
      return res.status(200).json({ success: true, traceId: data.TraceId, results });
    }

    return res.status(200).json({ success: false, message: 'Is route ke liye koi bus nahi mili.' });
  } catch (error) {
    console.error('Bus search error:', error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
}