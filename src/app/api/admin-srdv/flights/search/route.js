import { NextResponse } from 'next/server';

export async function POST(request) {
  const body = await request.json();

  const origin = String(body.origin || '').trim().toUpperCase();
  const destination = String(body.destination || '').trim().toUpperCase();
  const departureDate = String(body.departureDate || '').trim();
  const preferredArrivalTime = String(body.preferredArrivalTime || body.arrivalDate || '').trim();
  const adultCount = Number(body.adultCount ?? 1) || 1;
  const childCount = Number(body.childCount ?? 0) || 0;
  const infantCount = Number(body.infantCount ?? 0) || 0;
  const directFlight = Boolean(body.directFlight);
  const flightCabinClass = Number(body.flightCabinClass ?? 0) || 0;

  if (!origin) {
    return NextResponse.json({ error: 'Missing required field: origin' }, { status: 400 });
  }
  if (!destination) {
    return NextResponse.json({ error: 'Missing required field: destination' }, { status: 400 });
  }
  if (!departureDate) {
    return NextResponse.json({ error: 'Missing required field: departureDate' }, { status: 400 });
  }
  if (!/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2})?$/.test(departureDate)) {
    return NextResponse.json({ error: 'Invalid date format: departureDate. Use yyyy-MM-dd or yyyy-MM-ddTHH:mm:ss.' }, { status: 400 });
  }

  const departureDateTime = departureDate.includes('T') ? departureDate : `${departureDate}T00:00:00`;
  const arrivalDateTime = preferredArrivalTime.includes('T')
    ? preferredArrivalTime
    : preferredArrivalTime
      ? `${preferredArrivalTime}T00:00:00`
      : (() => {
          const d = new Date(`${departureDateTime}`);
          d.setDate(d.getDate() + 4);
          return d.toISOString().slice(0, 19).replace('T', 'T');
        })();
  const flightUrl = `${(process.env.SRDV_FLIGHT_BASE_URL || process.env.SRDV_FLIGHT_URL || 'https://flight.srdvapi.com/v8/rest').replace(/\/+$/, '')}/Search`;

  const payload = {
    EndUserIp: process.env.SRDV_END_USER_IP || body.endUserIp || '1.1.1.1',
    ClientId: process.env.SRDV_CLIENT_ID || body.clientId || '',
    UserName: process.env.SRDV_USERNAME || body.userName || '',
    Password: process.env.SRDV_PASSWORD || body.password || '',
    AdultCount: adultCount,
    ChildCount: childCount,
    InfantCount: infantCount,
    JourneyType: 1,
    DirectFlight: directFlight,
    Segments: [
      {
        Origin: origin,
        Destination: destination,
        FlightCabinClass: flightCabinClass,
        PreferredDepartureTime: departureDateTime,
        PreferredArrivalTime: arrivalDateTime,
      },
    ],
  };

  console.log('SRDV flight search payload ->', JSON.stringify(payload, null, 2));

  const response = await fetch(flightUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(process.env.SRDV_API_TOKEN ? { 'Api-Token': process.env.SRDV_API_TOKEN } : {}),
    },
    body: JSON.stringify(payload),
  });

  const rawText = await response.text();
  console.log('SRDV flight search raw response status ->', response.status, rawText);

  let data;
  try {
    data = rawText ? JSON.parse(rawText) : null;
  } catch {
    data = { raw: rawText };
  }

  return Response.json(data);
}
