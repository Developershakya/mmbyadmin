"use client";
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { CheckCircle2 } from 'lucide-react';

export default function HolidayBookingConfirmation() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id;

  return (
    <>
      <Header />
      <div className="bg-[#F4F6F9] min-h-screen flex items-center justify-center px-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-10 max-w-md w-full text-center">
          <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-gray-900 mb-2">Booking Confirmed!</h1>
          <p className="text-sm text-gray-500 mb-6">
            Aapki holiday package booking safaltapoorvak ho gayi hai.
          </p>

          <div className="bg-gray-50 rounded-lg p-4 text-left text-sm mb-6 flex justify-between">
            <span className="text-gray-500">Booking ID</span>
            <span className="font-bold text-gray-900">#{id}</span>
          </div>

          <button
            onClick={() => router.push('/')}
            className="bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm px-6 py-2.5 rounded-lg transition"
          >
            Back to Home
          </button>
        </div>
      </div>
      <Footer />
    </>
  );
}