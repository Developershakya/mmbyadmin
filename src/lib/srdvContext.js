/**
 * Centralized SRDV Context Normalizer
 * Single source of truth for extracting TraceId, ResultIndex, SrdvType, SrdvIndex from legs[] or service objects.
 * EndUserIp is ALWAYS '1.1.1.1' as required by SRDV specifications.
 */

export function normalizeSrdvContext(input = {}) {
  if (!input) input = {};

  const candidate = input.data || input.flight || input.service || input;
  const legs =
    Array.isArray(candidate.legs) && candidate.legs.length > 0
      ? candidate.legs
      : Array.isArray(input.legs) && input.legs.length > 0
      ? input.legs
      : null;

  const firstLeg = legs && legs[0] ? legs[0] : null;
  const nestedContext = candidate.srdvContext || input.srdvContext || {};

  const traceId =
    firstLeg?.traceId ??
    firstLeg?.TraceId ??
    nestedContext.traceId ??
    candidate.traceId ??
    candidate.TraceId ??
    input.traceId ??
    input.TraceId;

  const resultIndex =
    firstLeg?.resultIndex ??
    firstLeg?.ResultIndex ??
    nestedContext.resultIndex ??
    candidate.resultIndex ??
    candidate.ResultIndex ??
    input.resultIndex ??
    input.ResultIndex;

  const srdvType =
    firstLeg?.srdvType ??
    firstLeg?.SrdvType ??
    nestedContext.srdvType ??
    candidate.srdvType ??
    candidate.SrdvType ??
    input.srdvType ??
    input.SrdvType ??
    'MixAPI';

  const srdvIndex =
    firstLeg?.srdvIndex ??
    firstLeg?.SrdvIndex ??
    nestedContext.srdvIndex ??
    candidate.srdvIndex ??
    candidate.SrdvIndex ??
    input.srdvIndex ??
    input.SrdvIndex ??
    '2';

  const legIndex =
    firstLeg?.legIndex ??
    nestedContext.legIndex ??
    candidate.legIndex ??
    input.legIndex ??
    0;

  const hotelCode =
    candidate.hotelCode ??
    candidate.HotelCode ??
    input.hotelCode ??
    input.HotelCode ??
    null;

  return {
    legIndex: Number(legIndex) || 0,
    traceId: traceId !== undefined && traceId !== null ? String(traceId) : '',
    resultIndex: resultIndex !== undefined && resultIndex !== null ? String(resultIndex) : '0',
    srdvType: String(srdvType || 'MixAPI'),
    srdvIndex: String(srdvIndex || '2'),
    endUserIp: '1.1.1.1',
    ...(hotelCode ? { hotelCode: String(hotelCode) } : {})
  };
}
