import { callSrdvApi } from '../../../lib/srdvApi';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { checkInDate, noOfNights, cityId, guestNationality, noOfRooms, roomGuests } = req.body;

  try {
    const data = await callSrdvApi(process.env.HOTEL_API_URL, 'Search', {
      BookingMode: "5",
      CheckInDate: checkInDate,     // format: YYYY-MM-DD
      NoOfNights: String(noOfNights),
      CityId: cityId,
      CountryCode: "",
      GuestNationality: guestNationality || "IN",
      PreferredCurrency: "INR",
      NoOfRooms: String(noOfRooms),
      RoomGuests: roomGuests.map(g => ({
        NoOfAdults: String(g.adults),
        NoOfChild: String(g.children),
        ChildAge: g.childAge || []
      })),
      MinRating: "0",
      MaxRating: "5",
      IsNearBySearchAllowed: false
    });

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