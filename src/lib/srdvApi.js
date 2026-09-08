export async function callSrdvApi(baseUrl, endpoint, extraPayload = {}) {
  if (!baseUrl) {
    const error = new Error(`SRDV ${endpoint} URL is not configured`);
    error.statusCode = 500;
    throw error;
  }

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

  if (!response.ok) {
    const error = new Error(`SRDV ${endpoint} request failed with status ${response.status}`);
    error.statusCode = 502;
    error.details = text.slice(0, 500);
    throw error;
  }

  try {
    return JSON.parse(text);
  } catch (e) {
    console.error(`Non-JSON response from ${endpoint}:`, text.slice(0, 500));
    throw new Error(`SRDV ${endpoint} returned invalid response (status ${response.status})`);
  }
}

export async function callSrdvApiForm(baseUrl, endpoint, extraPayload = {}) {
  if (!baseUrl) {
    const error = new Error(`SRDV ${endpoint} URL is not configured`);
    error.statusCode = 500;
    throw error;
  }

  const payload = {
    ClientId: process.env.SRDV_CLIENT_ID,
    UserName: process.env.SRDV_USERNAME,
    Password: process.env.SRDV_PASSWORD,
    EndUserIp: '1.1.1.1',
    ...extraPayload
  };

  const formBody = new URLSearchParams();
  Object.entries(payload).forEach(([key, value]) => {
    formBody.append(key, value);
  });

  const headers = {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Api-Token': process.env.SRDV_API_TOKEN || ''
  };

  console.log(`Calling SRDV endpoint (form): ${baseUrl}/${endpoint}`);

  const response = await fetch(`${baseUrl}/${endpoint}`, {
    method: 'POST',
    headers: headers,
    body: formBody.toString()
  });

  const text = await response.text();

  if (!response.ok) {
    const error = new Error(`SRDV ${endpoint} request failed with status ${response.status}`);
    error.statusCode = 502;
    error.details = text.slice(0, 500);
    throw error;
  }

  try {
    return JSON.parse(text);
  } catch (e) {
    console.error(`Non-JSON response from ${endpoint} (form):`, text.slice(0, 500));
    throw new Error(`SRDV ${endpoint} returned invalid response (status ${response.status})`);
  }
}