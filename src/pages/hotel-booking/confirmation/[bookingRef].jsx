import { useRouter } from 'next/router';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { CheckCircle2 } from 'lucide-react';

export default function HotelBookingConfirmation() {
  const router = useRouter();
  const { bookingRef, confirmationNo, status } = router.query;

  return (
    <>
      <Header />
      <div className="bg-[#F4F6F9] min-h-screen flex items-center justify-center px-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-10 max-w-md w-full text-center">
          <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-gray-900 mb-2">Booking Confirmed!</h1>
          <p className="text-sm text-gray-500 mb-6">
            Aapki hotel booking safaltapoorvak ho gayi hai.
          </p>

          <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-left text-sm mb-6">
            <div className="flex justify-between">
              <span className="text-gray-500">Booking Reference</span>
              <span className="font-bold text-gray-900">{bookingRef}</span>
            </div>
            {confirmationNo && (
              <div className="flex justify-between">
                <span className="text-gray-500">Confirmation No.</span>
                <span className="font-bold text-gray-900">{confirmationNo}</span>
              </div>
            )}
            {status && (
              <div className="flex justify-between">
                <span className="text-gray-500">Status</span>
                <span className="font-bold text-emerald-600">{status}</span>
              </div>
            )}
          </div>

          <button
            onClick={() => router.push('/')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm px-6 py-2.5 rounded-lg transition"
          >
            Back to Home
          </button>
        </div>
      </div>
      <Footer />
    </>
  );
}