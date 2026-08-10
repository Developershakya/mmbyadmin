import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Script from 'next/script';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import useAuth from '@/lib/useAuth';
import { CheckCircle2, X } from 'lucide-react';

export default function HotelBookingPage() {
  const router = useRouter();
  const user = useAuth();

  const [selected, setSelected] = useState(null);
  const [blockDetails, setBlockDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [showPassengerForm, setShowPassengerForm] = useState(false);
  const [passengers, setPassengers] = useState([
    { Title: 'Mr', FirstName: '', LastName: '', Email: '', Phoneno: '', PAN: '', PassportNo: '', PassportIssueDate: '', PassportExpDate: '', PaxType: '1', LeadPassenger: true },
  ]);

  // Step 1: sessionStorage se room uthao, phir BlockRoom call karo
  useEffect(() => {
    const stored = sessionStorage.getItem('selectedHotelRoom');
    if (!stored) {
      setError('Koi room select nahi kiya gaya. Please dobara try karo.');
      setLoading(false);
      return;
    }

    const parsed = JSON.parse(stored);
    setSelected(parsed);

    async function blockRoom() {
      try {
        const res = await fetch('/api/hotels/block', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            traceId: parsed.traceId,
            srdvType: parsed.srdvType,
            srdvIndex: parsed.srdvIndex,
            resultIndex: parsed.resultIndex,
            hotelCode: parsed.hotelCode,
            hotelName: parsed.hotelName,
            guestNationality: parsed.guestNationality,
            noOfRooms: parsed.noOfRooms,
            room: parsed.room,
          }),
        });
        const data = await res.json();
        if (!data.success) {
          setError(data.message || 'Room ab available nahi hai.');
          return;
        }
        setBlockDetails(data.blockDetails);
      } catch (err) {
        console.error(err);
        setError('Room price confirm nahi ho paayi.');
      } finally {
        setLoading(false);
      }
    }

    blockRoom();
  }, []);

  // Login se wapas aane par draft restore karo
  useEffect(() => {
    const draft = sessionStorage.getItem('hotelBookingDraft');
    if (draft) {
      try {
        const parsed = JSON.parse(draft);
        setPassengers(parsed.passengers || passengers);
        setShowPassengerForm(true);
        sessionStorage.removeItem('hotelBookingDraft');
      } catch (e) {}
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const roomDetail = blockDetails?.HotelRoomsDetails?.[0];
  const price = Number(roomDetail?.Price?.OfferedPrice || 0);
  const cancellationPolicies = roomDetail?.CancellationPolicies || [];
  const amenities = roomDetail?.Amenities || [];

  function addPassenger() {
    setPassengers([
      ...passengers,
      { Title: 'Mr', FirstName: '', LastName: '', Email: '', Phoneno: '', PAN: '', PassportNo: '', PassportIssueDate: '', PassportExpDate: '', PaxType: '1', LeadPassenger: false },
    ]);
  }

  function removePassenger(idx) {
    if (passengers.length === 1) return;
    setPassengers(passengers.filter((_, i) => i !== idx));
  }

  function updatePassenger(idx, field, value) {
    const copy = [...passengers];
    copy[idx] = { ...copy[idx], [field]: value };
    setPassengers(copy);
  }

  function validatePassengers() {
    for (const p of passengers) {
      if (!p.FirstName || !p.LastName || !p.Email || !p.Phoneno) {
        alert('Please sabhi passengers ki First Name, Last Name, Email, Phone bharo.');
        return false;
      }
    }
    if (roomDetail?.IsPANMandatory && !passengers[0].PAN) {
      alert('Is room ke liye PAN number zaroori hai.');
      return false;
    }
    if (roomDetail?.IsPassportMandatory && !passengers[0].PassportNo) {
      alert('Is room ke liye Passport number zaroori hai.');
      return false;
    }
    return true;
  }

  async function finalizeBooking() {
    const res = await fetch('/api/hotels/book', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        traceId: selected.traceId,
        srdvType: selected.srdvType,
        srdvIndex: selected.srdvIndex,
        resultIndex: selected.resultIndex,
        hotelCode: selected.hotelCode,
        hotelName: selected.hotelName,
        guestNationality: selected.guestNationality,
        noOfRooms: selected.noOfRooms,
        room: selected.room,
        passengers,
      }),
    });
    const data = await res.json();
    if (!data.success) {
      alert(data.message || 'Booking fail ho gayi.');
      return;
    }
    sessionStorage.removeItem('selectedHotelRoom');
    router.push(`/hotel-booking/confirmation/${data.bookingRef}?confirmationNo=${data.confirmationNo || ''}&status=${data.status || ''}`);
  }

  function openRazorpayCheckout(orderData) {
    const options = {
      key: orderData.key_id,
      amount: orderData.amount,
      currency: orderData.currency,
      name: 'MakeMyBharatYatra',
      description: 'Hotel Booking Payment',
      order_id: orderData.order_id,
      prefill: {
        name: `${passengers[0].FirstName} ${passengers[0].LastName}`,
        email: passengers[0].Email,
        contact: passengers[0].Phoneno,
      },
      theme: { color: '#2563eb' },
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

  async function handleSubmitPassengers() {
    if (!validatePassengers()) return;

    if (user === undefined) return; // auth check load ho raha hai

    if (!user) {
      sessionStorage.setItem('hotelBookingDraft', JSON.stringify({ passengers }));
      router.push(`/login?redirect=${encodeURIComponent(router.asPath)}`);
      return;
    }

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
      <div className="bg-[#F4F6F9] min-h-screen">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <div className="bg-blue-900 text-white rounded-t-xl px-6 py-4">
            <h1 className="text-lg font-bold">{blockDetails?.HotelName || selected?.hotelName}</h1>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-white rounded-b-xl shadow-sm border border-t-0 border-gray-200 p-6">
            <div className="md:col-span-2 space-y-4">
              <img
                src={selected?.image}
                alt="hotel"
                className="w-full h-64 object-cover rounded-lg"
              />

              <div>
                <h3 className="text-sm font-bold text-gray-900 mb-2">Room Amenities</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {amenities.map((a, i) => (
                    <div key={i} className="flex items-center gap-1.5 text-xs text-gray-700">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                      {a.Name}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="text-2xl font-bold text-blue-600 mb-3">
                  ₹{price.toLocaleString()}
                </div>
                {!showPassengerForm && (
                  <button
                    onClick={() => setShowPassengerForm(true)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm py-2.5 rounded-lg transition cursor-pointer"
                  >
                    Confirm Booking
                  </button>
                )}
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h3 className="text-sm font-bold text-blue-900 mb-2">Bed Configuration</h3>
                <p className="text-xs text-gray-600">{roomDetail?.RoomTypeName || roomDetail?.BedTypes}</p>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h3 className="text-sm font-bold text-blue-900 mb-2">Cancellation Policy</h3>
                <div className="space-y-2">
                  {cancellationPolicies.map((c, i) => (
                    <div key={i} className="text-xs text-gray-600 border-b border-gray-100 pb-2 last:border-0">
                      <div>From: {c.FromDate?.split('T')[0]}</div>
                      <div>To: {c.ToDate?.split('T')[0]}</div>
                      <div className="text-red-500 font-semibold">
                        Charge: {c.Charge > 0 ? `₹${c.Charge}` : 'Free'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Passenger Details Modal */}
      {showPassengerForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 relative">
            <button
              onClick={() => setShowPassengerForm(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-bold text-center mb-5">Passenger Details</h2>

            {passengers.map((p, idx) => (
              <div key={idx} className="mb-6 pb-6 border-b border-gray-100 last:border-0 last:mb-0 last:pb-0">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-sm font-bold text-gray-800">Adult Passenger {idx + 1}</h3>
                  {passengers.length > 1 && (
                    <button onClick={() => removePassenger(idx)} className="text-red-500 text-xs font-semibold">
                      Remove
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-2 mb-2">
                  <select
                    value={p.Title}
                    onChange={(e) => updatePassenger(idx, 'Title', e.target.value)}
                    className="border border-gray-200 rounded px-2 py-2 text-sm col-span-1"
                  >
                    <option value="Mr">Mr</option>
                    <option value="Mrs">Mrs</option>
                    <option value="Ms">Ms</option>
                  </select>
                  <input
                    placeholder="First Name"
                    value={p.FirstName}
                    onChange={(e) => updatePassenger(idx, 'FirstName', e.target.value)}
                    className="border border-gray-200 rounded px-3 py-2 text-sm col-span-1"
                  />
                  <input
                    placeholder="Last Name"
                    value={p.LastName}
                    onChange={(e) => updatePassenger(idx, 'LastName', e.target.value)}
                    className="border border-gray-200 rounded px-3 py-2 text-sm col-span-1"
                  />
                </div>

                <input
                  placeholder="Email Address"
                  value={p.Email}
                  onChange={(e) => updatePassenger(idx, 'Email', e.target.value)}
                  className="w-full border border-gray-200 rounded px-3 py-2 text-sm mb-2"
                />
                <input
                  placeholder="Phone Number"
                  value={p.Phoneno}
                  onChange={(e) => updatePassenger(idx, 'Phoneno', e.target.value)}
                  className="w-full border border-gray-200 rounded px-3 py-2 text-sm mb-2"
                />
                <input
                  placeholder="PAN Number (Optional)"
                  value={p.PAN}
                  onChange={(e) => updatePassenger(idx, 'PAN', e.target.value)}
                  className="w-full border border-gray-200 rounded px-3 py-2 text-sm mb-2"
                />
                <input
                  placeholder="Passport Number (Optional)"
                  value={p.PassportNo}
                  onChange={(e) => updatePassenger(idx, 'PassportNo', e.target.value)}
                  className="w-full border border-gray-200 rounded px-3 py-2 text-sm mb-2"
                />

                {idx === 0 && (
                  <label className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                    <input type="checkbox" checked disabled />
                    Lead Passenger
                  </label>
                )}
              </div>
            ))}

            <button
              onClick={addPassenger}
              className="text-blue-600 border border-blue-500 rounded-lg px-4 py-2 text-sm font-semibold hover:bg-blue-50 transition w-full mb-4"
            >
              + Add Another Passenger
            </button>

            <button
              onClick={handleSubmitPassengers}
              disabled={submitting}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm py-3 rounded-lg transition disabled:opacity-60"
            >
              {submitting ? 'Please wait...' : 'Submit All Passengers'}
            </button>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}