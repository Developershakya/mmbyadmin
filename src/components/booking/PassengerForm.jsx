"use client";
import { useState } from "react";
import SeatMapModal from "./SeatMapModal";
import MealModal from "./MealModal";
import BaggageModal from "./BaggageModal";

export default function PassengerForm({ label, passenger, onChange, flight, index = 0 }) {
  const [seatModalOpen, setSeatModalOpen] = useState(false);
  const [mealModalOpen, setMealModalOpen] = useState(false);
  const [baggageModalOpen, setBaggageModalOpen] = useState(false);

  function update(field, value) {
    onChange({ ...passenger, [field]: value });
  }

  function handleSeatConfirm(seatNumber) {
    update("selectedSeat", seatNumber);
    setSeatModalOpen(false);
  }

  function handleMealConfirm(meals) {
    // meals is an array of { Code, AirlineDescription, Price, Qty, ... }
    update("selectedMeal", meals);
    setMealModalOpen(false);
  }

  function handleBaggageConfirm(baggage) {
    update("selectedBaggage", baggage);
    setBaggageModalOpen(false);
  }

  const mealLabel = Array.isArray(passenger.selectedMeal) && passenger.selectedMeal.length > 0
    ? `Meal: ${passenger.selectedMeal.length} selected`
    : "Select Meal";

  const baggageLabel = passenger.selectedBaggage
    ? `Baggage: ${passenger.selectedBaggage.Weight ? passenger.selectedBaggage.Weight + "Kg" : passenger.selectedBaggage.Code}`
    : "Select Baggage";

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-5 mb-4">
      <h3 className="text-sm font-bold text-blue-900 mb-4">{label}</h3>

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

      <div className="border-t border-gray-100 pt-4">
        <p className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-3">
          Passport Details <span className="text-gray-400 font-normal normal-case">(For International Travel)</span>
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

      <div className="border-t border-gray-100 pt-4 mt-4">
        <p className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-3">Additional Services</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => setSeatModalOpen(true)}
            className="border border-blue-400 text-blue-600 text-xs font-semibold rounded py-2.5 hover:bg-blue-50 transition"
          >
            {passenger.selectedSeat ? `Seat: ${passenger.selectedSeat}` : "Select Seat"}
          </button>

          <button
            type="button"
            onClick={() => setMealModalOpen(true)}
            className="border border-blue-400 text-blue-600 text-xs font-semibold rounded py-2.5 hover:bg-blue-50 transition"
          >
            {mealLabel}
          </button>

          <button
            type="button"
            onClick={() => setBaggageModalOpen(true)}
            className="border border-blue-400 text-blue-600 text-xs font-semibold rounded py-2.5 hover:bg-blue-50 transition"
          >
            {baggageLabel}
          </button>
        </div>

        {Array.isArray(passenger.selectedMeal) && passenger.selectedMeal.length > 0 && (
          <div className="mt-4">
            <p className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-2">Selected Meals:</p>
            <div className="space-y-1.5">
              {passenger.selectedMeal.map((m, i) => (
                <div key={m.Code || i} className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded px-3 py-2 text-sm">
                  <span className="text-gray-700">
                    {m.AirlineDescription || m.Description || m.Code} (Qty: {m.Qty || 1})
                  </span>
                  <span className="font-semibold text-gray-800">₹{((m.Price || 0) * (m.Qty || 1)).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {seatModalOpen && (
        <SeatMapModal
          flight={flight}
          onClose={() => setSeatModalOpen(false)}
          onConfirm={handleSeatConfirm}
        />
      )}

      {mealModalOpen && (
        <MealModal
          flight={flight}
          onClose={() => setMealModalOpen(false)}
          onConfirm={handleMealConfirm}
        />
      )}

      {baggageModalOpen && (
        <BaggageModal
          flight={flight}
          onClose={() => setBaggageModalOpen(false)}
          onConfirm={handleBaggageConfirm}
        />
      )}
    </div>
  );
}