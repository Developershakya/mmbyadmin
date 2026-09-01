// components/AlertOverlay.tsx
'use client';

import { useEffect, useState } from 'react';

export default function AlertOverlay() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const icon = document.getElementById('msgIcon');
    if (icon) {
      icon.addEventListener('click', () => setIsVisible(true));
    }
    return () => {
      if (icon) icon.removeEventListener('click', () => setIsVisible(true));
    };
  }, []);

  return (
    <>
      {/* Floating Message Icon */}
      <div
        id="msgIcon"
        className="fixed top-18 right-4 bg-green-600 text-white p-3 rounded-full shadow-lg cursor-pointer text-xl z-50 animate-shake"
      >
        💬
      </div>

      {isVisible && (
        <div className="fixed bottom-20 right-4 z-40">
          {/* Close Button */}
          <button
            onClick={() => setIsVisible(false)}
            className="absolute -top-10 left-0 w-9 h-9 text-lg bg-red-600 text-white rounded-full shadow flex items-center justify-center close-btn"
          >
            &times;
          </button>

          {/* Overlay Content */}
          <div className="bg-white border rounded-lg shadow p-4 w-72 max-h-64 overflow-auto relative">
            <h6 className="text-red-600 font-semibold mb-2">
              ⚠ Important Warning – Stay Alert!
            </h6>
            <ul className="text-sm text-gray-600 list-disc list-inside mb-2">
              <li className="mb-1">Make My Bharat Yatra does not charge any money for offering jobs or employment.</li>
              <li className="mb-1">If anyone contacts you claiming to offer a job on behalf of our company and asks for payment, please do not pay.</li>
              <li className="mb-1">We never ask for money for job placement, interview, or any recruitment process.</li>
              <li className="mb-1">All official payments related to our travel services (tour packages, bookings, etc.) are accepted only in the company’s official bank account.</li>
              <li className="mb-1">We do not accept payments in any individual’s personal account, UPI, or number.</li>
              <li className="mb-1 text-red-600">Anyone asking for money in a personal account is fraud and not associated with our company.</li>
              <li className="mb-1">Please be careful of such scams and report them to us immediately.</li>
            </ul>
            <p className="text-sm text-gray-800 mb-1">
              <strong>Contact:</strong><br />
              📞 +91 9871980066<br />
              📞 +91 1204223100<br />
              📧 support@makemybharatyatra.com
            </p>
            <p className="text-sm text-red-600 mt-2">
              ⚠ If you make any payment to such individuals, our company will not be responsible for any loss or fraud caused.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
