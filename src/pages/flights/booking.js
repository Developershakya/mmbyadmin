import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import FlightSegmentSummary from '../../components/booking/FlightSegmentSummary';
import PassengerForm from '../../components/booking/PassengerForm';
import FareSummaryBox from '../../components/booking/FareSummaryBox';

export default function BookingPage() {
  const router = useRouter();
  const { trip, adults, children, infants } = router.query;

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
          .map(([legIndex, f]) => ({ legIndex: Number(legIndex), f }))
          .filter(({ f }) => !f.is_lcc);

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

        const merged = Object.entries(selected).map(([legIndex, sel]) => ({
          legIndex: Number(legIndex),
          ...sel,
        }));
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
    setPassengers(arr);
  }, [adults, children, infants]);

  const passengerCount = passengers.filter((p) => p.type !== 'infant').length || 1;
  const totalPrice = legs.reduce((sum, l) => sum + Number(l.price) * passengerCount, 0);

  async function handleSubmit() {
    const incomplete = passengers.some((p) => !p.firstName || !p.lastName || !p.gender);
    if (incomplete) {
      alert('Please sabhi passengers ki details bharo.');
      return;
    }
    if (!contact.name || !contact.email || !contact.phone) {
      alert('Please contact details bharo.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/flights/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tripType: trip || 'oneway',
          legs: legs.map((l) => ({
            legIndex: l.legIndex,
            traceId: l.traceId,
            resultIndex: l.resultIndex,
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
    } catch (err) {
      console.error(err);
      alert('Booking fail ho gayi, dobara try karo.');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <div className="p-10 text-center text-gray-500">Loading...</div>;
  if (error) return <div className="p-10 text-center text-red-500">{error}</div>;

  return (
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
  );
}