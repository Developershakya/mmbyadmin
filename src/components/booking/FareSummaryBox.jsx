export default function FareSummaryBox({ legs, passengerCount, totalPrice, onSubmit, submitting }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-5 sticky top-24">
      <h3 className="text-sm font-bold text-blue-900 mb-4">Fare Summary</h3>

      <div className="space-y-2 text-sm mb-4">
        {legs.map((leg) => (
          <div key={leg.legIndex} className="flex justify-between text-gray-600">
            <span>{leg.origin_code} → {leg.destination_code}</span>
            <span className="font-medium text-gray-900">₹ {Number(leg.price).toLocaleString()}</span>
          </div>
        ))}
        <div className="flex justify-between text-gray-600">
          <span>Passengers</span>
          <span className="font-medium text-gray-900">× {passengerCount}</span>
        </div>
      </div>

      <div className="border-t border-gray-200 pt-3 flex justify-between font-bold text-gray-900 mb-5">
        <span>Total</span>
        <span>₹ {totalPrice.toLocaleString()}</span>
      </div>

      <button
        onClick={onSubmit}
        disabled={submitting}
        className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold text-sm uppercase tracking-wide py-3 rounded-lg transition"
      >
        {submitting ? 'Booking...' : 'Confirm & Book'}
      </button>
    </div>
  );
}