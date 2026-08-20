import { callSrdvApi } from '../../../lib/srdvApi';

function parseFlightItem(item, legIndex, traceId, srdvType) {
  const legs = item.Segments?.[0] || [];
  if (legs.length === 0) return null;

  const firstLeg = legs[0];
  const lastLeg = legs[legs.length - 1];
  const totalMins = lastLeg.AccumulatedDuration || 0;
  const fareData = item.FareDataMultiple?.[0] || {};
  const fareSegments = fareData.FareSegments || [];
  const fareBreakdown = fareData.FareBreakdown?.[0] || {};

  const legDetails = legs.map((leg, i) => ({
    airline_name: leg.Airline.AirlineName,
    airline_code: leg.Airline.AirlineCode,
    flight_number: leg.Airline.FlightNumber,
    origin_code: leg.Origin.AirportCode,
    origin_airport: leg.Origin.AirportName,
    origin_terminal: leg.Origin.Terminal || null,
    destination_code: leg.Destination.AirportCode,
    destination_airport: leg.Destination.AirportName,
    destination_terminal: leg.Destination.Terminal || null,
    departure_time: leg.DepTime?.split('T')[1]?.slice(0, 5) || '',
    arrival_time: leg.ArrTime?.split('T')[1]?.slice(0, 5) || '',
    duration: leg.Duration ? `${Math.floor(leg.Duration / 60)}h ${leg.Duration % 60}m` : 'N/A',
    aircraft: leg.Craft || null,
    baggage: fareSegments[i]?.Baggage || 'N/A',
    cabin_baggage: fareSegments[i]?.CabinBaggage || 'N/A',
    cabin_class: fareSegments[i]?.CabinClassName || 'N/A',
    seats_left: fareSegments[i]?.NoOfSeatAvailable,
  }));

  const fareOptions = (item.FareDataMultiple || []).map((fd) => ({
    source: fd.Source,
    price: fd.OfferedFare,
    is_refundable: fd.IsRefundable,
    result_index: fd.ResultIndex,
    srdv_index: fd.SrdvIndex, // ⭐ NEW
  }));

  // ⭐ NEW: SeatMap ke liye zaroori 2 fields
  const resultIndex = fareData.ResultIndex;
  const srdvIndex = fareData.SrdvIndex;

  return {
    id: `${resultIndex}-leg${legIndex}`,
    resultIndex,
    traceId,
    srdvType,   // ⭐ NEW
    srdvIndex,  // ⭐ NEW
    legIndex,
    airline_code: firstLeg.Airline.AirlineCode,
    airline_name: firstLeg.Airline.AirlineName,
    flight_number: legs.map((l) => l.Airline.FlightNumber).join(' / '),
    origin_code: firstLeg.Origin.AirportCode,
    origin_airport: firstLeg.Origin.AirportName,
    destination_code: lastLeg.Destination.AirportCode,
    destination_airport: lastLeg.Destination.AirportName,
    departure_time: firstLeg.DepTime?.split('T')[1]?.slice(0, 5) || '',
    arrival_time: lastLeg.ArrTime?.split('T')[1]?.slice(0, 5) || '',
    duration: totalMins > 0 ? `${Math.floor(totalMins / 60)}h ${totalMins % 60}m` : 'N/A',
    duration_minutes: totalMins,
    stops: legs.length - 1,
    price: item.OfferedFare,
    base_fare: fareBreakdown.BaseFare,
    tax: fareBreakdown.Tax,
    yq_tax: fareBreakdown.YQTax,
    published_fare: fareData.Fare?.PublishedFare,
    is_refundable: fareData.IsRefundable,
    baggage: fareSegments[0]?.Baggage || 'N/A',
    cabin_baggage: fareSegments[0]?.CabinBaggage || 'N/A',
    cabin_class: fareSegments[0]?.CabinClassName || 'N/A',
    seats_left: fareSegments[0]?.NoOfSeatAvailable,
    is_lcc: !!fareData.IsLCC,
    fareOptions,
    legDetails,
  };
}

async function searchOneLeg(adultCount, childCount, infantCount, seg) {
  const data = await callSrdvApi(process.env.FLIGHT_API_URL, 'Search', {
    AdultCount: String(adultCount),
    ChildCount: String(childCount),
    InfantCount: String(infantCount),
    JourneyType: '1',
    FareType: '1',
    Segments: [{
      Origin: seg.origin.toUpperCase(),
      Destination: seg.destination.toUpperCase(),
      FlightCabinClass: '1',
      PreferredDepartureTime: `${seg.date}T00:00:00`,
      PreferredArrivalTime: `${seg.date}T23:59:00`,
    }],
  });

  if (data.Results?.[0]?.[0]) {
    console.log('RAW FLIGHT ITEM:', JSON.stringify(data.Results[0][0], null, 2));
  }

  return data;
}

/** SRDV data object se flat results array banata hai */
function extractResults(data, legIndex) {
  if (!data.Results || data.Results.length === 0) return [];
  const results = [];
  data.Results.forEach((group) => {
    group.forEach((item) => {
      const flight = parseFlightItem(item, legIndex, data.TraceId, data.SrdvType); // ⭐ CHANGED
      if (flight) results.push(flight);
    });
  });
  return results;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { adultCount, childCount, infantCount, journeyType, segments } = req.body;

  try {
    let flatResults = [];

    if (journeyType === '1') {
      const data = await searchOneLeg(adultCount, childCount, infantCount, segments[0]);
      console.log('OneWay SRDV Error:', data.Error?.ErrorCode, data.Error?.ErrorMessage);
      flatResults = extractResults(data, 0);

    } else {
      console.log(`${journeyType === '2' ? 'RoundTrip' : 'MultiCity'}: ${segments.length} legs ko ek-ek karke search kar rahe hain`);

      const legResults = [];
      for (let idx = 0; idx < segments.length; idx++) {
        try {
          const data = await searchOneLeg(adultCount, childCount, infantCount, segments[idx]);
          console.log(`Leg ${idx} (${segments[idx].origin}->${segments[idx].destination}): Error=${data.Error?.ErrorCode}, Results=${data.Results?.length > 0 ? data.Results[0]?.length : 0}`);
          legResults.push(extractResults(data, idx));
        } catch (err) {
          console.error(`Leg ${idx} error:`, err.message);
          legResults.push([]);
        }
      }

      flatResults = legResults.flat();
    }

    if (flatResults.length > 0) {
      return res.status(200).json({ success: true, results: flatResults });
    }

    return res.status(200).json({ success: false, message: 'Is route ke liye koi flight nahi mili.' });

  } catch (error) {
    console.error('Flight search error:', error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
}