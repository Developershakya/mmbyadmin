import { callSrdvApi } from '../../../lib/srdvApi';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { checkInDate, noOfNights, cityId, guestNationality, noOfRooms, roomGuests } = req.body;

  try {
    const formattedRoomGuests = Array.isArray(roomGuests)
      ? roomGuests.map(g => ({
          NoOfAdults: String(g.adults || 1),
          NoOfChild: String(g.children || 0),
          ChildAge: g.childAge || []
        }))
      : [];

    const payload = {
      BookingMode: "5",
      CheckInDate: checkInDate,
      NoOfNights: String(noOfNights || 1),
      CityId: String(cityId || ''),
      CountryCode: "",
      GuestNationality: guestNationality || "IN",
      PreferredCurrency: "INR",
      NoOfRooms: String(noOfRooms || 1),
      RoomGuests: formattedRoomGuests,
      MinRating: "0",
      MaxRating: "5",
      IsNearBySearchAllowed: false
    };

    const data = await callSrdvApi(process.env.HOTEL_API_URL, 'Search', payload);

    if (data.Error && data.Error.ErrorCode !== 0) {
      return res.status(200).json({ success: false, message: data.Error.ErrorMessage });
    }

    if (data.Results && data.Results.length > 0) {
      return res.status(200).json({
        success: true,
        traceId: data.TraceId,
        results: data.Results
      });
    }

    return res.status(200).json({ success: false, message: 'No hotels found' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}