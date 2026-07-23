export default function PassengerForm({ label, passenger, onChange, flight }) {
  function update(field, value) {
    onChange({ ...passenger, [field]: value });
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-5 mb-4">
      <h3 className="text-sm font-bold text-blue-900 mb-4">{label}</h3>

      {/* Basic Details */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
        <select
          value={passenger.title}
          onChange={(e) => update('title', e.target.value)}
          className="border border-gray-200 rounded px-3 py-2 text-sm"
        >
          <option value="Mr">Mr</option>
          <option value="Mrs">Mrs</option>
          <option value="Ms">Ms</option>
          <option value="Mstr">Mstr</option>
        </select>

        <input
          placeholder="First Name"
          value={passenger.firstName}
          onChange={(e) => update('firstName', e.target.value)}
          className="border border-gray-200 rounded px-3 py-2 text-sm md:col-span-2"
        />

        <input
          placeholder="Last Name"
          value={passenger.lastName}
          onChange={(e) => update('lastName', e.target.value)}
          className="border border-gray-200 rounded px-3 py-2 text-sm md:col-span-2"
        />

        <select
          value={passenger.gender}
          onChange={(e) => update('gender', e.target.value)}
          className="border border-gray-200 rounded px-3 py-2 text-sm"
        >
          <option value="">Gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
        </select>

        <div>
          <label className="text-xs text-gray-400 block mb-1">Date of Birth</label>
          <input
            type="date"
            value={passenger.dob}
            onChange={(e) => update('dob', e.target.value)}
            className="border border-gray-200 rounded px-3 py-2 text-sm w-full"
          />
        </div>

        <div>
          <label className="text-xs text-gray-400 block mb-1">Contact Number</label>
          <input
            placeholder="9876543210"
            value={passenger.contactNumber || ''}
            onChange={(e) => update('contactNumber', e.target.value)}
            className="border border-gray-200 rounded px-3 py-2 text-sm w-full"
          />
        </div>

        <div className="md:col-span-2">
          <label className="text-xs text-gray-400 block mb-1">Email</label>
          <input
            type="email"
            placeholder="name@example.com"
            value={passenger.email || ''}
            onChange={(e) => update('email', e.target.value)}
            className="border border-gray-200 rounded px-3 py-2 text-sm w-full"
          />
        </div>
      </div>

      {/* Passport Details — sirf international flights ke liye zaroori */}
      <div className="border-t border-gray-100 pt-4">
        <p className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-3">
          Passport Details <span className="text-gray-400 font-normal normal-case">(International ke liye)</span>
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-xs text-gray-400 block mb-1">Passport Number</label>
            <input
              value={passenger.passportNumber || ''}
              onChange={(e) => update('passportNumber', e.target.value)}
              className="border border-gray-200 rounded px-3 py-2 text-sm w-full"
            />
          </div>
          <div>
            <label className="text-xs text-gray-400 block mb-1">Passport Issue Date</label>
            <input
              type="date"
              value={passenger.passportIssueDate || ''}
              onChange={(e) => update('passportIssueDate', e.target.value)}
              className="border border-gray-200 rounded px-3 py-2 text-sm w-full"
            />
          </div>
          <div>
            <label className="text-xs text-gray-400 block mb-1">Passport Expiry</label>
            <input
              type="date"
              value={passenger.passportExpiry || ''}
              onChange={(e) => update('passportExpiry', e.target.value)}
              className="border border-gray-200 rounded px-3 py-2 text-sm w-full"
            />
          </div>
        </div>
      </div>

      {/* Additional Services — abhi Seat test-wired hai, Meal/Baggage baad me */}
      <div className="border-t border-gray-100 pt-4 mt-4">
        <p className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-3">Additional Services</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <button
            type="button"
            onClick={async () => {
              const res = await fetch('/api/flights/seatmap', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ traceId: flight?.traceId, resultIndex: flight?.resultIndex }),
              });
              const data = await res.json();
              console.log('SEATMAP RESULT:', data);
            }}
            className="border border-orange-400 text-orange-500 text-xs font-semibold rounded py-2.5 hover:bg-orange-50 transition"
          >
            Select Seat
          </button>

          <button type="button" className="border border-orange-400 text-orange-500 text-xs font-semibold rounded py-2.5 hover:bg-orange-50 transition">
            Select Meal
          </button>

          <button type="button" className="border border-orange-400 text-orange-500 text-xs font-semibold rounded py-2.5 hover:bg-orange-50 transition">
            Select Baggage
          </button>
        </div>
      </div>
    </div>
  );
}