/**
 * Centralized SRDV Context Normalizer
 * Single source of truth for extracting TraceId, ResultIndex, SrdvType, SrdvIndex from legs[] or service objects.
 * EndUserIp is ALWAYS '1.1.1.1' as required by SRDV specifications.
 * Strictly adheres to provider response values without hardcoded placeholder fallbacks.
 */

function pickFirstValue(...candidates) {
  for (const val of candidates) {
    if (val !== undefined && val !== null) {
      const s = String(val).trim();
      if (s.length > 0) return s;
    }
  }
  return '';
}

export function normalizeSrdvContext(input = {}) {
  if (!input) input = {};

  const candidate = input.data || input.flight || input.service || input;
  const innerData = candidate.data || input.data || {};
  const innerFlight = candidate.flight || input.flight || {};

  const legs =
    Array.isArray(candidate.legs) && candidate.legs.length > 0
      ? candidate.legs
      : Array.isArray(input.legs) && input.legs.length > 0
      ? input.legs
      : Array.isArray(innerData.legs) && innerData.legs.length > 0
      ? innerData.legs
      : null;

  const firstLeg = legs && legs[0] ? legs[0] : null;
  const nestedContext =
    candidate.srdvContext ||
    input.srdvContext ||
    innerData.srdvContext ||
    innerFlight.srdvContext ||
    {};

  const traceId = pickFirstValue(
    firstLeg?.traceId,
    firstLeg?.TraceId,
    nestedContext.traceId,
    nestedContext.TraceId,
    candidate.traceId,
    candidate.TraceId,
    innerData.traceId,
    innerData.TraceId,
    innerFlight.traceId,
    innerFlight.TraceId,
    input.traceId,
    input.TraceId
  );

  const resultIndex = pickFirstValue(
    firstLeg?.resultIndex,
    firstLeg?.ResultIndex,
    nestedContext.resultIndex,
    nestedContext.ResultIndex,
    candidate.resultIndex,
    candidate.ResultIndex,
    innerData.resultIndex,
    innerData.ResultIndex,
    innerFlight.resultIndex,
    innerFlight.ResultIndex,
    input.resultIndex,
    input.ResultIndex
  );

  const srdvType = pickFirstValue(
    firstLeg?.srdvType,
    firstLeg?.SrdvType,
    nestedContext.srdvType,
    nestedContext.SrdvType,
    candidate.srdvType,
    candidate.SrdvType,
    innerData.srdvType,
    innerData.SrdvType,
    innerFlight.srdvType,
    innerFlight.SrdvType,
    input.srdvType,
    input.SrdvType
  );

  const srdvIndex = pickFirstValue(
    firstLeg?.srdvIndex,
    firstLeg?.SrdvIndex,
    nestedContext.srdvIndex,
    nestedContext.SrdvIndex,
    candidate.srdvIndex,
    candidate.SrdvIndex,
    innerData.srdvIndex,
    innerData.SrdvIndex,
    innerFlight.srdvIndex,
    innerFlight.SrdvIndex,
    input.srdvIndex,
    input.SrdvIndex
  );

  const legIndex =
    firstLeg?.legIndex ??
    nestedContext.legIndex ??
    candidate.legIndex ??
    input.legIndex ??
    0;

  const hotelCode =
    candidate.hotelCode ??
    candidate.HotelCode ??
    innerData.hotelCode ??
    innerData.HotelCode ??
    input.hotelCode ??
    input.HotelCode ??
    null;

  return {
    legIndex: Number(legIndex) || 0,
    traceId,
    resultIndex,
    srdvType,
    srdvIndex,
    endUserIp: '1.1.1.1',
    ...(hotelCode ? { hotelCode: String(hotelCode) } : {})
  };
}
