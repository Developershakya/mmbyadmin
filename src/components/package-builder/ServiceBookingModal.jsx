import React, { useState, useEffect } from 'react';
import {
  X,
  Plane,
  Building2,
  Bus,
  Car,
  CreditCard,
  User,
  Users,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Calendar,
  Phone,
  Mail,
  MapPin,
  ArrowRight,
  RefreshCw,
  ExternalLink,
  Receipt,
  Zap,
  Sparkles
} from 'lucide-react';
import { fetchFareQuoteApi } from '../../lib/packageBuilder/searchApi.js';
import {
  openRazorpayCheckout,
  simulateTestBooking,
  TEST_PAYMENT_CREDENTIALS
} from '../../lib/razorpayClient.js';
import { normalizeSrdvContext } from '../../lib/srdvContext.js';

const inr = (n) => '₹' + Math.round(n || 0).toLocaleString('en-IN');

export default function ServiceBookingModal({
  isOpen,
  onClose,
  service,
  dayId,
  serviceType,
  packageData,
  onBookingComplete,
  showToast = (msg, type) => console.log(msg)
}) {
  const [step, setStep] = useState('FORM'); // 'FORM' | 'PAYING' | 'CONFIRMED' | 'ERROR'
  const [validatingFare, setValidatingFare] = useState(false);
  const [fareQuoteData, setFareQuoteData] = useState(null);
  const [priceChangedNotice, setPriceChangedNotice] = useState(null);
  const [confirmedNewPrice, setConfirmedNewPrice] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [confirmedBooking, setConfirmedBooking] = useState(null);
  const [lastCheckoutContext, setLastCheckoutContext] = useState(null);
  const [isInternationalCardError, setIsInternationalCardError] = useState(false);
  const [simulatingPayment, setSimulatingPayment] = useState(false);

  // Dynamic passenger lists based on service and package traveler settings
  const adultsCount = Math.max(1, Number(packageData?.travelers?.adults || 1));
  const childrenCount = Math.max(0, Number(packageData?.travelers?.children || 0));

  const [flightPassengers, setFlightPassengers] = useState([]);
  const [hotelGuests, setHotelGuests] = useState([]);
  const [busPassengers, setBusPassengers] = useState([]);
  const [carTraveler, setCarTraveler] = useState({
    name: packageData?.customer?.name || '',
    phone: packageData?.customer?.phone || '',
    email: packageData?.customer?.email || '',
    pickupAddress: packageData?.destination || '',
    pickupTime: '09:00 AM'
  });

  // Calculate item pricing
  const [finalAmount, setFinalAmount] = useState(0);

  useEffect(() => {
    if (!isOpen || !service) return;

    setStep('FORM');
    setErrorMessage('');
    setConfirmedBooking(null);
    setPriceChangedNotice(null);
    setConfirmedNewPrice(false);

    const svcData = service.data || {};

    // Initial amount setup
    if (serviceType === 'FLIGHT') {
      const flightTotal = svcData.totalFare ?? svcData.totalPrice;
      const initialAmt = flightTotal != null ? Number(flightTotal) : (Number(svcData.fare || 5500) + Number(svcData.tax || 650));
      setFinalAmount(initialAmt);

      // Re-validate fare with SRDV FareQuote
      const srdvCtx = normalizeSrdvContext(service);
      if (srdvCtx.traceId) {
        setValidatingFare(true);
        fetchFareQuoteApi(srdvCtx)
          .then((res) => {
            const quoteRes = res?.Response?.Response || res?.Response || res;
            if (quoteRes) {
              setFareQuoteData(quoteRes);
              const quotedFare = quoteRes.FlightItinerary?.Fare?.TotalFare || quoteRes.Fare?.TotalFare;
              if (quotedFare && Number(quotedFare) !== initialAmt) {
                setPriceChangedNotice({
                  oldFare: initialAmt,
                  newFare: Number(quotedFare)
                });
                setFinalAmount(Number(quotedFare));
              }
            }
          })
          .catch((err) => {
            console.warn('[FareQuote] Re-price notice:', err.message);
          })
          .finally(() => {
            setValidatingFare(false);
          });
      }

      // Initialize Flight Passengers
      const pList = [];
      for (let i = 0; i < adultsCount; i++) {
        pList.push({
          Title: 'Mr',
          FirstName: i === 0 && packageData?.customer?.name ? packageData.customer.name.split(' ')[0] : '',
          LastName: i === 0 && packageData?.customer?.name ? packageData.customer.name.split(' ').slice(1).join(' ') || 'Traveler' : '',
          PaxType: 1,
          DateOfBirth: '1995-01-01',
          Gender: 1,
          PassportNo: '',
          PassportExpiry: '',
          PassportIssueDate: '',
          PassportIssueCountryCode: 'IN',
          AddressLine1: 'Main Street',
          City: packageData?.destination || 'Delhi',
          CountryCode: 'IN',
          CountryName: 'India',
          CellCountryCode: '91',
          ContactNo: i === 0 && packageData?.customer?.phone ? packageData.customer.phone : '9876543210',
          Email: i === 0 && packageData?.customer?.email ? packageData.customer.email : 'traveler@example.com',
          IsLeadPax: i === 0
        });
      }
      for (let i = 0; i < childrenCount; i++) {
        pList.push({
          Title: 'Mstr',
          FirstName: '',
          LastName: 'Child',
          PaxType: 2,
          DateOfBirth: '2015-05-10',
          Gender: 1,
          PassportNo: '',
          PassportExpiry: '',
          PassportIssueDate: '',
          PassportIssueCountryCode: 'IN',
          AddressLine1: 'Main Street',
          City: packageData?.destination || 'Delhi',
          CountryCode: 'IN',
          CountryName: 'India',
          CellCountryCode: '91',
          ContactNo: '9876543210',
          Email: 'traveler@example.com',
          IsLeadPax: false
        });
      }
      setFlightPassengers(pList);
    } else if (serviceType === 'HOTEL') {
      const hotelTotal = svcData.totalPrice ?? svcData.totalFare;
      const nights = Number(svcData.nights || 1);
      const initialAmt = hotelTotal != null ? Number(hotelTotal) : (Number(svcData.price || 4500) * nights);
      setFinalAmount(initialAmt);

      // Initialize Hotel Guests
      const gList = [];
      for (let i = 0; i < adultsCount; i++) {
        gList.push({
          Title: 'Mr',
          FirstName: i === 0 && packageData?.customer?.name ? packageData.customer.name.split(' ')[0] : '',
          MiddleName: '',
          LastName: i === 0 && packageData?.customer?.name ? packageData.customer.name.split(' ').slice(1).join(' ') || 'Guest' : '',
          Phoneno: i === 0 && packageData?.customer?.phone ? packageData.customer.phone : '9876543210',
          Email: i === 0 && packageData?.customer?.email ? packageData.customer.email : 'guest@example.com',
          PaxType: 1,
          LeadPassenger: i === 0,
          PAN: ''
        });
      }
      for (let i = 0; i < childrenCount; i++) {
        gList.push({
          Title: 'Master',
          FirstName: '',
          MiddleName: '',
          LastName: 'Child',
          Phoneno: '9876543210',
          Email: 'guest@example.com',
          PaxType: 2,
          LeadPassenger: false,
          PAN: ''
        });
      }
      setHotelGuests(gList);
    } else if (serviceType === 'BUS') {
      const busTotal = svcData.totalPrice ?? svcData.totalFare;
      const initialAmt = busTotal != null ? Number(busTotal) : Number(svcData.price || 1400);
      setFinalAmount(initialAmt);

      // Initialize Bus Passengers
      const bList = [];
      const seats = Array.isArray(svcData.selectedSeats) ? svcData.selectedSeats : [];
      for (let i = 0; i < adultsCount; i++) {
        bList.push({
          Title: 'Mr',
          FirstName: i === 0 && packageData?.customer?.name ? packageData.customer.name.split(' ')[0] : '',
          LastName: i === 0 && packageData?.customer?.name ? packageData.customer.name.split(' ').slice(1).join(' ') || 'Passenger' : '',
          Gender: 'Male',
          Age: 30,
          Email: i === 0 && packageData?.customer?.email ? packageData.customer.email : 'passenger@example.com',
          PhoneNo: i === 0 && packageData?.customer?.phone ? packageData.customer.phone : '9876543210',
          LeadPassenger: i === 0,
          IdType: 'Aadhar',
          IdNumber: '',
          Address: packageData?.destination || 'Delhi',
          SeatName: seats[i]?.SeatName || svcData.seatNumbers || `S${i + 1}`
        });
      }
      setBusPassengers(bList);
    } else if (serviceType === 'CAR') {
      const carTotal = svcData.totalPrice ?? svcData.totalFare ?? svcData.price;
      setFinalAmount(Number(carTotal || 2500));
      setCarTraveler({
        name: packageData?.customer?.name || 'Primary Traveler',
        phone: packageData?.customer?.phone || '9876543210',
        email: packageData?.customer?.email || 'guest@example.com',
        pickupAddress: svcData.pickup || packageData?.destination || 'Hotel / Airport',
        pickupTime: '09:00 AM'
      });
    }
  }, [isOpen, service, serviceType]);

  if (!isOpen || !service) return null;

  const svcData = service.data || {};

  // Helper to build standardized checkout item
  const buildCheckoutItem = () => {
    let rawPayload = {};
    let travelerName = '';
    let travelerEmail = '';
    let travelerPhone = '';

    const srdvCtx = normalizeSrdvContext(service);

    if (serviceType === 'FLIGHT') {
      rawPayload = {
        flightData: svcData,
        passengers: flightPassengers,
        seats: svcData.selectedSeats || [],
        ssr: svcData.ssr || {},
        traceId: srdvCtx.traceId,
        srdvType: srdvCtx.srdvType,
        srdvIndex: srdvCtx.srdvIndex,
        resultIndex: srdvCtx.resultIndex,
        fareQuote: fareQuoteData
      };
      travelerName = `${flightPassengers[0]?.FirstName || 'Traveler'} ${flightPassengers[0]?.LastName || 'Primary'}`.trim();
      travelerEmail = flightPassengers[0]?.Email || 'traveler@example.com';
      travelerPhone = flightPassengers[0]?.ContactNo || '9876543210';
    } else if (serviceType === 'HOTEL') {
      rawPayload = {
        hotelData: svcData,
        hotelCode: srdvCtx.hotelCode || svcData.hotelCode || svcData.id,
        hotelName: svcData.name || 'Hotel',
        nights: Number(svcData.nights || 1),
        rooms: Number(svcData.rooms || 1),
        guests: hotelGuests,
        traceId: srdvCtx.traceId,
        srdvType: srdvCtx.srdvType,
        srdvIndex: srdvCtx.srdvIndex,
        resultIndex: srdvCtx.resultIndex
      };
      travelerName = `${hotelGuests[0]?.FirstName || 'Guest'} ${hotelGuests[0]?.LastName || 'Primary'}`.trim();
      travelerEmail = hotelGuests[0]?.Email || 'guest@example.com';
      travelerPhone = hotelGuests[0]?.Phoneno || '9876543210';
    } else if (serviceType === 'BUS') {
      rawPayload = {
        busData: svcData,
        passengers: busPassengers,
        boardingPointId: svcData.selectedBoardingPoint?.CityPointIndex || svcData.boardingPointId,
        traceId: srdvCtx.traceId,
        srdvIndex: srdvCtx.srdvIndex,
        resultIndex: srdvCtx.resultIndex
      };
      travelerName = `${busPassengers[0]?.FirstName || 'Passenger'} ${busPassengers[0]?.LastName || 'Primary'}`.trim();
      travelerEmail = busPassengers[0]?.Email || 'passenger@example.com';
      travelerPhone = busPassengers[0]?.PhoneNo || '9876543210';
    } else if (serviceType === 'CAR') {
      rawPayload = {
        carData: svcData,
        traveler: carTraveler,
        traceId: svcData.traceId || `TRC-${Date.now()}`
      };
      travelerName = carTraveler.name || 'Traveler';
      travelerEmail = carTraveler.email || 'traveler@example.com';
      travelerPhone = carTraveler.phone || '9876543210';
    }

    return {
      amount: finalAmount,
      serviceType,
      title: svcData.name || svcData.airline || svcData.operator || svcData.vehicle || 'Travel Service',
      details: `${serviceType} reservation via Make My Bharat Yatra`,
      packageId: packageData?.id,
      serviceItemId: service.id,
      itineraryDayId: dayId,
      rawPayload,
      travelerName,
      travelerEmail,
      travelerPhone
    };
  };

  // Instant 1-Click Test Simulation to bypass gateway card restrictions
  const handleInstantTestBooking = async () => {
    try {
      setSimulatingPayment(true);
      setStep('PAYING');
      const checkoutItem = lastCheckoutContext?.checkoutItem || buildCheckoutItem();
      const existingOrderId = lastCheckoutContext?.orderId || null;

      const res = await simulateTestBooking({
        checkoutItem,
        existingOrderId
      });

      setConfirmedBooking(res.booking);
      setStep('CONFIRMED');
      showToast(`${serviceType} booking successfully confirmed with supplier!`, 'success');
      if (onBookingComplete) {
        onBookingComplete(res.booking, service, dayId);
      }
    } catch (err) {
      console.error('Instant test booking error:', err);
      const msg = err.message || 'Instant test booking simulation failed. Please retry.';
      setErrorMessage(msg);
      setStep('ERROR');
    } finally {
      setSimulatingPayment(false);
    }
  };

  // Form submission & Razorpay checkout
  const handleProceedToPayment = () => {
    // 1. Validation
    if (priceChangedNotice && !confirmedNewPrice) {
      alert('Please confirm acceptance of the airline fare change before proceeding.');
      return;
    }

    if (serviceType === 'FLIGHT') {
      for (let i = 0; i < flightPassengers.length; i++) {
        const p = flightPassengers[i];
        if (!p.FirstName.trim() || !p.LastName.trim()) {
          alert(`Please enter first and last name for Passenger ${i + 1}.`);
          return;
        }
        if (!p.ContactNo.trim() || !p.Email.trim()) {
          alert(`Please provide contact phone and email for Passenger ${i + 1}.`);
          return;
        }
      }
    } else if (serviceType === 'HOTEL') {
      for (let i = 0; i < hotelGuests.length; i++) {
        const g = hotelGuests[i];
        if (!g.FirstName.trim() || !g.LastName.trim()) {
          alert(`Please enter first and last name for Guest ${i + 1}.`);
          return;
        }
      }
    } else if (serviceType === 'BUS') {
      for (let i = 0; i < busPassengers.length; i++) {
        const b = busPassengers[i];
        if (!b.FirstName.trim() || !b.LastName.trim()) {
          alert(`Please enter first and last name for Bus Passenger ${i + 1}.`);
          return;
        }
      }
    }

    const checkoutItem = buildCheckoutItem();
    setLastCheckoutContext({ checkoutItem });

    setStep('PAYING');
    setIsInternationalCardError(false);

    openRazorpayCheckout({
      checkoutItem,
      onSuccess: (booking) => {
        setConfirmedBooking(booking);
        setStep('CONFIRMED');
        showToast(`${serviceType} booking successfully confirmed with supplier!`, 'success');
        if (onBookingComplete) {
          onBookingComplete(booking, service, dayId);
        }
      },
      onDismiss: () => {
        setStep('FORM');
        showToast('Payment was cancelled by user', 'info');
      },
      onError: (err) => {
        console.error('Booking checkout error:', err);
        const msg = err.message || 'Payment or supplier booking confirmation failed. Please retry.';
        const isIntl =
          err.isInternational ||
          err.reason === 'international_transaction_not_allowed' ||
          msg.toLowerCase().includes('international card') ||
          msg.toLowerCase().includes('international');

        setIsInternationalCardError(isIntl);
        setErrorMessage(msg);
        if (err.orderId) {
          setLastCheckoutContext((prev) => ({ ...(prev || {}), orderId: err.orderId }));
        }
        setStep('ERROR');
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 to-slate-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-orange-500/20 border border-orange-400/30 flex items-center justify-center text-orange-400">
              {serviceType === 'FLIGHT' && <Plane className="w-5 h-5" />}
              {serviceType === 'HOTEL' && <Building2 className="w-5 h-5" />}
              {serviceType === 'BUS' && <Bus className="w-5 h-5" />}
              {serviceType === 'CAR' && <Car className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg">
                Complete {serviceType} Booking
              </h3>
              <p className="text-xs text-slate-300">
                Live Supplier Reservation &amp; Instant Confirmation
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/50 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {step === 'FORM' && (
            <>
              {/* Service Summary Strip */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <span className="font-bold text-slate-900 text-sm block">
                    {svcData.name || svcData.airline || svcData.operator || svcData.vehicle || `${serviceType} Service`}
                  </span>
                  <span className="text-slate-500">
                    {serviceType === 'FLIGHT' && `${svcData.origin || 'DEL'} → ${svcData.destination || 'BOM'} • ${svcData.cabin || 'Economy'} • ${svcData.flightNumber || ''}`}
                    {serviceType === 'HOTEL' && `${svcData.room || 'Deluxe Room'} • ${svcData.nights || 1} Night(s) • ${svcData.meal || 'Breakfast Included'}`}
                    {serviceType === 'BUS' && `${svcData.from || 'Delhi'} → ${svcData.to || 'Manali'} • ${svcData.busType || 'AC Sleeper'}`}
                    {serviceType === 'CAR' && `${svcData.pickup || 'Origin'} → ${svcData.drop || 'Destination'} • ${svcData.category || 'Sedan'}`}
                  </span>
                </div>
                <div className="text-right sm:border-l sm:border-slate-200 sm:pl-4">
                  <span className="text-[11px] text-slate-500 block">Total Tariff</span>
                  <span className="text-base font-bold text-orange-600">
                    {inr(finalAmount)}
                  </span>
                </div>
              </div>

              {/* Fare Validation Indicator */}
              {validatingFare && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-center gap-2.5 text-xs text-blue-700">
                  <Loader2 className="w-4 h-4 animate-spin shrink-0 text-blue-600" />
                  <span>Verifying live fare with airline via SRDV FareQuote...</span>
                </div>
              )}

              {/* Price Change Warning Notice */}
              {priceChangedNotice && (
                <div className="p-3.5 bg-amber-50 border border-amber-300 rounded-xl space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-amber-900 font-bold">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Airline Fare Update Notice (SRDV FareQuote)</span>
                  </div>
                  <p className="text-amber-800">
                    The flight supplier updated this fare from <strong>{inr(priceChangedNotice.oldFare)}</strong> to <strong>{inr(priceChangedNotice.newFare)}</strong>.
                  </p>
                  <label className="flex items-center gap-2 text-slate-800 font-medium cursor-pointer pt-1">
                    <input
                      type="checkbox"
                      checked={confirmedNewPrice}
                      onChange={(e) => setConfirmedNewPrice(e.target.checked)}
                      className="rounded text-orange-600 focus:ring-orange-500"
                    />
                    <span>I accept the updated fare of {inr(priceChangedNotice.newFare)} to proceed with booking</span>
                  </label>
                </div>
              )}

              {/* Passenger / Guest Form Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-orange-600" />
                    <h4 className="font-bold text-sm text-slate-900">
                      {serviceType === 'FLIGHT' && 'Flight Passenger Details'}
                      {serviceType === 'HOTEL' && 'Hotel Guest Details'}
                      {serviceType === 'BUS' && 'Bus Passenger Details'}
                      {serviceType === 'CAR' && 'Primary Traveler Details'}
                    </h4>
                  </div>
                  <span className="text-xs text-slate-500">
                    Required for supplier ticket issuance
                  </span>
                </div>

                {/* FLIGHT PASSENGERS */}
                {serviceType === 'FLIGHT' && (
                  <div className="space-y-4">
                    {flightPassengers.map((pax, idx) => (
                      <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-white space-y-3 shadow-2xs">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-800">
                            Passenger {idx + 1} ({pax.PaxType === 1 ? 'Adult 12+ yrs' : pax.PaxType === 2 ? 'Child 2-12 yrs' : 'Infant'})
                            {pax.IsLeadPax && <span className="ml-2 text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-semibold">Lead Passenger</span>}
                          </span>
                        </div>
                        <div className="grid grid-cols-12 gap-2.5 text-xs">
                          <div className="col-span-3">
                            <label className="text-[11px] font-medium text-slate-600 block mb-1">Title</label>
                            <select
                              value={pax.Title}
                              onChange={(e) => {
                                const copy = [...flightPassengers];
                                copy[idx].Title = e.target.value;
                                setFlightPassengers(copy);
                              }}
                              className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                            >
                              <option value="Mr">Mr</option>
                              <option value="Mrs">Mrs</option>
                              <option value="Ms">Ms</option>
                              <option value="Mstr">Mstr</option>
                            </select>
                          </div>
                          <div className="col-span-5">
                            <label className="text-[11px] font-medium text-slate-600 block mb-1">First Name *</label>
                            <input
                              type="text"
                              required
                              placeholder="e.g. Rahul"
                              value={pax.FirstName}
                              onChange={(e) => {
                                const copy = [...flightPassengers];
                                copy[idx].FirstName = e.target.value;
                                setFlightPassengers(copy);
                              }}
                              className="w-full p-2 border border-slate-300 rounded-lg"
                            />
                          </div>
                          <div className="col-span-4">
                            <label className="text-[11px] font-medium text-slate-600 block mb-1">Last Name *</label>
                            <input
                              type="text"
                              required
                              placeholder="e.g. Sharma"
                              value={pax.LastName}
                              onChange={(e) => {
                                const copy = [...flightPassengers];
                                copy[idx].LastName = e.target.value;
                                setFlightPassengers(copy);
                              }}
                              className="w-full p-2 border border-slate-300 rounded-lg"
                            />
                          </div>

                          <div className="col-span-4">
                            <label className="text-[11px] font-medium text-slate-600 block mb-1">Date of Birth</label>
                            <input
                              type="date"
                              value={pax.DateOfBirth}
                              onChange={(e) => {
                                const copy = [...flightPassengers];
                                copy[idx].DateOfBirth = e.target.value;
                                setFlightPassengers(copy);
                              }}
                              className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                            />
                          </div>
                          <div className="col-span-4">
                            <label className="text-[11px] font-medium text-slate-600 block mb-1">Gender</label>
                            <select
                              value={pax.Gender}
                              onChange={(e) => {
                                const copy = [...flightPassengers];
                                copy[idx].Gender = Number(e.target.value);
                                setFlightPassengers(copy);
                              }}
                              className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                            >
                              <option value={1}>Male</option>
                              <option value={2}>Female</option>
                            </select>
                          </div>
                          <div className="col-span-4">
                            <label className="text-[11px] font-medium text-slate-600 block mb-1">Mobile No *</label>
                            <input
                              type="text"
                              value={pax.ContactNo}
                              onChange={(e) => {
                                const copy = [...flightPassengers];
                                copy[idx].ContactNo = e.target.value;
                                setFlightPassengers(copy);
                              }}
                              placeholder="9876543210"
                              className="w-full p-2 border border-slate-300 rounded-lg"
                            />
                          </div>

                          <div className="col-span-6">
                            <label className="text-[11px] font-medium text-slate-600 block mb-1">Email Address *</label>
                            <input
                              type="email"
                              value={pax.Email}
                              onChange={(e) => {
                                const copy = [...flightPassengers];
                                copy[idx].Email = e.target.value;
                                setFlightPassengers(copy);
                              }}
                              placeholder="traveler@example.com"
                              className="w-full p-2 border border-slate-300 rounded-lg"
                            />
                          </div>
                          <div className="col-span-6">
                            <label className="text-[11px] font-medium text-slate-600 block mb-1">City</label>
                            <input
                              type="text"
                              value={pax.City}
                              onChange={(e) => {
                                const copy = [...flightPassengers];
                                copy[idx].City = e.target.value;
                                setFlightPassengers(copy);
                              }}
                              placeholder="Delhi"
                              className="w-full p-2 border border-slate-300 rounded-lg"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* HOTEL GUESTS */}
                {serviceType === 'HOTEL' && (
                  <div className="space-y-4">
                    {hotelGuests.map((guest, idx) => (
                      <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-white space-y-3 shadow-2xs">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-800">
                            Guest {idx + 1} ({guest.PaxType === 1 ? 'Adult' : 'Child'})
                            {guest.LeadPassenger && <span className="ml-2 text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-semibold">Primary Guest</span>}
                          </span>
                        </div>
                        <div className="grid grid-cols-12 gap-2.5 text-xs">
                          <div className="col-span-3">
                            <label className="text-[11px] font-medium text-slate-600 block mb-1">Title</label>
                            <select
                              value={guest.Title}
                              onChange={(e) => {
                                const copy = [...hotelGuests];
                                copy[idx].Title = e.target.value;
                                setHotelGuests(copy);
                              }}
                              className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                            >
                              <option value="Mr">Mr</option>
                              <option value="Mrs">Mrs</option>
                              <option value="Ms">Ms</option>
                            </select>
                          </div>
                          <div className="col-span-5">
                            <label className="text-[11px] font-medium text-slate-600 block mb-1">First Name *</label>
                            <input
                              type="text"
                              required
                              placeholder="e.g. Vikram"
                              value={guest.FirstName}
                              onChange={(e) => {
                                const copy = [...hotelGuests];
                                copy[idx].FirstName = e.target.value;
                                setHotelGuests(copy);
                              }}
                              className="w-full p-2 border border-slate-300 rounded-lg"
                            />
                          </div>
                          <div className="col-span-4">
                            <label className="text-[11px] font-medium text-slate-600 block mb-1">Last Name *</label>
                            <input
                              type="text"
                              required
                              placeholder="e.g. Singh"
                              value={guest.LastName}
                              onChange={(e) => {
                                const copy = [...hotelGuests];
                                copy[idx].LastName = e.target.value;
                                setHotelGuests(copy);
                              }}
                              className="w-full p-2 border border-slate-300 rounded-lg"
                            />
                          </div>

                          <div className="col-span-6">
                            <label className="text-[11px] font-medium text-slate-600 block mb-1">Phone Number</label>
                            <input
                              type="text"
                              value={guest.Phoneno}
                              onChange={(e) => {
                                const copy = [...hotelGuests];
                                copy[idx].Phoneno = e.target.value;
                                setHotelGuests(copy);
                              }}
                              placeholder="9876543210"
                              className="w-full p-2 border border-slate-300 rounded-lg"
                            />
                          </div>
                          <div className="col-span-6">
                            <label className="text-[11px] font-medium text-slate-600 block mb-1">Email</label>
                            <input
                              type="email"
                              value={guest.Email}
                              onChange={(e) => {
                                const copy = [...hotelGuests];
                                copy[idx].Email = e.target.value;
                                setHotelGuests(copy);
                              }}
                              placeholder="guest@example.com"
                              className="w-full p-2 border border-slate-300 rounded-lg"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* BUS PASSENGERS */}
                {serviceType === 'BUS' && (
                  <div className="space-y-4">
                    {busPassengers.map((pax, idx) => (
                      <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-white space-y-3 shadow-2xs">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-800">
                            Passenger {idx + 1} • Seat: {pax.SeatName || `Seat ${idx + 1}`}
                          </span>
                        </div>
                        <div className="grid grid-cols-12 gap-2.5 text-xs">
                          <div className="col-span-3">
                            <label className="text-[11px] font-medium text-slate-600 block mb-1">Title</label>
                            <select
                              value={pax.Title}
                              onChange={(e) => {
                                const copy = [...busPassengers];
                                copy[idx].Title = e.target.value;
                                setBusPassengers(copy);
                              }}
                              className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                            >
                              <option value="Mr">Mr</option>
                              <option value="Mrs">Mrs</option>
                              <option value="Ms">Ms</option>
                            </select>
                          </div>
                          <div className="col-span-5">
                            <label className="text-[11px] font-medium text-slate-600 block mb-1">First Name *</label>
                            <input
                              type="text"
                              placeholder="First Name"
                              value={pax.FirstName}
                              onChange={(e) => {
                                const copy = [...busPassengers];
                                copy[idx].FirstName = e.target.value;
                                setBusPassengers(copy);
                              }}
                              className="w-full p-2 border border-slate-300 rounded-lg"
                            />
                          </div>
                          <div className="col-span-4">
                            <label className="text-[11px] font-medium text-slate-600 block mb-1">Last Name *</label>
                            <input
                              type="text"
                              placeholder="Last Name"
                              value={pax.LastName}
                              onChange={(e) => {
                                const copy = [...busPassengers];
                                copy[idx].LastName = e.target.value;
                                setBusPassengers(copy);
                              }}
                              className="w-full p-2 border border-slate-300 rounded-lg"
                            />
                          </div>

                          <div className="col-span-4">
                            <label className="text-[11px] font-medium text-slate-600 block mb-1">Age</label>
                            <input
                              type="number"
                              min={1}
                              max={100}
                              value={pax.Age}
                              onChange={(e) => {
                                const copy = [...busPassengers];
                                copy[idx].Age = Number(e.target.value);
                                setBusPassengers(copy);
                              }}
                              className="w-full p-2 border border-slate-300 rounded-lg"
                            />
                          </div>
                          <div className="col-span-4">
                            <label className="text-[11px] font-medium text-slate-600 block mb-1">Gender</label>
                            <select
                              value={pax.Gender}
                              onChange={(e) => {
                                const copy = [...busPassengers];
                                copy[idx].Gender = e.target.value;
                                setBusPassengers(copy);
                              }}
                              className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                            >
                              <option value="Male">Male</option>
                              <option value="Female">Female</option>
                            </select>
                          </div>
                          <div className="col-span-4">
                            <label className="text-[11px] font-medium text-slate-600 block mb-1">Phone</label>
                            <input
                              type="text"
                              value={pax.PhoneNo}
                              onChange={(e) => {
                                const copy = [...busPassengers];
                                copy[idx].PhoneNo = e.target.value;
                                setBusPassengers(copy);
                              }}
                              className="w-full p-2 border border-slate-300 rounded-lg"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* CAR TRAVELER */}
                {serviceType === 'CAR' && (
                  <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3 shadow-2xs text-xs">
                    <div className="grid grid-cols-12 gap-2.5">
                      <div className="col-span-6">
                        <label className="text-[11px] font-medium text-slate-600 block mb-1">Traveler Full Name *</label>
                        <input
                          type="text"
                          value={carTraveler.name}
                          onChange={(e) => setCarTraveler({ ...carTraveler, name: e.target.value })}
                          className="w-full p-2 border border-slate-300 rounded-lg"
                        />
                      </div>
                      <div className="col-span-6">
                        <label className="text-[11px] font-medium text-slate-600 block mb-1">Contact Phone *</label>
                        <input
                          type="text"
                          value={carTraveler.phone}
                          onChange={(e) => setCarTraveler({ ...carTraveler, phone: e.target.value })}
                          className="w-full p-2 border border-slate-300 rounded-lg"
                        />
                      </div>
                      <div className="col-span-6">
                        <label className="text-[11px] font-medium text-slate-600 block mb-1">Pickup Address / Hotel</label>
                        <input
                          type="text"
                          value={carTraveler.pickupAddress}
                          onChange={(e) => setCarTraveler({ ...carTraveler, pickupAddress: e.target.value })}
                          className="w-full p-2 border border-slate-300 rounded-lg"
                        />
                      </div>
                      <div className="col-span-6">
                        <label className="text-[11px] font-medium text-slate-600 block mb-1">Pickup Time</label>
                        <input
                          type="text"
                          value={carTraveler.pickupTime}
                          onChange={(e) => setCarTraveler({ ...carTraveler, pickupTime: e.target.value })}
                          className="w-full p-2 border border-slate-300 rounded-lg"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Price Breakdown Footer */}
              <div className="pt-3 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-xs text-slate-500 block">Total Payable via Razorpay Test Mode</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-slate-900">{inr(finalAmount)}</span>
                    <span className="text-[11px] text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      Taxes Included
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleInstantTestBooking}
                    disabled={simulatingPayment}
                    className="px-3.5 py-2.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                    title="Simulate payment and confirm booking instantly (bypasses card gateway restrictions)"
                  >
                    {simulatingPayment ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5 text-emerald-600" />}
                    <span>1-Click Test Book</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleProceedToPayment}
                    className="px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold rounded-xl shadow-sm transition flex items-center gap-2 cursor-pointer"
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>Proceed to Pay {inr(finalAmount)}</span>
                  </button>
                </div>
              </div>
            </>
          )}

          {step === 'PAYING' && (
            <div className="py-12 text-center space-y-4">
              <Loader2 className="w-10 h-10 text-orange-600 animate-spin mx-auto" />
              <div className="space-y-1">
                <h4 className="font-bold text-base text-slate-900">
                  {simulatingPayment ? 'Simulating Test Confirmation...' : 'Launching Razorpay Test Gateway...'}
                </h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  {simulatingPayment
                    ? 'Creating test authorization and reserving live booking with provider...'
                    : `Complete the test payment in the Razorpay popup to instantly reserve your ${serviceType} with the supplier.`}
                </p>
              </div>
            </div>
          )}

          {step === 'CONFIRMED' && confirmedBooking && (
            <div className="py-6 text-center space-y-5">
              <div className="w-14 h-14 bg-emerald-100 border-2 border-emerald-500 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm animate-in zoom-in-50">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="space-y-1.5">
                <h4 className="font-bold text-xl text-slate-900">
                  {serviceType} Successfully Confirmed!
                </h4>
                <p className="text-xs text-slate-500">
                  Live reservation verified &amp; saved to database
                </p>
              </div>

              {/* Booking Reference Details Card */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 max-w-md mx-auto text-left space-y-2.5 text-xs">
                <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                  <span className="text-slate-500">Status</span>
                  <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded-full text-[11px]">
                    CONFIRMED
                  </span>
                </div>
                {confirmedBooking.pnr && (
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Airline PNR:</span>
                    <span className="font-mono font-bold text-slate-900 text-sm tracking-wider">
                      {confirmedBooking.pnr}
                    </span>
                  </div>
                )}
                {confirmedBooking.confirmationNo && (
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Confirmation No:</span>
                    <span className="font-mono font-bold text-slate-900">
                      {confirmedBooking.confirmationNo}
                    </span>
                  </div>
                )}
                {confirmedBooking.ticketNo && (
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Ticket No:</span>
                    <span className="font-mono font-bold text-slate-900">
                      {confirmedBooking.ticketNo}
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Booking Reference ID:</span>
                  <span className="font-mono text-slate-700">
                    {confirmedBooking.bookingId || confirmedBooking.id}
                  </span>
                </div>
                <div className="flex justify-between items-center border-t border-slate-200 pt-2">
                  <span className="text-slate-500">Total Paid:</span>
                  <span className="font-bold text-orange-600 text-sm">
                    {inr(confirmedBooking.totalAmount || finalAmount)}
                  </span>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          )}

          {step === 'ERROR' && (
            <div className="py-6 text-center space-y-4">
              <div className="w-12 h-12 bg-rose-100 border border-rose-300 text-rose-600 rounded-full flex items-center justify-center mx-auto">
                <AlertCircle className="w-6 h-6" />
              </div>

              <div className="space-y-1">
                <h4 className="font-bold text-base text-slate-900">
                  {isInternationalCardError ? 'Payment Gateway Restriction' : 'Booking Confirmation Notice'}
                </h4>
                <p className="text-xs text-rose-600 max-w-md mx-auto">
                  {errorMessage || 'Payment was received but supplier API returned an error or requires administrator manual ticket issuance.'}
                </p>
              </div>

              {/* Dedicated International Card Guidance Box */}
              {(isInternationalCardError || (errorMessage && errorMessage.toLowerCase().includes('international'))) && (
                <div className="text-left space-y-3.5 max-w-lg mx-auto">
                  <div className="p-3.5 bg-amber-50/90 border border-amber-300 rounded-xl space-y-1.5 text-xs text-amber-900">
                    <div className="flex items-center gap-1.5 font-bold text-amber-950">
                      <CreditCard className="w-4 h-4 text-amber-700" />
                      <span>Why did this error happen?</span>
                    </div>
                    <p className="text-amber-800 leading-relaxed text-[11px]">
                      Razorpay test accounts in India block international/foreign cards by default under RBI compliance rules. Only <strong>domestic Indian test cards, UPI, or test netbanking</strong> are accepted.
                    </p>
                  </div>

                  {/* Instant 1-Click bypass button */}
                  <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-xl space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-emerald-950 flex items-center gap-1.5">
                        <Zap className="w-4 h-4 text-emerald-600" />
                        <span>Recommended Instant Solution</span>
                      </span>
                      <span className="px-2 py-0.5 bg-emerald-200 text-emerald-900 font-bold text-[10px] rounded-full">
                        Instant
                      </span>
                    </div>
                    <p className="text-[11px] text-emerald-800">
                      Simulate payment confirmation to bypass the card gateway and finalize the live reservation with supplier immediately:
                    </p>
                    <button
                      type="button"
                      disabled={simulatingPayment}
                      onClick={handleInstantTestBooking}
                      className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {simulatingPayment ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                      <span>Complete Booking with Test Simulation</span>
                    </button>
                  </div>

                  {/* Domestic Razorpay Test Credentials */}
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-[11px] text-slate-700">
                    <p className="font-semibold text-slate-900">
                      Or retry in Razorpay using these supported test credentials:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 font-mono text-[10px]">
                      <div className="p-1.5 bg-white rounded border border-slate-200">
                        <span className="text-slate-400 block font-sans">Domestic Indian Visa:</span>
                        <span className="font-bold text-slate-800">4111 1111 1111 1111</span> (CVV: 123)
                      </div>
                      <div className="p-1.5 bg-white rounded border border-slate-200">
                        <span className="text-slate-400 block font-sans">RuPay Domestic Card:</span>
                        <span className="font-bold text-slate-800">5085 0000 0000 0003</span> (CVV: 123)
                      </div>
                      <div className="p-1.5 bg-white rounded border border-slate-200">
                        <span className="text-slate-400 block font-sans">UPI Test ID:</span>
                        <span className="font-bold text-slate-800">success@razorpay</span>
                      </div>
                      <div className="p-1.5 bg-white rounded border border-slate-200">
                        <span className="text-slate-400 block font-sans">Netbanking:</span>
                        <span className="font-bold text-slate-800">Any bank &rarr; Success</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="pt-2 flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setStep('FORM')}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition cursor-pointer"
                >
                  Edit Details &amp; Retry
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
