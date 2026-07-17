// SRDV API direct test — roundtrip aur multicity dono
// Run: node scripts/test-api.js

const BASE_URL = 'https://flight.srdvapi.com/v8/rest';
const CREDENTIALS = {
  ClientId: '180189',
  UserName: 'MakeMy91',
  Password: 'MakeMy@910',
  EndUserIp: '1.1.1.1',
};

async function callSrdv(endpoint, payload) {
  const body = { ...CREDENTIALS, ...payload };
  console.log('\n========================================');
  console.log(`Calling: ${BASE_URL}/${endpoint}`);
  console.log('Payload:', JSON.stringify(payload, null, 2));
  
  const res = await fetch(`${BASE_URL}/${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Api-Token': 'MakeMy@910@23',
    },
    body: JSON.stringify(body),
  });
  
  const data = await res.json();
  console.log('\nHTTP Status:', res.status);
  console.log('Response Keys:', Object.keys(data));
  
  if (data.Error) {
    console.log('❌ ERROR:', JSON.stringify(data.Error, null, 2));
  }
  if (data.TraceId) {
    console.log('✅ TraceId:', data.TraceId);
  }
  if (data.Results) {
    console.log('✅ Results groups:', data.Results.length);
    data.Results.forEach((group, gi) => {
      console.log(`  Group ${gi}: ${group.length} items`);
    });
  } else {
    console.log('❌ No Results field in response');
    // Print full response for debugging
    console.log('Full response:', JSON.stringify(data, null, 2).slice(0, 2000));
  }
  return data;
}

async function main() {
  const today = new Date();
  const addDays = (d, n) => {
    const r = new Date(d);
    r.setDate(r.getDate() + n);
    return r.toISOString().slice(0, 10);
  };
  
  const dep = addDays(today, 7);   // 7 din baad departure
  const ret = addDays(today, 14);  // 14 din baad return

  console.log('\n\n🔵 TEST 1: ONE WAY (DEL → BOM)');
  await callSrdv('Search', {
    AdultCount: '1',
    ChildCount: '0',
    InfantCount: '0',
    JourneyType: '1',
    FareType: '1',
    Segments: [{
      Origin: 'DEL',
      Destination: 'BOM',
      FlightCabinClass: '1',
      PreferredDepartureTime: `${dep}T00:00:00`,
      PreferredArrivalTime: `${dep}T23:59:00`,
    }],
  });

  console.log('\n\n🔴 TEST 2: ROUND TRIP (DEL → BOM → DEL)');
  await callSrdv('Search', {
    AdultCount: '1',
    ChildCount: '0',
    InfantCount: '0',
    JourneyType: '2',
    FareType: '1',
    Segments: [
      {
        Origin: 'DEL',
        Destination: 'BOM',
        FlightCabinClass: '1',
        PreferredDepartureTime: `${dep}T00:00:00`,
        PreferredArrivalTime: `${dep}T23:59:00`,
      },
      {
        Origin: 'BOM',
        Destination: 'DEL',
        FlightCabinClass: '1',
        PreferredDepartureTime: `${ret}T00:00:00`,
        PreferredArrivalTime: `${ret}T23:59:00`,
      },
    ],
  });

  console.log('\n\n🟢 TEST 3: MULTI CITY (DEL → BOM, BOM → BLR)');
  await callSrdv('Search', {
    AdultCount: '1',
    ChildCount: '0',
    InfantCount: '0',
    JourneyType: '3',
    FareType: '1',
    Segments: [
      {
        Origin: 'DEL',
        Destination: 'BOM',
        FlightCabinClass: '1',
        PreferredDepartureTime: `${dep}T00:00:00`,
        PreferredArrivalTime: `${dep}T23:59:00`,
      },
      {
        Origin: 'BOM',
        Destination: 'BLR',
        FlightCabinClass: '1',
        PreferredDepartureTime: `${ret}T00:00:00`,
        PreferredArrivalTime: `${ret}T23:59:00`,
      },
    ],
  });
}

main().catch(console.error);
