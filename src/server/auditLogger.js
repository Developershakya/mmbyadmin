import fs from 'fs';
import path from 'path';
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
  const timestamp = new Date().toISOString();
  const sanitizedRequest = sanitizePayload(requestData);
  const sanitizedResponse = sanitizePayload(responseData);

  // 1. Write to database
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
      requestJson: sanitizedRequest,
      responseJson: sanitizedResponse,
      httpStatus,
      providerErrorCode: providerErrorCode ? String(providerErrorCode) : null,
      providerErrorMessage: providerErrorMessage ? String(providerErrorMessage) : null,
      traceId: traceId ? String(traceId) : null,
      latency,
      status
    });
  } catch (err) {
    console.error('Failed to write to ServiceApiLog DB:', err.message);
  }

  // 2. Write to logs/api-YYYY-MM-DD.jsonl
  try {
    const logsDir = path.join(process.cwd(), 'logs');
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }

    const dateStr = timestamp.split('T')[0];
    const logFilePath = path.join(logsDir, `api-${dateStr}.jsonl`);

    const logEntry = {
      timestamp,
      serviceType,
      action,
      provider,
      endpoint,
      httpMethod,
      httpStatus,
      latencyMs: latency,
      traceId,
      bookingId,
      packageId,
      status,
      providerErrorCode,
      providerErrorMessage,
      request: sanitizedRequest,
      response: sanitizedResponse
    };

    await fs.promises.appendFile(logFilePath, JSON.stringify(logEntry) + '\n', 'utf8');
  } catch (err) {
    console.error('Failed to append to API JSONL log file:', err.message);
  }
}
