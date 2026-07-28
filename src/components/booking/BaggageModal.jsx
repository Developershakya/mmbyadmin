"use client";
import { useEffect, useState } from "react";

export default function BaggageModal({ flight, onClose, onConfirm }) {
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedCode, setSelectedCode] = useState(null);

  useEffect(() => {
    async function fetchBaggage() {
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
        console.log("BAGGAGE RESULT:", data);

        if (!res.ok || data.success === false) {
          setError(data.message || "Baggage options fetch nahi ho paye.");
          setOptions([]);
        } else {
          const raw = data.data?.Baggage || [];
          const flat = Array.isArray(raw[0]) ? raw.flat() : raw;
          setOptions(flat);
        }
      } catch (err) {
        console.error(err);
        setError("Baggage options load nahi ho paye.");
      } finally {
        setLoading(false);
      }
    }

    fetchBaggage();
  }, [flight]);

  const selectedBaggage = options.find((o, idx) => (o.Code || idx) === selectedCode) || null;

  function handleConfirm() {
    if (!selectedBaggage) return;
    onConfirm(selectedBaggage);
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-lg w-full max-w-2xl max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b border-gray-100 p-4 flex items-center justify-between z-10">
          <h3 className="text-sm font-bold text-blue-900">Select Extra Baggage</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">
            &times;
          </button>
        </div>

        <div className="p-6">
          {loading && <div className="text-center text-gray-500 py-10">Loading baggage options...</div>}

          {!loading && error && (
            <div className="text-center py-10">
              <p className="text-gray-500 mb-2">{error}</p>
              <p className="text-sm text-gray-400 mb-4">
                Is flight ke liye extra baggage available nahi hai. Aap bina baggage select kiye aage badh sakte hain.
              </p>
              <button onClick={onClose} className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-semibold">
                Close
              </button>
            </div>
          )}

          {!loading && !error && options.length > 0 && (
            <>
              <p className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-3">Baggage Options</p>
              <div className="border border-gray-200 rounded-lg overflow-hidden mb-6">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-blue-50 text-blue-900 text-left">
                      <th className="px-4 py-2.5 font-semibold">Weight</th>
                      <th className="px-4 py-2.5 font-semibold">Price (INR)</th>
                      <th className="px-4 py-2.5 font-semibold">Route</th>
                      <th className="px-4 py-2.5 font-semibold text-center">Select</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {options.map((bag, idx) => {
                      const code = bag.Code || idx;
                      const weightLabel = bag.Weight ? `${bag.Weight}Kg` : bag.Code || "Extra Baggage";
                      const route =
                        bag.Origin && bag.Destination ? `${bag.Origin} → ${bag.Destination}` : "-";
                      const isSelected = selectedCode === code;

                      return (
                        <tr
                          key={`${code}-${idx}`}
                          className={`cursor-pointer ${isSelected ? "bg-blue-50" : "hover:bg-gray-50"}`}
                          onClick={() => setSelectedCode(code)}
                        >
                          <td className="px-4 py-2.5 text-gray-700">{weightLabel}</td>
                          <td className="px-4 py-2.5 text-orange-600 font-semibold">{bag.Price} INR</td>
                          <td className="px-4 py-2.5 text-gray-500">{route}</td>
                          <td className="px-4 py-2.5 text-center">
                            <input
                              type="radio"
                              name="baggage-option"
                              checked={isSelected}
                              onChange={() => setSelectedCode(code)}
                              className="w-4 h-4 accent-blue-600"
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <button
                type="button"
                disabled={!selectedBaggage}
                onClick={handleConfirm}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-semibold rounded-lg px-8 py-3 transition"
              >
                Confirm Baggage{" "}
                {selectedBaggage && `(${selectedBaggage.Weight ? selectedBaggage.Weight + "Kg" : selectedBaggage.Code})`}
              </button>
            </>
          )}

          {!loading && !error && options.length === 0 && (
            <div className="text-center py-10">
              <p className="text-gray-500 mb-4">Is flight ke liye koi extra baggage options available nahi hain.</p>
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