import { useRouter } from 'next/router';
 
export default function BookingConfirmation() {
  const router = useRouter();
  const { bookingRef } = router.query;
 
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F4F6F9]">
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-10 text-center max-w-md">
        <div className="text-emerald-500 text-4xl mb-4">✓</div>
        <h1 className="text-xl font-bold text-gray-900 mb-2">Booking Confirmed!</h1>
        <p className="text-sm text-gray-500 mb-4">Aapka booking reference number hai:</p>
        <div className="text-2xl font-black text-orange-500 mb-6">{bookingRef}</div>
        <p className="text-xs text-gray-400">Confirmation email jald hi bheja jaayega.</p>
      </div>
    </div>
  );
}