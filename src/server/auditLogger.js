import { ServiceApiLog } from '../models/index.js';

const REDACTED_KEYS = new Set([
  'password',
  'Password',
  'secret',
  'Secret',
  'key_secret',
  'razorpay_secret',
  'api_token',
  'Api-Token',
  'authorization',
  'Authorization'
]);

export function sanitizePayload(data) {
  if (!data) return data;
  if (typeof data !== 'object') return data;

  if (Array.isArray(data)) {
    return data.map(item => sanitizePayload(item));
  }

  const sanitized = {};
  for (const [key, value] of Object.entries(data)) {
    if (REDACTED_KEYS.has(key) || key.toLowerCase().includes('password') || key.toLowerCase().includes('secret')) {
      sanitized[key] = '***REDACTED***';
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizePayload(value);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

export async function logApiCall({
  userId = 'usr_admin_1',
  packageId = null,
  serviceItemId = null,
  bookingId = null,
  serviceType,
  action,
  provider = 'SRDV',
  endpoint,
  httpMethod = 'POST',
  requestData,
  responseData,
  httpStatus = 200,
  providerErrorCode = null,
  providerErrorMessage = null,
  traceId = null,
  latency = 0,
  status = 'SUCCESS'
}) {
  try {
    await ServiceApiLog.create({
      userId,
      packageId,
      serviceItemId,
      bookingId,
      serviceType,
      action,
      provider,
      endpoint,
      httpMethod,
      requestJson: sanitizePayload(requestData),
      responseJson: sanitizePayload(responseData),
      httpStatus,
      providerErrorCode: providerErrorCode ? String(providerErrorCode) : null,
      providerErrorMessage: providerErrorMessage ? String(providerErrorMessage) : null,
      traceId: traceId ? String(traceId) : null,
      latency,
      status
    });
  } catch (err) {
    console.error('Failed to write to ServiceApiLog:', err.message);
  }
}
