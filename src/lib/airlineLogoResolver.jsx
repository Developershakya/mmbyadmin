import React, { useState } from 'react';

// Common airline name to IATA code mapping
const AIRLINE_NAME_TO_CODE = {
  spicejet: 'SG',
  indigo: '6E',
  'air india': 'AI',
  'air india express': 'IX',
  'ai express': 'IX',
  vistara: 'UK',
  'akasa air': 'QP',
  akasa: 'QP',
  'go first': 'G8',
  goair: 'G8',
  emirates: 'EK',
  etihad: 'EY',
  qatar: 'QR',
  'british airways': 'BA',
  singapore: 'SQ',
  lufthansa: 'LH'
};

export function normalizeAirlineCode(airlineCode, airlineName = '') {
  if (airlineCode && typeof airlineCode === 'string' && airlineCode.trim().length >= 2) {
    return airlineCode.trim().toUpperCase().slice(0, 3);
  }
  if (airlineName && typeof airlineName === 'string') {
    const lower = airlineName.toLowerCase().trim();
    for (const [name, code] of Object.entries(AIRLINE_NAME_TO_CODE)) {
      if (lower.includes(name)) return code;
    }
  }
  return 'SG'; // Sensible fallback
}

export function getAirlineLogo(airlineCode, airlineName = '') {
  const code = normalizeAirlineCode(airlineCode, airlineName);
  return `/images/airlines/airlines/48_48/${code}.png`;
}

export function AirlineLogo({
  code,
  name,
  className = 'w-10 h-10 object-contain rounded-md bg-white p-1 shadow-2xs border border-slate-100',
  alt = ''
}) {
  const normalized = normalizeAirlineCode(code, name);
  const [imgSrc, setImgSrc] = useState(`/images/airlines/airlines/48_48/${normalized}.png`);
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    if (!imgSrc.includes('kiwi.com')) {
      // Fallback 1: High-res CDN
      setImgSrc(`https://images.kiwi.com/airlines/64/${normalized}.png`);
    } else {
      // Fallback 2: CSS Badge
      setHasError(true);
    }
  };

  if (hasError) {
    return (
      <div
        className={`flex items-center justify-center font-bold text-[11px] rounded-md bg-slate-800 text-white select-none ${className}`}
        title={name || normalized}
      >
        {normalized}
      </div>
    );
  }

  return (
    <img
      src={imgSrc}
      alt={alt || name || normalized}
      onError={handleError}
      className={className}
      loading="lazy"
    />
  );
}

export default AirlineLogo;
