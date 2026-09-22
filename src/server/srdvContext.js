import { normalizeSrdvContext } from '../lib/srdvContext.js';

export { normalizeSrdvContext };

export function buildFlightContext(serviceOrBody) {
  return normalizeSrdvContext(serviceOrBody);
}

export function buildHotelContext(serviceOrBody) {
  return normalizeSrdvContext(serviceOrBody);
}

export function buildBusContext(serviceOrBody) {
  return normalizeSrdvContext(serviceOrBody);
}
