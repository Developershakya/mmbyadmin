import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const origin = String(body.origin || '').trim().toUpperCase();
    const destination = String(body.destination || '').trim().toUpperCase();
    const date = String(body.date || '').trim();

    if (!origin) {
      return NextResponse.json({ error: 'Missing required field: origin' }, { status: 400 });
    }
    if (!destination) {
      return NextResponse.json({ error: 'Missing required field: destination' }, { status: 400 });
    }
    if (!date) {
      return NextResponse.json({ error: 'Missing required field: date' }, { status: 400 });
    }
    if (!/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2})?$/.test(date)) {
      return NextResponse.json({ error: 'Invalid date format: date. Use yyyy-MM-dd or yyyy-MM-ddTHH:mm:ss.' }, { status: 400 });
    }

    const flightUrl = `${(process.env.SRDV_FLIGHT_BASE_URL || process.env.SRDV_FLIGHT_URL || 'https://flight.srdvapi.com/v8/rest').replace(/\/+$/, '')}/GetCalendarFare`;
    const payload = {
      EndUserIp: process.env.SRDV_END_USER_IP || body.endUserIp || '1.1.1.1',
      ClientId: process.env.SRDV_CLIENT_ID || body.clientId || '',
      UserName: process.env.SRDV_USERNAME || body.userName || '',
      Password: process.env.SRDV_PASSWORD || body.password || '',
      JourneyType: Number(body.journeyType ?? 1) || 1,
      FareType: body.fareType || 'Published',
      Sources: body.sources || 'All',
      Segments: [
        {
          Origin: origin,
          Destination: destination,
          FlightCabinClass: Number(body.cabinClass ?? body.flightCabinClass ?? 1) || 1,
          PreferredDepartureTime: date.includes('T') ? date : `${date}T00:00:00`,
        },
      ],
    };

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
    let data = {};

    if (rawText) {
      try {
        data = JSON.parse(rawText);
      } catch {
        data = {
          error: 'SRDV returned a non-JSON response',
          message: 'The SRDV fare-calendar endpoint responded with HTML or an unexpected payload instead of JSON.',
          raw: rawText.slice(0, 1500),
          status: response.status,
        };
      }
    }

    if (!response.ok) {
      return NextResponse.json(
        { error: data.error || 'SRDV fare-calendar request failed', message: data.message || data?.Error?.ErrorMessage || 'SRDV fare-calendar request failed', raw: data.raw || rawText.slice(0, 1500), status: response.status },
        { status: response.status || 502 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('SRDV fare-calendar proxy error:', error);
    return NextResponse.json({ error: 'SRDV fare-calendar request failed', message: error.message }, { status: error.status || 500 });
  }
}
