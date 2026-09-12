"use client";
import { useEffect, useState } from "react";

export default function SeatMapModal({ flight, onClose, onConfirm }) {
  const [seatData, setSeatData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedSeat, setSelectedSeat] = useState(null);

  useEffect(() => {
    async function fetchSeats() {
      try {
        setLoading(true);
        const res = await fetch("/api/flights/seatmap", {
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
        console.log("SEATMAP RESULT:", data);

        if (!res.ok || data.success === false) {
          setError(data.message || "Seat map could not be fetched.");
          setSeatData(null);
        } else {
          setSeatData(data.data);
        }
      } catch (err) {
        console.error(err);
        setError("Seat map could not be loaded.");
      } finally {
        setLoading(false);
      }
    }

    fetchSeats();
  }, [flight]);

  function handleConfirm() {
    if (!selectedSeat) return;
    onConfirm(selectedSeat);
  }

  const segment = seatData?.Results?.[0];

  const rows = segment
    ? Object.entries(segment.Seats)
        .map(([key, cols]) => ({
          rowNumber: parseInt(key.replace("Row", ""), 10),
          columns: cols,
        }))
        .sort((a, b) => a.rowNumber - b.rowNumber)
    : [];

  function seatClasses(seat) {
    if (seat.IsBooked) return "border-gray-200 text-gray-300 cursor-not-allowed bg-gray-50";
    if (selectedSeat === seat.SeatNumber) return "border-orange-500 bg-orange-500 text-white";
    if (seat.IsLegroom) return "border-green-400 text-green-600 hover:bg-green-50";
    if (seat.IsAisle) return "border-blue-400 text-blue-600 hover:bg-blue-50";
    return "border-gray-300 text-gray-700 hover:bg-orange-50";
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-lg w-full max-w-2xl max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b border-gray-100 p-4 flex items-center justify-between z-10">
          <h3 className="text-sm font-bold text-blue-900">Select Your Seat</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">
            &times;
          </button>
        </div>

        <div className="p-6">
          {loading && <div className="text-center text-gray-500 py-10">Loading seat map...</div>}

          {!loading && error && (
            <div className="text-center py-10">
              <p className="text-gray-500 mb-2">{error}</p>
              <p className="text-sm text-gray-400 mb-4">Seat selection is not available for this flight. You can proceed without selecting a seat.

                
              </p>
              <button onClick={onClose} className="bg-orange-500 text-white px-6 py-2.5 rounded-lg font-semibold">
                Close
              </button>
            </div>
          )}

          {!loading && !error && segment && (
            <>
              <div className="text-xs text-gray-500 mb-4">
                {segment.FromAirportCode} → {segment.ToAirportCode} · {segment.AirlineName}
              </div>

              <div className="space-y-1.5 mb-6 overflow-x-auto">
                {rows.map((row) => (
                  <div key={row.rowNumber} className="flex items-center gap-1.5">
                    <span className="w-6 text-xs text-gray-400 shrink-0">{row.rowNumber}</span>
                    {Array.from({ length: segment.TotalColumn }, (_, i) => i + 1).map((colNum) => {
                      const seat = row.columns[`Column${colNum}`];
                      if (!seat) {
                        return <span key={colNum} className="w-8 h-8 shrink-0" />; // aisle gap
                      }
                      return (
                        <button
                          key={colNum}
                          type="button"
                          disabled={seat.IsBooked}
                          onClick={() => setSelectedSeat(seat.SeatNumber)}
                          className={`w-8 h-8 shrink-0 border rounded text-[10px] font-semibold transition ${seatClasses(seat)}`}
                        >
                          {seat.SeatNumber}
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>

              <div className="flex gap-4 text-xs text-gray-600 mb-6 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <span className="w-3.5 h-3.5 border border-gray-300 rounded inline-block" /> Standard
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3.5 h-3.5 border border-green-400 rounded inline-block" /> Extra Legroom
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3.5 h-3.5 border border-blue-400 rounded inline-block" /> Aisle
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3.5 h-3.5 border border-gray-200 bg-gray-50 rounded inline-block" /> Booked
                </div>
              </div>

              <button
                type="button"
                disabled={!selectedSeat}
                onClick={handleConfirm}
                className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-40 text-white font-semibold rounded-lg px-8 py-3 transition"
              >
                Confirm Seat {selectedSeat && `(${selectedSeat})`}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}