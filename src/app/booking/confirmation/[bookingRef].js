"use client";
import { useParams } from 'next/navigation';
 
export default function BookingConfirmation() {
  const params = useParams();
  const bookingRef = params?.bookingRef;
 
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F4F6F9]">
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-10 text-center max-w-md">
        <div className="text-emerald-500 text-4xl mb-4">✓</div>
        <h1 className="text-xl font-bold text-gray-900 mb-2">Booking Confirmed!</h1>
        <p className="text-sm text-gray-500 mb-4">Here is your booking reference:</p>
        <div className="text-2xl font-black text-orange-500 mb-6">{bookingRef}</div>
        <p className="text-xs text-gray-400">Confirmation email will be sent shortly.</p>
      </div>
    </div>
  );
}