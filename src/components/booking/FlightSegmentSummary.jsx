import AirlineLogo from './AirlineLogo';

export default function FlightSegmentSummary({ flight, legLabel }) {
  if (!flight) return null;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-5 mb-4">
      <div className="flex items-center justify-between mb-3">
        <span className="inline-flex items-center gap-1.5 bg-blue-900 text-white text-xs font-bold px-3 py-1.5 rounded-full">
          {legLabel}
        </span>
        <span className="text-xs text-gray-400">
          {flight.is_refundable ? (
            <span className="text-emerald-600 font-semibold">Refundable</span>
          ) : (
            <span className="text-red-500 font-semibold">Non-Refundable</span>
          )}
        </span>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-[140px]">
          <AirlineLogo code={flight.airline_code} size={32} />
          <div>
            <div className="font-bold text-blue-900 text-sm">{flight.airline_name}</div>
            <div className="text-xs text-gray-400">{flight.flight_number}</div>
          </div>
        </div>

        <div className="text-center">
          <div className="text-base font-bold">{flight.departure_time}</div>
          <div className="text-xs font-semibold text-gray-500">{flight.origin_code}</div>
          {flight.origin_airport && (
            <div className="text-[10px] font-bold text-gray-600 max-w-[130px] leading-tight mt-0.5">
              {flight.origin_airport}
            </div>
          )}
        </div>

        <div className="text-center min-w-[90px]">
          <div className="text-xs text-gray-400">{flight.duration}</div>
          <div className="relative my-1 flex items-center justify-center">
            <div className="w-full border-t border-dashed border-gray-300 absolute"></div>
            <i className="fa-solid fa-plane text-xs text-emerald-500 relative bg-white px-2 z-10"></i>
          </div>
          <div className="text-xs font-bold text-emerald-500">
            {flight.stops === 0 ? 'Non Stop' : `${flight.stops} Stop`}
          </div>
        </div>

        <div className="text-center">
          <div className="text-base font-bold">{flight.arrival_time}</div>
          <div className="text-xs font-semibold text-gray-500">{flight.destination_code}</div>
          {flight.destination_airport && (
            <div className="text-[10px] font-bold text-gray-600 max-w-[130px] leading-tight mt-0.5">
              {flight.destination_airport}
            </div>
          )}
        </div>

        <div className="text-right">
          <div className="text-base font-bold text-gray-900">
            ₹ {Number(flight.price).toLocaleString()}
          </div>
          <div className="text-[10px] text-gray-400">per adult</div>
        </div>
      </div>
    </div>
  );
}