"use client";
import { useRouter } from "next/router";
import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";

export default function CabBookPage() {
  const router = useRouter();
  const {
    srdvIndex,
    traceId,
    category,
    totalAmount,
    advanceAmount,
    seating,
    fromName,
    toName,
    pickupDate,
    pickupTime,
  } = router.query;

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [dropTime, setDropTime] = useState(pickupTime || "18:00");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [bookingResult, setBookingResult] = useState(null);

  async function handleConfirmBooking(e) {
    e.preventDefault();

    if (!customerName || !customerPhone) {
      setErrorMsg("Naam aur phone number dono zaroori hain.");
      return;
    }
    if (!srdvIndex || !traceId) {
      setErrorMsg("Cab selection expire ho gayi hai, dobara search karo.");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/cabs/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          srdvIndex,
          traceId,
          pickupTime,
          dropTime,
          customerName,
          customerPhone,
          customerEmail,
          customerAddress,
        }),
      });
      const data = await res.json();
      if (!data.success) {
        setErrorMsg(data.message || "Booking fail ho gayi, dobara try karo.");
      } else {
        setBookingResult(data);
      }
    } catch (err) {
      setErrorMsg("Kuch galat ho gaya. Dobara try karo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Header />
      <section className="max-w-3xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold mb-6">Confirm Your Cab Booking</h1>

        {/* Trip summary */}
        <div className="bg-white border rounded-xl p-5 mb-6 shadow-sm">
          <p className="text-sm text-gray-500 mb-1">Route</p>
          <p className="font-semibold text-lg mb-3">
            {fromName} → {toName}
          </p>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <p><span className="text-gray-500">Cab Type:</span> {String(category).replaceAll("_", " ")}</p>
            <p><span className="text-gray-500">Seats:</span> {seating}</p>
            <p><span className="text-gray-500">Date:</span> {pickupDate}</p>
            <p><span className="text-gray-500">Pickup Time:</span> {pickupTime}</p>
            <p className="font-bold text-orange-600"><span className="text-gray-500 font-normal">Total Fare:</span> ₹{totalAmount}</p>
            <p><span className="text-gray-500">Advance:</span> ₹{advanceAmount}</p>
          </div>
        </div>

        {bookingResult ? (
          <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
            <h2 className="text-xl font-bold text-green-700 mb-2">Booking Confirmed!</h2>
            <p className="text-sm text-gray-700 mb-1">Booking ID: <strong>{bookingResult.bookingId}</strong></p>
            <p className="text-sm text-gray-700">Reference ID: {bookingResult.refId}</p>
          </div>
        ) : (
          <form onSubmit={handleConfirmBooking} className="bg-white border rounded-xl p-5 shadow-sm space-y-4">
            <div>
              <label className="text-xs uppercase font-medium text-slate-500">Full Name</label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 mt-1 text-sm"
                required
              />
            </div>

            <div>
              <label className="text-xs uppercase font-medium text-slate-500">Phone Number</label>
              <input
                type="tel"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 mt-1 text-sm"
                required
              />
            </div>

            <div>
              <label className="text-xs uppercase font-medium text-slate-500">Email</label>
              <input
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 mt-1 text-sm"
              />
            </div>

            <div>
              <label className="text-xs uppercase font-medium text-slate-500">Address</label>
              <input
                type="text"
                value={customerAddress}
                onChange={(e) => setCustomerAddress(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 mt-1 text-sm"
              />
            </div>

            <div>
              <label className="text-xs uppercase font-medium text-slate-500">Drop Time</label>
              <input
                type="time"
                value={dropTime}
                onChange={(e) => setDropTime(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 mt-1 text-sm"
              />
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {errorMsg}
              </div>
            )}

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Booking..." : "Confirm Booking"}
            </Button>
          </form>
        )}
      </section>
      <Footer />
    </>
  );
}