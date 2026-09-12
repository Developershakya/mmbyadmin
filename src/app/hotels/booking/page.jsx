"use client";
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Script from 'next/script';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import useAuth from '@/lib/useAuth';
import { CheckCircle2, X, MapPin, ShieldCheck, CalendarCheck2, UserRound } from 'lucide-react';

export default function HotelBookingPage() {
  const router = useRouter();
  const pathname = usePathname();
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

  useEffect(() => {
    const stored = sessionStorage.getItem('selectedHotelRoom');
    if (!stored) {
      setError('No room selected, please go back and select a room.');
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
          setError(data.message || 'Room not available.');
          return;
        }
        setBlockDetails(data.blockDetails);
      } catch (err) {
        console.error(err);
        setError('Room price could not be confirmed.');
      } finally {
        setLoading(false);
      }
    }

    blockRoom();
  }, []);

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
        alert('Please fill in all required fields for each passenger.');
        return false;
      }
    }
    if (roomDetail?.IsPANMandatory && !passengers[0].PAN) {
      alert('PAN number is required for this room.');
      return false;
    }
    if (roomDetail?.IsPassportMandatory && !passengers[0].PassportNo) {
      alert('Passport number is required for this room.');
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
      alert(data.message || 'Booking failed.');
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
      theme: { color: '#f97316' },
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
            alert('Payment verification failed, money will be refunded.');
            setSubmitting(false);
            return;
          }
          await finalizeBooking();
        } catch (err) {
          console.error(err);
          alert('Error occurred while verifying payment.');
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

    if (user === undefined) return;

    if (!user) {
      sessionStorage.setItem('hotelBookingDraft', JSON.stringify({ passengers }));
      const redirectTo = encodeURIComponent(`${pathname}${window.location.search}`);
      router.push(`/login?redirect=${redirectTo}`);
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
        alert(orderData.message || 'Payment order creation failed.');
        setSubmitting(false);
        return;
      }
      openRazorpayCheckout(orderData);
    } catch (err) {
      console.error(err);
      alert('Something went wrong, please try again.');
      setSubmitting(false);
    }
  }

  if (loading) return <div className="p-10 text-center text-slate-500">Loading...</div>;
  if (error) return <div className="p-10 text-center text-red-500">{error}</div>;

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <Header />
      <div className="min-h-screen bg-[#f3f6fb] text-slate-800">
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-6 overflow-hidden rounded-[28px] bg-gradient-to-r from-[#0f172a] via-[#162847] to-[#1d3d69] p-6 text-white shadow-[0_16px_40px_rgba(15,23,42,0.12)]">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange-300">Secure checkout</p>
                <h1 className="mt-2 text-2xl font-black md:text-3xl">{blockDetails?.HotelName || selected?.hotelName}</h1>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-2 text-sm">
                <ShieldCheck className="h-4 w-4 text-orange-300" /> Verified booking details
              </div>
            </div>
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
            <section className="space-y-6">
              <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm">
                <div className="overflow-hidden rounded-[22px]">
                  <img src={selected?.image} alt={selected?.hotelName} className="h-72 w-full object-cover md:h-80" />
                </div>
                <div className="mt-5 flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Selected room</p>
                    <h2 className="mt-2 text-2xl font-black text-slate-900">{roomDetail?.RoomTypeName || 'Premium Stay'}</h2>
                  </div>
                  <div className="rounded-full bg-orange-100 px-3 py-2 text-sm font-bold text-orange-700">{roomDetail?.BedTypes || 'Deluxe Room'}</div>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {amenities.map((a, i) => (
                    <div key={i} className="flex items-center gap-2 rounded-2xl bg-slate-50 px-3 py-2 text-sm text-slate-700">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      {a.Name}
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-center gap-3">
                  <div className="rounded-full bg-orange-100 p-2 text-orange-600"><UserRound className="h-4 w-4" /></div>
                  <h2 className="text-xl font-black text-slate-900">Guest details</h2>
                </div>

                {!showPassengerForm ? (
                  <div className="rounded-[22px] border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
                    <p className="text-slate-600">Your booking summary is ready. Add guest information to continue.</p>
                    <button
                      onClick={() => setShowPassengerForm(true)}
                      className="mt-5 rounded-full bg-orange-500 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-orange-500/20 transition hover:bg-orange-600"
                    >
                      Continue to booking
                    </button>
                  </div>
                ) : (
                  <div className="space-y-5">
                    {passengers.map((p, idx) => (
                      <div key={idx} className="rounded-[22px] border border-slate-200 bg-slate-50 p-4">
                        <div className="mb-3 flex items-center justify-between">
                          <h3 className="text-sm font-black uppercase tracking-[0.18em] text-slate-500">Guest {idx + 1}</h3>
                          {passengers.length > 1 && (
                            <button onClick={() => removePassenger(idx)} className="text-xs font-bold text-red-500">Remove</button>
                          )}
                        </div>

                        <div className="grid gap-3 md:grid-cols-3">
                          <select value={p.Title} onChange={(e) => updatePassenger(idx, 'Title', e.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-orange-500">
                            <option value="Mr">Mr</option>
                            <option value="Mrs">Mrs</option>
                            <option value="Ms">Ms</option>
                          </select>
                          <input placeholder="First Name" value={p.FirstName} onChange={(e) => updatePassenger(idx, 'FirstName', e.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-orange-500" />
                          <input placeholder="Last Name" value={p.LastName} onChange={(e) => updatePassenger(idx, 'LastName', e.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-orange-500" />
                        </div>

                        <div className="mt-3 grid gap-3 md:grid-cols-2">
                          <input placeholder="Email Address" value={p.Email} onChange={(e) => updatePassenger(idx, 'Email', e.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-orange-500" />
                          <input placeholder="Phone Number" value={p.Phoneno} onChange={(e) => updatePassenger(idx, 'Phoneno', e.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-orange-500" />
                        </div>

                        <div className="mt-3 grid gap-3 md:grid-cols-2">
                          <input placeholder="PAN Number (Optional)" value={p.PAN} onChange={(e) => updatePassenger(idx, 'PAN', e.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-orange-500" />
                          <input placeholder="Passport Number (Optional)" value={p.PassportNo} onChange={(e) => updatePassenger(idx, 'PassportNo', e.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-orange-500" />
                        </div>

                        {idx === 0 && (
                          <label className="mt-3 inline-flex items-center gap-2 text-xs font-medium text-slate-500">
                            <input type="checkbox" checked readOnly /> Lead passenger
                          </label>
                        )}
                      </div>
                    ))}

                    <div className="flex flex-col gap-3 sm:flex-row">
                      <button onClick={addPassenger} className="rounded-full border border-orange-500 bg-orange-50 px-4 py-2.5 text-sm font-bold text-orange-600 transition hover:bg-orange-100">+ Add another guest</button>
                      <button onClick={handleSubmitPassengers} disabled={submitting} className="rounded-full bg-emerald-500 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-600 disabled:opacity-60">
                        {submitting ? 'Please wait...' : 'Submit booking'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </section>

            <aside className="space-y-6">
              <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm sticky top-24">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Payment summary</p>
                <div className="mt-5 rounded-[22px] bg-slate-900 p-4 text-white">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-300">Room rate</p>
                      <p className="mt-1 text-3xl font-black">₹{price.toLocaleString()}</p>
                    </div>
                    <div className="rounded-full bg-orange-500/15 px-2.5 py-1 text-xs font-bold text-orange-200">1 night</div>
                  </div>
                </div>

                <div className="mt-5 space-y-3 text-sm">
                  <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-3">
                    <span className="text-slate-500">Location</span>
                    <span className="flex items-center gap-2 font-semibold text-slate-700"><MapPin className="h-4 w-4 text-orange-500" /> {selected?.hotelName}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-3">
                    <span className="text-slate-500">Check-in</span>
                    <span className="font-semibold text-slate-700"><CalendarCheck2 className="mr-1 inline h-4 w-4 text-orange-500" /> Flexible</span>
                  </div>
                </div>

                <div className="mt-6 border-t border-slate-200 pt-5">
                  <h3 className="text-lg font-black text-slate-900">Cancellation</h3>
                  <div className="mt-4 space-y-3">
                    {cancellationPolicies.length === 0 ? (
                      <p className="text-sm text-slate-600">Cancellation policy not available for this room.</p>
                    ) : cancellationPolicies.map((c, i) => (
                      <div key={i} className="rounded-2xl bg-slate-50 p-3 text-xs text-slate-600">
                        <p>From: {c.FromDate?.split('T')[0]}</p>
                        <p>To: {c.ToDate?.split('T')[0]}</p>
                        <p className="mt-1 font-bold text-red-500">Charge: {c.Charge > 0 ? `₹${c.Charge}` : 'Free'}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </main>
      </div>

      {showPassengerForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[28px] bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Complete booking</p>
                <h2 className="mt-2 text-2xl font-black text-slate-900">Passenger details</h2>
              </div>
              <button onClick={() => setShowPassengerForm(false)} className="rounded-full bg-slate-100 p-2 text-slate-500 transition hover:bg-slate-200">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              {passengers.map((p, idx) => (
                <div key={idx} className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-sm font-black uppercase tracking-[0.18em] text-slate-500">Passenger {idx + 1}</h3>
                    {passengers.length > 1 && (
                      <button onClick={() => removePassenger(idx)} className="text-xs font-bold text-red-500">Remove</button>
                    )}
                  </div>
                  <div className="grid gap-3 md:grid-cols-3">
                    <select value={p.Title} onChange={(e) => updatePassenger(idx, 'Title', e.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-orange-500">
                      <option value="Mr">Mr</option>
                      <option value="Mrs">Mrs</option>
                      <option value="Ms">Ms</option>
                    </select>
                    <input placeholder="First Name" value={p.FirstName} onChange={(e) => updatePassenger(idx, 'FirstName', e.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-orange-500" />
                    <input placeholder="Last Name" value={p.LastName} onChange={(e) => updatePassenger(idx, 'LastName', e.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-orange-500" />
                  </div>
                  <div className="mt-3 grid gap-3 md:grid-cols-2">
                    <input placeholder="Email Address" value={p.Email} onChange={(e) => updatePassenger(idx, 'Email', e.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-orange-500" />
                    <input placeholder="Phone Number" value={p.Phoneno} onChange={(e) => updatePassenger(idx, 'Phoneno', e.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-orange-500" />
                  </div>
                  <div className="mt-3 grid gap-3 md:grid-cols-2">
                    <input placeholder="PAN Number (Optional)" value={p.PAN} onChange={(e) => updatePassenger(idx, 'PAN', e.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-orange-500" />
                    <input placeholder="Passport Number (Optional)" value={p.PassportNo} onChange={(e) => updatePassenger(idx, 'PassportNo', e.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-orange-500" />
                  </div>
                </div>
              ))}

              <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
                <button onClick={addPassenger} className="rounded-full border border-orange-500 bg-orange-50 px-4 py-2.5 text-sm font-bold text-orange-600 transition hover:bg-orange-100">+ Add another guest</button>
                <button onClick={handleSubmitPassengers} disabled={submitting} className="rounded-full bg-emerald-500 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-600 disabled:opacity-60">
                  {submitting ? 'Please wait...' : 'Proceed to payment'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}