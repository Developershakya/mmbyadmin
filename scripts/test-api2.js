// Test different FareType values and JourneyType combinations for roundtrip
// Also test if maybe the API needs different auth or approach

const BASE_URL = 'https://flight.srdvapi.com/v8/rest';
const CREDENTIALS = {
  ClientId: '180189',
  UserName: 'MakeMy91',
  Password: 'MakeMy@910',
  EndUserIp: '1.1.1.1',
};

async function callSrdv(label, endpoint, payload) {
  const body = { ...CREDENTIALS, ...payload };
  
  const res = await fetch(`${BASE_URL}/${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Api-Token': 'MakeMy@910@23',
    },
    body: JSON.stringify(body),
  });
  
  const data = await res.json();
  console.log(`\n[${label}]`);
  console.log('  ErrorCode:', data.Error?.ErrorCode || 'none');
  console.log('  ErrorMsg:', data.Error?.ErrorMessage || 'none');
  console.log('  Has Results:', !!data.Results);
  if (data.Results) console.log('  Groups:', data.Results.length, '| Items:', data.Results[0]?.length);
  return data;
}

async function main() {
  const dep = '2026-07-17';
  const ret = '2026-07-24';

  // Test 1: RoundTrip with FareType "0" (All fares)
  await callSrdv('RoundTrip FareType=0', 'Search', {
    AdultCount: '1', ChildCount: '0', InfantCount: '0',
    JourneyType: '2', FareType: '0',
    Segments: [
      { Origin: 'DEL', Destination: 'BOM', FlightCabinClass: '1', PreferredDepartureTime: `${dep}T00:00:00`, PreferredArrivalTime: `${dep}T23:59:00` },
      { Origin: 'BOM', Destination: 'DEL', FlightCabinClass: '1', PreferredDepartureTime: `${ret}T00:00:00`, PreferredArrivalTime: `${ret}T23:59:00` },
    ],
  });

  // Test 2: RoundTrip WITHOUT Api-Token
  const res2 = await fetch(`${BASE_URL}/Search`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...CREDENTIALS,
      AdultCount: '1', ChildCount: '0', InfantCount: '0',
      JourneyType: '2', FareType: '1',
      Segments: [
        { Origin: 'DEL', Destination: 'BOM', FlightCabinClass: '1', PreferredDepartureTime: `${dep}T00:00:00`, PreferredArrivalTime: `${dep}T23:59:00` },
        { Origin: 'BOM', Destination: 'DEL', FlightCabinClass: '1', PreferredDepartureTime: `${ret}T00:00:00`, PreferredArrivalTime: `${ret}T23:59:00` },
      ],
    }),
  });
  const d2 = await res2.json();
  console.log('\n[RoundTrip NO Api-Token]');
  console.log('  ErrorCode:', d2.Error?.ErrorCode);
  console.log('  ErrorMsg:', d2.Error?.ErrorMessage);
  console.log('  Has Results:', !!d2.Results);

  // Test 3: Try 2-oneway calls to simulate roundtrip (workaround)
  console.log('\n[WORKAROUND: 2x OneWay for RoundTrip simulation]');
  const r3a = await callSrdv('OneWay leg1 DEL->BOM', 'Search', {
    AdultCount: '1', ChildCount: '0', InfantCount: '0',
    JourneyType: '1', FareType: '1',
    Segments: [{ Origin: 'DEL', Destination: 'BOM', FlightCabinClass: '1', PreferredDepartureTime: `${dep}T00:00:00`, PreferredArrivalTime: `${dep}T23:59:00` }],
  });
  const r3b = await callSrdv('OneWay leg2 BOM->DEL', 'Search', {
    AdultCount: '1', ChildCount: '0', InfantCount: '0',
    JourneyType: '1', FareType: '1',
    Segments: [{ Origin: 'BOM', Destination: 'DEL', FlightCabinClass: '1', PreferredDepartureTime: `${ret}T00:00:00`, PreferredArrivalTime: `${ret}T23:59:00` }],
  });

  // Test 4: Multi city using 2 oneway
  const r4a = await callSrdv('MultiCity via OneWay: DEL->BOM', 'Search', {
    AdultCount: '1', ChildCount: '0', InfantCount: '0',
    JourneyType: '1', FareType: '1',
    Segments: [{ Origin: 'DEL', Destination: 'BOM', FlightCabinClass: '1', PreferredDepartureTime: `${dep}T00:00:00`, PreferredArrivalTime: `${dep}T23:59:00` }],
  });
  const r4b = await callSrdv('MultiCity via OneWay: BOM->BLR', 'Search', {
    AdultCount: '1', ChildCount: '0', InfantCount: '0',
    JourneyType: '1', FareType: '1',
    Segments: [{ Origin: 'BOM', Destination: 'BLR', FlightCabinClass: '1', PreferredDepartureTime: `${ret}T00:00:00`, PreferredArrivalTime: `${ret}T23:59:00` }],
  });
}

main().catch(console.error);
