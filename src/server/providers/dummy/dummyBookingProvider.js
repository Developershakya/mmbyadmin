import crypto from 'crypto';

// Helper to generate unique realistic alphanumeric codes
function randomAlphaNumeric(length = 6) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no 0/O or 1/I confusion
  let res = '';
  for (let i = 0; i < length; i++) {
    res += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return res;
}

function randomNumeric(digits = 8) {
  let res = '';
  for (let i = 0; i < digits; i++) {
    res += Math.floor(Math.random() * 10);
  }
  return res;
}

export const DummyFlightBookingProvider = {
  async book(bookingPayload) {
    const {
      flightData = {},
      passengers = [],
      seats = [],
      ssr = {},
      totalAmount = 0,
      traceId = ''
    } = bookingPayload;

    const pnr = randomAlphaNumeric(6);
    const bookingId = `${Date.now().toString().slice(-4)}${randomNumeric(4)}`;
    const ticketNo = `910-${randomNumeric(10)}`;
    const invoiceNo = `INV-FL-${randomNumeric(6)}`;

    const passengerTickets = passengers.map((p, idx) => ({
      PassengerId: idx + 1,
      Title: p.title || 'Mr',
      FirstName: p.firstName || 'Traveler',
      LastName: p.lastName || `${idx + 1}`,
      PaxType: p.paxType || 1, // 1: Adult, 2: Child, 3: Infant
      TicketNumber: `${ticketNo}-${idx + 1}`,
      TicketId: parseInt(randomNumeric(7), 10),
      IssueDate: new Date().toISOString(),
      Status: 'Confirmed'
    }));

    return {
      success: true,
      provider: 'SRDV_DUMMY_V8',
      Response: {
        ResponseStatus: 1,
        TraceId: traceId || `TR-${Date.now()}`,
        Error: { ErrorCode: 0, ErrorMessage: '' },
        Response: {
          BookingId: bookingId,
          PNR: pnr,
          Status: 1,
          IsPriceChanged: false,
          IsTimeChanged: false,
          FlightItinerary: {
            BookingId: bookingId,
            PNR: pnr,
            IsLCC: Boolean(flightData.isLcc),
            ValidatingAirlineCode: flightData.airlineCode || '6E',
            AirlineName: flightData.airline || 'IndiGo',
            FlightNumber: flightData.flightNumber || '6E 204',
            Origin: flightData.origin || flightData.from || 'DEL',
            Destination: flightData.destination || flightData.to || 'BOM',
            DepartureTime: flightData.departureTime || '09:00',
            ArrivalTime: flightData.arrivalTime || '11:15',
            DepartureDate: flightData.departureDate || new Date().toISOString().split('T')[0],
            ArrivalDate: flightData.arrivalDate || flightData.departureDate || new Date().toISOString().split('T')[0],
            Fare: {
              Currency: 'INR',
              BaseFare: flightData.baseFare || Math.round(totalAmount * 0.8),
              Tax: flightData.tax || Math.round(totalAmount * 0.2),
              TotalFare: totalAmount,
              PublishedFare: totalAmount
            },
            Passenger: passengerTickets,
            Segments: flightData.segments || [
              {
                Origin: { AirportCode: flightData.origin || 'DEL', CityName: flightData.originCity || 'Delhi' },
                Destination: { AirportCode: flightData.destination || 'BOM', CityName: flightData.destinationCity || 'Mumbai' },
                Airline: { AirlineCode: flightData.airlineCode || '6E', FlightNumber: flightData.flightNumber || '6E 204' },
                DepTime: `${flightData.departureDate || '2026-10-15'}T${flightData.departureTime || '09:00'}:00`,
                ArrTime: `${flightData.arrivalDate || flightData.departureDate || '2026-10-15'}T${flightData.arrivalTime || '11:15'}:00`,
                CabinClass: flightData.cabinClass || 'Economy'
              }
            ],
            Seats: seats,
            SSR: ssr,
            Ticket: {
              TicketId: parseInt(randomNumeric(7), 10),
              TicketNumber: ticketNo,
              InvoiceNumber: invoiceNo,
              IssueDate: new Date().toISOString(),
              Status: 'Confirmed'
            }
          }
        }
      }
    };
  }
};

export const DummyHotelBookingProvider = {
  async book(bookingPayload) {
    const {
      hotelData = {},
      roomData = {},
      guests = [],
      checkInDate = '',
      checkOutDate = '',
      totalAmount = 0,
      traceId = ''
    } = bookingPayload;

    const bookingId = `HTL${randomNumeric(7)}`;
    const confirmationNo = `CFM-${randomAlphaNumeric(8)}`;
    const bookingRefNo = `SRDV-HT-${randomNumeric(6)}`;
    const invoiceNo = `INV-HT-${randomNumeric(6)}`;

    return {
      success: true,
      provider: 'SRDV_DUMMY_V5',
      BookResult: {
        ResponseStatus: 1,
        TraceId: traceId || `TR-HT-${Date.now()}`,
        Error: { ErrorCode: 0, ErrorMessage: '' },
        BookingId: bookingId,
        ConfirmationNo: confirmationNo,
        BookingRefNo: bookingRefNo,
        InvoiceNumber: invoiceNo,
        Status: 1,
        HotelBookingStatus: 'Confirmed',
        VoucherStatus: 'Confirmed',
        IsPriceChanged: false,
        IsCancellationPolicyChanged: false,
        HotelDetails: {
          HotelCode: hotelData.hotelCode || 'HTL-101',
          HotelName: hotelData.hotelName || hotelData.name || 'Alpine Luxury Resort',
          StarRating: hotelData.starRating || 4,
          Address: hotelData.address || hotelData.location || 'Mall Road',
          CityName: hotelData.city || 'Manali',
          CheckInDate: checkInDate,
          CheckOutDate: checkOutDate,
          RoomTypeName: roomData.roomTypeName || roomData.name || 'Deluxe Valley Room',
          RatePlanCode: roomData.ratePlanCode || 'CP-01',
          Inclusions: roomData.inclusions || ['Complimentary Breakfast', 'Free Wi-Fi'],
          Price: {
            Currency: 'INR',
            RoomPrice: Math.round(totalAmount * 0.85),
            Tax: Math.round(totalAmount * 0.15),
            TotalFare: totalAmount
          },
          HotelPassenger: guests.map((g, idx) => ({
            Title: g.title || 'Mr',
            FirstName: g.firstName || 'Guest',
            LastName: g.lastName || `${idx + 1}`,
            PaxType: g.paxType || 1
          }))
        }
      }
    };
  }
};

export const DummyBusBookingProvider = {
  async book(bookingPayload) {
    const {
      busData = {},
      boardingPoint = {},
      droppingPoint = {},
      seats = [],
      passengers = [],
      totalAmount = 0,
      traceId = ''
    } = bookingPayload;

    const busId = `BUS${randomNumeric(6)}`;
    const ticketNo = `TKT-BS-${randomNumeric(8)}`;
    const operatorPnr = `OPR-${randomAlphaNumeric(6)}`;

    return {
      success: true,
      provider: 'SRDV_DUMMY_V5',
      Result: {
        TraceId: traceId || `TR-BS-${Date.now()}`,
        BusBookingStatus: 'Confirmed',
        BusId: busId,
        TicketNo: ticketNo,
        TravelOperatorPNR: operatorPnr,
        InvoiceAmount: totalAmount,
        TravelName: busData.operator || busData.TravelName || 'Zingbus Luxury Class',
        BusType: busData.busType || 'Volvo Multi-Axle A/C Sleeper',
        FromCity: busData.fromCity || busData.from || 'Delhi',
        ToCity: busData.toCity || busData.to || 'Manali',
        TravelDate: busData.travelDate || new Date().toISOString().split('T')[0],
        DepartureTime: busData.departureTime || '20:30',
        ArrivalTime: busData.arrivalTime || '08:30',
        BoardingPointDetails: boardingPoint,
        DroppingPointDetails: droppingPoint,
        Seats: seats,
        Passengers: passengers
      }
    };
  }
};

export const DummyCarBookingProvider = {
  async book(bookingPayload) {
    const {
      carData = {},
      passengers = [],
      pickupDate = '',
      pickupTime = '',
      totalAmount = 0,
      traceId = ''
    } = bookingPayload;

    const bookingId = `CAB${randomNumeric(6)}`;
    const confirmationNo = `CAR-CFM-${randomAlphaNumeric(8)}`;
    const referenceNo = `SRDV-CR-${randomNumeric(6)}`;

    return {
      success: true,
      provider: 'SRDV_DUMMY_V8',
      Result: {
        TraceId: traceId || `TR-CR-${Date.now()}`,
        CarBookingStatus: 'Confirmed',
        BookingId: bookingId,
        ConfirmationNo: confirmationNo,
        ReferenceNo: referenceNo,
        VehicleName: carData.vehicleName || carData.name || carData.vehicle || 'Toyota Innova Crysta',
        Category: carData.category || 'INNOVA_OR_EQUIVALENT',
        PickupCity: carData.pickupCity || 'Delhi',
        DropCity: carData.dropCity || 'Manali',
        PickupLocation: carData.pickupLocation || carData.pickup || 'New Delhi Airport',
        DropLocation: carData.dropLocation || carData.drop || 'Manali Hotel',
        PickupDate: pickupDate || carData.date || '2026-10-15',
        PickupTime: pickupTime || carData.time || '09:00 AM',
        TotalAmount: totalAmount,
        Passengers: passengers,
        DriverDetails: {
          DriverName: 'Assigned 2 Hours Prior to Pickup',
          Contact: '+91 98765 43210',
          VehicleNumber: 'DL 01 AB 9988'
        }
      }
    };
  }
};

export const DummyCancellationProvider = {
  async cancel(cancellationPayload) {
    const { serviceType, booking, reason = 'Customer Request' } = cancellationPayload;
    const changeRequestId = `CR-${randomNumeric(8)}`;
    const totalFare = Number(booking.totalAmount || booking.fare || 0);

    // Realistic cancellation deduction: 15% cancellation charge or flat fee
    const cancellationCharge = Math.round(Math.min(totalFare, Math.max(500, totalFare * 0.15)));
    const refundAmount = Math.max(0, totalFare - cancellationCharge);

    return {
      success: true,
      provider: 'SRDV_DUMMY_CANCEL',
      Response: {
        ChangeRequestId: changeRequestId,
        Status: 'CANCELLED',
        ServiceType: serviceType,
        BookingId: booking.bookingId || booking.id,
        CancellationCharge: cancellationCharge,
        RefundAmount: refundAmount,
        RefundStatus: refundAmount > 0 ? 'REFUND_PENDING' : 'NO_REFUND',
        Reason: reason,
        ProcessedAt: new Date().toISOString()
      }
    };
  }
};
