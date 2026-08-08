import { callSrdvApi } from '../../../lib/srdvApi';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' });

  const {
    traceId, srdvType, srdvIndex, resultIndex, hotelCode, hotelName,
    guestNationality, noOfRooms, room, passengers,
  } = req.body;

  if (!room || !passengers || passengers.length === 0) {
    return res.status(400).json({ success: false, message: 'Room ya passenger details missing.' });
  }

  try {
    const roomWithPassengers = {
      ...room,
      HotelPassenger: passengers,
    };

    const payload = {
      TraceId: traceId,
      SrdvType: srdvType,
      SrdvIndex: srdvIndex,
      ResultIndex: resultIndex,
      HotelCode: hotelCode,
      HotelName: hotelName,
      GuestNationality: guestNationality || 'IN',
      NoOfRooms: String(noOfRooms || 1),
      ClientReferenceNo: 0,
      IsVoucherBooking: true,
      HotelRoomsDetails: [roomWithPassengers],
    };

    const data = await callSrdvApi(process.env.HOTEL_API_URL, 'Book', payload);

    console.log('Book RAW RESPONSE:', JSON.stringify(data, null, 2));

    const result = data.BookResult;

    if (result?.Error && result.Error.ErrorCode !== 0) {
      return res.status(200).json({ success: false, message: result.Error.ErrorMessage });
    }

    return res.status(200).json({
      success: true,
      bookingRef: result?.BookingRefNo,
      confirmationNo: result?.ConfirmationNo,
      bookingId: result?.BookingId,
      status: result?.Status,
    });
  } catch (error) {
    console.error('Book ERROR:', error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
}