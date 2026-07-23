// components/booking/AirlineLogo.jsx
import { useState } from 'react';

export default function AirlineLogo({ code, size = 32, className = '' }) {
  const [failed, setFailed] = useState(false);

  if (!code || failed) {
    return (
      <div
        className={`bg-blue-900 text-white font-black flex items-center justify-center text-xs rounded ${className}`}
        style={{ width: size, height: size }}
      >
        {code || 'FL'}
      </div>
    );
  }

  return (
    <img
      src={`https://images.kiwi.com/airlines/64/${code}.png`}
      alt={code}
      width={size}
      height={size}
      className={`object-contain rounded ${className}`}
      onError={() => setFailed(true)}
    />
  );
}