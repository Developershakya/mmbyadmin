"use client";
import { useEffect, useState } from "react";

export default function MealModal({ flight, onClose, onConfirm }) {
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  // selections: { [Code]: { meal, qty } }
  const [selections, setSelections] = useState({});

  useEffect(() => {
    async function fetchMeals() {
      try {
        setLoading(true);
        const res = await fetch("/api/flights/ssr", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            traceId: flight?.traceId,
            resultIndex: flight?.resultIndex,
            srdvType: flight?.srdvType,
            srdvIndex: flight?.srdvIndex,
          }),
        });
        const data = await res.json();
        console.log("MEAL RESULT:", data);

        if (!res.ok || data.success === false) {
          setError(data.message || "Meal options could not be fetched.");
          setMeals([]);
        } else {
          const raw = data.data?.MealDynamic || [];
          const flat = Array.isArray(raw[0]) ? raw.flat() : raw;
          setMeals(flat);
        }
      } catch (err) {
        console.error(err);
        setError("Meal options could not be loaded.");
      } finally {
        setLoading(false);
      }
    }

    fetchMeals();
  }, [flight]);

  function toggleMeal(meal, code) {
    setSelections((prev) => {
      const next = { ...prev };
      if (next[code]) {
        delete next[code];
      } else {
        next[code] = { meal: { ...meal, Code: code }, qty: 1 };
      }
      return next;
    });
  }

  function changeQty(code, delta) {
    setSelections((prev) => {
      const current = prev[code];
      if (!current) return prev;
      const qty = Math.max(1, current.qty + delta);
      return { ...prev, [code]: { ...current, qty } };
    });
  }

  function removeSelection(code) {
    setSelections((prev) => {
      const next = { ...prev };
      delete next[code];
      return next;
    });
  }

  const selectedList = Object.entries(selections);
  const total = selectedList.reduce((sum, [, { meal, qty }]) => sum + (meal.Price || 0) * qty, 0);

  function handleConfirm() {
    if (selectedList.length === 0) return;
    onConfirm(selectedList.map(([code, { meal, qty }]) => ({ ...meal, Code: code, Qty: qty })));
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-lg w-full max-w-2xl max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b border-gray-100 p-4 flex items-center justify-between z-10">
          <h3 className="text-sm font-bold text-blue-900">Select Your Meal</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">
            &times;
          </button>
        </div>

        <div className="p-6">
          {loading && <div className="text-center text-gray-500 py-10">Loading meal options...</div>}

          {!loading && error && (
            <div className="text-center py-10">
              <p className="text-gray-500 mb-2">{error}</p>
              <p className="text-sm text-gray-400 mb-4">
                Meal selection is not available for this flight. You can proceed without selecting a meal.

              </p>
              <button onClick={onClose} className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-semibold">
                Close
              </button>
            </div>
          )}

          {!loading && !error && meals.length > 0 && (
            <>
              {selectedList.length > 0 && (
                <div className="mb-5 border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <p className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-2">Selected Meals:</p>
                  <div className="space-y-1.5">
                    {selectedList.map(([code, { meal, qty }]) => (
                      <div
                        key={code}
                        className="flex items-center justify-between bg-white border border-gray-200 rounded px-3 py-2 text-sm"
                      >
                        <span className="text-gray-700">
                          {meal.AirlineDescription || meal.Description || code} (Qty: {qty})
                        </span>
                        <div className="flex items-center gap-3">
                          <span className="font-semibold text-gray-800">
                            ₹{((meal.Price || 0) * qty).toFixed(2)}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeSelection(code)}
                            className="text-red-500 hover:text-red-700 font-bold"
                          >
                            &times;
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="text-sm font-bold text-gray-800 mt-3">Total: ₹{total.toFixed(2)}</p>
                </div>
              )}

              <div className="border border-gray-200 rounded-lg divide-y divide-gray-100 mb-6">
                {meals.map((meal, idx) => {
                  const code = meal.Code || `meal-${idx}`;
                  const description = meal.AirlineDescription || meal.Description || "Meal";
                  const price = meal.Price ?? 0;
                  const isChecked = !!selections[code];

                  return (
                    <div key={code} className="flex items-center justify-between px-4 py-3">
                      <label className="flex items-center gap-3 cursor-pointer flex-1">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleMeal(meal, code)}
                          className="w-4 h-4 accent-blue-600"
                        />
                        <span className="text-sm text-gray-800">{description}</span>
                      </label>

                      <div className="flex items-center gap-4">
                        <span className="text-sm font-semibold text-gray-700">₹{price}</span>
                        {isChecked && (
                          <div className="flex items-center border border-gray-300 rounded">
                            <button
                              type="button"
                              onClick={() => changeQty(code, -1)}
                              className="w-7 h-7 flex items-center justify-center text-gray-600 hover:bg-gray-100"
                            >
                              -
                            </button>
                            <span className="w-8 text-center text-sm">{selections[code].qty}</span>
                            <button
                              type="button"
                              onClick={() => changeQty(code, 1)}
                              className="w-7 h-7 flex items-center justify-center text-gray-600 hover:bg-gray-100"
                            >
                              +
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <button
                type="button"
                disabled={selectedList.length === 0}
                onClick={handleConfirm}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-semibold rounded-lg px-8 py-3 transition"
              >
                Confirm Meal{selectedList.length > 1 ? "s" : ""} {total > 0 && `(₹${total.toFixed(2)})`}
              </button>
            </>
          )}

          {!loading && !error && meals.length === 0 && (
            <div className="text-center py-10">
              <p className="text-gray-500 mb-4">No meal options are available for this flight.
</p>
              <button onClick={onClose} className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-semibold">
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}