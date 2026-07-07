export async function callSrdvApi(baseUrl, endpoint, extraPayload = {}) {
  const payload = {
    EndUserIp: '1.1.1.1',
    ClientId: process.env.SRDV_CLIENT_ID,
    UserName: process.env.SRDV_USERNAME,
    Password: process.env.SRDV_PASSWORD,
    ...extraPayload
  };

  const response = await fetch(`${baseUrl}/${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Api-Token': process.env.SRDV_API_TOKEN
    },
    body: JSON.stringify(payload)
  });

  return response.json();
}