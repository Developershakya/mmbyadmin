export async function callSrdvApi(baseUrl, endpoint, extraPayload = {}) {
  const payload = {
    ClientId: process.env.SRDV_CLIENT_ID,
    UserName: process.env.SRDV_USERNAME,
    Password: process.env.SRDV_PASSWORD,
    EndUserIp: '1.1.1.1',
    ...extraPayload
  };

  const headers = {
    'Content-Type': 'application/json',
    'Api-Token': process.env.SRDV_API_TOKEN || ''
  };

  console.log(`Calling SRDV endpoint: ${baseUrl}/${endpoint}`);

  const response = await fetch(`${baseUrl}/${endpoint}`, {
    method: 'POST',
    headers: headers,
    body: JSON.stringify(payload)
  });

const text = await response.text();

try {
  return JSON.parse(text);
} catch (e) {
  console.error(`Non-JSON response from ${endpoint}:`, text.slice(0, 500));
  throw new Error(`SRDV ${endpoint} returned invalid response (status ${response.status})`);
}
}