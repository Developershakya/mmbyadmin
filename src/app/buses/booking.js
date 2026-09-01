import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Script from 'next/script';
import useAuth from '../../lib/useAuth';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

function formatTime(dt) {
  if (!dt) return '--';
  return dt.includes('T') ? dt.split('T')[1]?.slice(0, 5) : dt;
}

export default function BusBookingPage() {
  const router = useRouter();
  const user = useAuth();

  const [bus, setBus] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);

  const [contact, setContact] = useState({ name: '', email: '', phone: '' });
  const [passengers, setPassengers] = useState([]);
  const [boardingPoint, setBoardingPoint] = useState(null);
  const [droppingPoint, setDroppingPoint] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem('selectedBusBooking');
    if (!stored) {
      setError('Koi seat select nahi ki gayi. Please dobara search karo.');
      setLoading(false);
      return;
    }

    try {
      const parsed = JSON.parse(stored);
      setBus(parsed.bus);
      setSelectedSeats(parsed.selectedSeats || []);
      setTotalPrice(parsed.totalPrice || 0);

      const draft = sessionStorage.getItem('busBookingFormDraft');
      if (draft) {
        try {
          const d = JSON.parse(draft);
          setPassengers(d.passengers || []);
          setContact(d.contact || { name: '', email: '', phone: '' });
          setBoardingPoint(d.boardingPoint || null);
          setDroppingPoint(d.droppingPoint || null);
          sessionStorage.removeItem('busBookingFormDraft');
        } catch (e) {
          setPassengers(
            (parsed.selectedSeats || []).map((s) => ({
              firstName: '', lastName: '', gender: '', age: '',
              seatName: s.seatName, seatIndex: s.seatIndex,
            }))
          );
        }
      } else {
        setPassengers(
          (parsed.selectedSeats || []).map((s) => ({
            firstName: '', lastName: '', gender: '', age: '',
            seatName: s.seatName, seatIndex: s.seatIndex,
          }))
        );
      }
    } catch (e) {
      setError('Booking data load nahi ho paaya.');
    } finally {
      setLoading(false);
    }
  }, []);

  function updatePassenger(idx, field, value) {
    const copy = [...passengers];
    copy[idx] = { ...copy[idx], [field]: value };
    setPassengers(copy);
  }

  function validateForm() {
    if (!contact.name || !contact.email || !contact.phone) {
      alert('Please contact details bharo.');
      return false;
    }
    const incomplete = passengers.some((p) => !p.firstName || !p.lastName || !p.gender || !p.age);
    if (incomplete) {
      alert('Please sabhi passengers ki details bharo.');
      return false;
    }
    if (bus?.boarding_points?.length > 0 && !boardingPoint) {
      alert('Please boarding point select karo.');
      return false;
    }
    if (bus?.dropping_points?.length > 0 && !droppingPoint) {
      alert('Please dropping point select karo.');
      return false;
    }
    return true;
  }

  async function finalizeBooking() {
    const res = await fetch('/api/buses/book', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        bus, passengers, contact, boardingPoint, droppingPoint, totalPrice,
      }),
    });
    const data = await res.json();
    if (!data.success) {
      alert(data.message || 'Booking fail ho gayi.');
      return;
    }
    sessionStorage.removeItem('selectedBusBooking');
    router.push(`/booking/confirmation/${data.bookingRef}`);
  }

  function openRazorpayCheckout(orderData) {
    const options = {
      key: orderData.key_id,
      amount: orderData.amount,
      currency: orderData.currency,
      name: 'MakeMyBharatYatra',
      description: 'Bus Booking Payment',
      order_id: orderData.order_id,
      prefill: { name: contact.name, email: contact.email, contact: contact.phone },
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
      modal: { ondismiss: function () { setSubmitting(false); } },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  }

  async function handleSubmit() {
    if (!validateForm()) return;
    if (user === undefined) return;

    if (!user) {
      sessionStorage.setItem(
        'busBookingFormDraft',
        JSON.stringify({ passengers, contact, boardingPoint, droppingPoint })
      );
      const redirectTo = encodeURIComponent(`${window.location.pathname}${window.location.search}`);
      router.push(`/login?redirect=${redirectTo}`);
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

            <div className="bg-white rounded-lg border border-gray-200 p-5 mb-6">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-bold text-blue-900">{bus.operator_name}</h3>
                  <span className="inline-block bg-blue-600 text-white text-[11px] font-semibold px-2.5 py-0.5 rounded mt-1">
                    {bus.bus_type}
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-lg font-black text-gray-900">₹ {Number(totalPrice).toLocaleString()}</div>
                  <div className="text-[11px] text-gray-400">Total for {selectedSeats.length} seat(s)</div>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-gray-600 border-t border-gray-50 pt-3">
                <div><span className="font-semibold text-gray-800">Departure: </span>{formatTime(bus.departure_time)}</div>
                <div><span className="font-semibold text-gray-800">Arrival: </span>{formatTime(bus.arrival_time)}</div>
                <div><span className="font-semibold text-gray-800">Seats: </span>{selectedSeats.map((s) => s.seatName).join(', ')}</div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-5 mb-6">
              <h3 className="text-sm font-bold text-blue-900 mb-4">Boarding &amp; Dropping Point</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1">Boarding Point</label>
                  <select
                    value={boardingPoint ? JSON.stringify(boardingPoint) : ''}
                    onChange={(e) => setBoardingPoint(e.target.value ? JSON.parse(e.target.value) : null)}
                    className="w-full border border-gray-200 rounded px-3 py-2 text-sm"
                  >
                    <option value="">Select Boarding Point</option>
                    {(bus.boarding_points || []).map((p, i) => (
                      <option key={i} value={JSON.stringify(p)}>
                        {p.CityPointLocation || p.CityPointName} — {formatTime(p.CityPointTime)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1">Dropping Point</label>
                  <select
                    value={droppingPoint ? JSON.stringify(droppingPoint) : ''}
                    onChange={(e) => setDroppingPoint(e.target.value ? JSON.parse(e.target.value) : null)}
                    className="w-full border border-gray-200 rounded px-3 py-2 text-sm"
                  >
                    <option value="">Select Dropping Point</option>
                    {(bus.dropping_points || []).map((p, i) => (
                      <option key={i} value={JSON.stringify(p)}>
                        {p.CityPointLocation || p.CityPointName} — {formatTime(p.CityPointTime)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-5 mb-4">
              <h3 className="text-sm font-bold text-blue-900 mb-4">Contact Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input placeholder="Full Name" value={contact.name} onChange={(e) => setContact({ ...contact, name: e.target.value })} className="border border-gray-200 rounded px-3 py-2 text-sm" />
                <input placeholder="Email" value={contact.email} onChange={(e) => setContact({ ...contact, email: e.target.value })} className="border border-gray-200 rounded px-3 py-2 text-sm" />
                <input placeholder="Phone" value={contact.phone} onChange={(e) => setContact({ ...contact, phone: e.target.value })} className="border border-gray-200 rounded px-3 py-2 text-sm" />
              </div>
            </div>

            {passengers.map((p, idx) => (
              <div key={idx} className="bg-white rounded-lg border border-gray-200 p-5 mb-4">
                <h3 className="text-sm font-bold text-blue-900 mb-4">
                  Passenger {idx + 1} <span className="text-xs font-normal text-gray-400">— Seat {p.seatName}</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <input placeholder="First Name" value={p.firstName} onChange={(e) => updatePassenger(idx, 'firstName', e.target.value)} className="border border-gray-200 rounded px-3 py-2 text-sm" />
                  <input placeholder="Last Name" value={p.lastName} onChange={(e) => updatePassenger(idx, 'lastName', e.target.value)} className="border border-gray-200 rounded px-3 py-2 text-sm" />
                  <select value={p.gender} onChange={(e) => updatePassenger(idx, 'gender', e.target.value)} className="border border-gray-200 rounded px-3 py-2 text-sm">
                    <option value="">Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                  <input placeholder="Age" type="number" value={p.age} onChange={(e) => updatePassenger(idx, 'age', e.target.value)} className="border border-gray-200 rounded px-3 py-2 text-sm" />
                </div>
              </div>
            ))}
          </div>

          <div className="w-full md:w-1/3">
            <div className="bg-white rounded-lg border border-gray-200 p-5 sticky top-6">
              <h3 className="text-sm font-bold text-blue-900 mb-4">Fare Summary</h3>
              <div className="flex justify-between text-xs text-gray-600 mb-2">
                <span>{bus.operator_name}</span>
                <span>₹ {Number(bus.price).toLocaleString()} x {selectedSeats.length}</span>
              </div>
              <div className="flex justify-between text-xs text-gray-600 mb-4">
                <span>Seats</span>
                <span>{selectedSeats.map((s) => s.seatName).join(', ')}</span>
              </div>
              <div className="flex justify-between items-center border-t border-gray-100 pt-4 mb-4">
                <span className="font-bold text-gray-900">Total</span>
                <span className="font-bold text-gray-900 text-lg">₹ {Number(totalPrice).toLocaleString()}</span>
              </div>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-bold text-sm py-3 rounded-lg transition-colors"
              >
                {submitting ? 'Processing...' : 'CONFIRM & BOOK'}
              </button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}