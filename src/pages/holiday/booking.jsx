import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Script from 'next/script';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const IMAGE_BASE = "https://makemybharatyatra.com/uploads/packages/";

export default function HolidayBookingPage() {
  const router = useRouter();

  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    altPhone: '',
    address: '',
    city: '',
    pincode: '',
    travelDate: '',
  });

  useEffect(() => {
    const stored = sessionStorage.getItem('selectedHolidayPackage');
    if (!stored) {
      setError('Koi package select nahi kiya gaya. Please dobara try karo.');
      setLoading(false);
      return;
    }
    setSelected(JSON.parse(stored));
    setLoading(false);
  }, []);

  const price = Number(selected?.price || 0);

  function updateForm(field, value) {
    setForm({ ...form, [field]: value });
  }

  function validateForm() {
    if (!form.name || !form.email || !form.phone || !form.address || !form.city || !form.pincode || !form.travelDate) {
      alert('Please saari required fields bharo.');
      return false;
    }
    return true;
  }

  async function finalizeBooking(paymentId) {
    const res = await fetch('/api/holidays/book', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: form.name,
        email: form.email,
        phone: form.phone,
        altPhone: form.altPhone,
        address: form.address,
        city: form.city,
        pincode: form.pincode,
        travelDate: form.travelDate,
        packageName: selected.packageName,
        offerPrice: price,
        razorpayPaymentId: paymentId,
      }),
    });
    const data = await res.json();
    if (!data.success) {
      alert(data.message || 'Booking save nahi ho paayi.');
      return;
    }
    sessionStorage.removeItem('selectedHolidayPackage');
    router.push(`/holiday-booking/confirmation/${data.bookingId}`);
  }

  function openRazorpayCheckout(orderData) {
    const options = {
      key: orderData.key_id,
      amount: orderData.amount,
      currency: orderData.currency,
      name: 'MakeMyBharatYatra',
      description: selected?.packageName || 'Holiday Booking Payment',
      order_id: orderData.order_id,
      prefill: {
        name: form.name,
        email: form.email,
        contact: form.phone,
      },
      theme: { color: '#ea580c' },
      handler: async function (response) {
        setSubmitting(true);
        try {
          const verifyRes = await fetch('/api/payment/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            }),
          });
          const verifyData = await verifyRes.json();
          if (!verifyData.success) {
            alert('Payment verify nahi hua. Agar paise kate hain to support se contact karo.');
            setSubmitting(false);
            return;
          }
          await finalizeBooking(response.razorpay_payment_id);
        } catch (err) {
          console.error(err);
          alert('Payment verify karte waqt error aaya.');
        } finally {
          setSubmitting(false);
        }
      },
      modal: {
        ondismiss: function () {
          setSubmitting(false);
        },
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  }

  async function handleSubmit() {
    if (!validateForm()) return;

    setSubmitting(true);
    try {
const orderRes = await fetch('/api/holidays/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: price }),
      });
      const orderData = await orderRes.json();
      if (!orderData.success) {
        alert(orderData.message || 'Payment order create nahi ho paya.');
        setSubmitting(false);
        return;
      }
      openRazorpayCheckout(orderData);
    } catch (err) {
      console.error(err);
      alert('Kuch galat ho gaya, dobara try karo.');
      setSubmitting(false);
    }
  }

  if (loading) return <div className="p-10 text-center text-gray-500">Loading...</div>;
  if (error) return <div className="p-10 text-center text-red-500">{error}</div>;

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <Header />
      <div className="bg-[#F4F6F9] min-h-screen py-8">
        <div className="max-w-3xl mx-auto px-4">
          <div className="bg-orange-500 text-white rounded-t-xl px-6 py-4">
            <h1 className="text-lg font-bold">{selected?.packageName}</h1>
          </div>

          <div className="bg-white rounded-b-xl shadow-sm border border-t-0 border-gray-200 p-6">
            <img
              src={`${IMAGE_BASE}${selected?.photo}`}
              alt="package"
              className="w-full h-56 object-cover rounded-lg mb-4"
            />
            <div className="flex justify-between items-center mb-6">
              <div className="text-sm text-gray-600">{selected?.duration} · {selected?.location}</div>
              <div className="text-2xl font-bold text-green-600">₹{price.toLocaleString('en-IN')}</div>
            </div>

            <h2 className="text-lg font-bold mb-4">Booking Details</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                placeholder="Full Name"
                value={form.name}
                onChange={(e) => updateForm('name', e.target.value)}
                className="border border-gray-200 rounded px-3 py-2 text-sm"
              />
              <input
                placeholder="Email Address"
                value={form.email}
                onChange={(e) => updateForm('email', e.target.value)}
                className="border border-gray-200 rounded px-3 py-2 text-sm"
              />
              <input
                placeholder="Phone Number"
                value={form.phone}
                onChange={(e) => updateForm('phone', e.target.value)}
                className="border border-gray-200 rounded px-3 py-2 text-sm"
              />
              <input
                placeholder="Alternate Phone (Optional)"
                value={form.altPhone}
                onChange={(e) => updateForm('altPhone', e.target.value)}
                className="border border-gray-200 rounded px-3 py-2 text-sm"
              />
              <input
                placeholder="City"
                value={form.city}
                onChange={(e) => updateForm('city', e.target.value)}
                className="border border-gray-200 rounded px-3 py-2 text-sm"
              />
              <input
                placeholder="Pincode"
                value={form.pincode}
                onChange={(e) => updateForm('pincode', e.target.value)}
                className="border border-gray-200 rounded px-3 py-2 text-sm"
              />
              <input
                type="date"
                value={form.travelDate}
                onChange={(e) => updateForm('travelDate', e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="border border-gray-200 rounded px-3 py-2 text-sm md:col-span-2"
              />
              <textarea
                placeholder="Full Address"
                value={form.address}
                onChange={(e) => updateForm('address', e.target.value)}
                className="border border-gray-200 rounded px-3 py-2 text-sm md:col-span-2"
                rows={3}
              />
            </div>

            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full mt-6 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm py-3 rounded-lg transition disabled:opacity-60"
            >
              {submitting ? 'Please wait...' : `Pay ₹${price.toLocaleString('en-IN')}`}
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}