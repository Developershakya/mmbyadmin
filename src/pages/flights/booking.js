import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Script from 'next/script';
import FlightSegmentSummary from '../../components/booking/FlightSegmentSummary';
import PassengerForm from '../../components/booking/PassengerForm';
import FareSummaryBox from '../../components/booking/FareSummaryBox';
import useAuth from '../../lib/useAuth';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function BookingPage() {
  const router = useRouter();
  const { trip, adults, children, infants } = router.query;
  const user = useAuth();

  const [legs, setLegs] = useState([]);
  const [passengers, setPassengers] = useState([]);
  const [contact, setContact] = useState({ name: '', email: '', phone: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!router.isReady) return;

    const stored = sessionStorage.getItem('selectedFlights');
    if (!stored) {
      setError('Koi flight select nahi ki gayi. Please dobara search karo.');
      setLoading(false);
      return;
    }

    const selected = JSON.parse(stored);

    async function verify() {
      try {
        const legsToVerify = Object.entries(selected)
          .map(([legIndex, f]) => ({ legIndex: Number(legIndex), f }));

        let verifiedMap = {};

        if (legsToVerify.length > 0) {
          const res = await fetch('/api/flights/fare-quote', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              legs: legsToVerify.map(({ legIndex, f }) => ({
                legIndex,
                traceId: f.traceId,
                resultIndex: f.resultIndex,
                srdvType: f.srdvType,
                srdvIndex: f.srdvIndex,
              })),
            }),
          });
          const data = await res.json();
          if (!data.success) {
            setError(data.message || 'Flight ab available nahi hai.');
            return;
          }
          verifiedMap = Object.fromEntries(data.legs.map((l) => [l.legIndex, l]));
        }

        const merged = Object.entries(selected).map(([legIndex, sel]) => {
          const verified = verifiedMap[Number(legIndex)];
          return {
            legIndex: Number(legIndex),
            ...sel,
            ...(verified
              ? {
                  traceId: verified.traceId,
                  srdvType: verified.srdvType,
                  srdvIndex: verified.srdvIndex,
                  resultIndex: verified.resultIndex,
                  price: verified.price ?? sel.price,
                }
              : {}),
          };
        });

        setLegs(merged);
      } catch (err) {
        console.error(err);
        setError('Fare verify nahi ho paaya.');
      } finally {
        setLoading(false);
      }
    }

    verify();
  }, [router.isReady]);

  useEffect(() => {
    const a = Number(adults) || 1;
    const c = Number(children) || 0;
    const i = Number(infants) || 0;
    const arr = [];
    const base = { firstName: '', lastName: '', gender: '', dob: '', contactNumber: '', email: '', passportNumber: '', passportIssueDate: '', passportExpiry: '' };
    for (let n = 0; n < a; n++) arr.push({ ...base, type: 'adult', title: 'Mr' });
    for (let n = 0; n < c; n++) arr.push({ ...base, type: 'child', title: 'Mstr' });
    for (let n = 0; n < i; n++) arr.push({ ...base, type: 'infant', title: 'Mstr' });

    // agar login karke wapas aaye hain to saved draft restore karo
    const draft = sessionStorage.getItem('bookingFormDraft');
    if (draft) {
      try {
        const parsed = JSON.parse(draft);
        setPassengers(parsed.passengers || arr);
        setContact(parsed.contact || { name: '', email: '', phone: '' });
        sessionStorage.removeItem('bookingFormDraft');
        return;
      } catch (e) {}
    }
    setPassengers(arr);
  }, [adults, children, infants]);

  const passengerCount = passengers.filter((p) => p.type !== 'infant').length || 1;
  const totalPrice = legs.reduce((sum, l) => sum + Number(l.price) * passengerCount, 0);

  function validateForm() {
    const incomplete = passengers.some((p) => !p.firstName || !p.lastName || !p.gender);
    if (incomplete) {
      alert('Please sabhi passengers ki details bharo.');
      return false;
    }
    if (!contact.name || !contact.email || !contact.phone) {
      alert('Please contact details bharo.');
      return false;
    }
    return true;
  }

  async function finalizeBooking() {
    const res = await fetch('/api/flights/book', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tripType: trip || 'oneway',
        legs: legs.map((l) => ({
          legIndex: l.legIndex,
          traceId: l.traceId,
          resultIndex: l.resultIndex,
          srdvType: l.srdvType,
          srdvIndex: l.srdvIndex,
          price: l.price,
          airline_name: l.airline_name,
          flight_number: l.flight_number,
          origin_code: l.origin_code,
          destination_code: l.destination_code,
          is_lcc: l.is_lcc,
        })),
        passengers,
        contact,
      }),
    });
    const data = await res.json();
    if (!data.success) {
      alert(data.message || 'Booking fail ho gayi.');
      return;
    }
    sessionStorage.removeItem('selectedFlights');
    router.push(`/booking/confirmation/${data.bookingRef}`);
  }

  // ⭐ Tumhare create-order.js ke response format ke hisaab se (order_id, amount, currency, key_id top-level)
  function openRazorpayCheckout(orderData) {
    const options = {
      key: orderData.key_id,
      amount: orderData.amount,
      currency: orderData.currency,
      name: 'MakeMyBharatYatra',
      description: 'Flight Booking Payment',
      order_id: orderData.order_id,
      prefill: {
        name: contact.name,
        email: contact.email,
        contact: contact.phone,
      },
      theme: { color: '#F97316' },
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
          await finalizeBooking();
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

    if (user === undefined) return; // auth check abhi load ho raha hai

    if (!user) {
      sessionStorage.setItem('bookingFormDraft', JSON.stringify({ passengers, contact }));
      router.push(`/login?redirect=${encodeURIComponent(router.asPath)}`);
      return;
    }

    setSubmitting(true);
    try {
const orderRes = await fetch('/api/holidays/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: totalPrice }),
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
      <div className="bg-[#F4F6F9] min-h-screen">
        <div className="max-w-6xl mx-auto px-4 py-6 flex flex-col md:flex-row gap-6">
          <div className="w-full md:w-2/3">
            <h1 className="text-lg font-bold text-gray-900 mb-4">Review &amp; Book</h1>

            {legs.map((leg) => (
              <FlightSegmentSummary
                key={leg.legIndex}
                flight={leg}
                legLabel={
                  legs.length > 1
                    ? `Leg ${leg.legIndex + 1}: ${leg.origin_code} → ${leg.destination_code}`
                    : `${leg.origin_code} → ${leg.destination_code}`
                }
              />
            ))}

            <div className="bg-white rounded-lg border border-gray-200 p-5 mb-4 mt-6">
              <h3 className="text-sm font-bold text-blue-900 mb-4">Contact Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input
                  placeholder="Full Name"
                  value={contact.name}
                  onChange={(e) => setContact({ ...contact, name: e.target.value })}
                  className="border border-gray-200 rounded px-3 py-2 text-sm"
                />
                <input
                  placeholder="Email"
                  value={contact.email}
                  onChange={(e) => setContact({ ...contact, email: e.target.value })}
                  className="border border-gray-200 rounded px-3 py-2 text-sm"
                />
                <input
                  placeholder="Phone"
                  value={contact.phone}
                  onChange={(e) => setContact({ ...contact, phone: e.target.value })}
                  className="border border-gray-200 rounded px-3 py-2 text-sm"
                />
              </div>
            </div>

            {passengers.map((p, idx) => {
              const sameTypeBefore = passengers.slice(0, idx).filter((x) => x.type === p.type).length;
              const label = `${p.type[0].toUpperCase() + p.type.slice(1)} ${sameTypeBefore + 1}`;
              return (
                <PassengerForm
                  key={idx}
                  label={label}
                  passenger={p}
                  flight={legs[0]}
                  onChange={(updated) => {
                    const copy = [...passengers];
                    copy[idx] = updated;
                    setPassengers(copy);
                  }}
                />
              );
            })}
          </div>

          <div className="w-full md:w-1/3">
            <FareSummaryBox
              legs={legs}
              passengerCount={passengerCount}
              totalPrice={totalPrice}
              onSubmit={handleSubmit}
              submitting={submitting}
            />
          </div>
        </div>
      </div>
       <Footer />
    </>
  );
}