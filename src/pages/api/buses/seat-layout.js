// ✅ FIXED CODE
import { callSrdvApi } from '../../../lib/srdvApi';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { traceId, resultIndex } = req.body;

  if (!traceId || !resultIndex) {
    return res.status(400).json({ success: false, message: 'traceId aur resultIndex zaroori hain' });
  }

  try {
    const data = await callSrdvApi(process.env.BUS_API_URL, 'GetSeatLayout', {
      TraceId: traceId,
      ResultIndex: resultIndex,
    });

    if (data?.Error && Number(data.Error.ErrorCode) !== 0) {
      return res.status(200).json({ success: false, message: data.Error.ErrorMessage });
    }

    // SRDV response se exact seats array nikalna
    const seatData = data?.GetSeatLayoutResult?.SeatLayout || data?.SeatLayout || data;
    const rawSeats = seatData?.SeatDetails || seatData?.Seats || [];
    const seatList = Array.isArray(rawSeats) ? rawSeats.flat() : [];

    if (seatList.length === 0) {
      return res.status(200).json({ success: false, message: 'Seat data available nahi hai.' });
    }

    // Clean formatting for React UI
    const seats = seatList.map((seat) => ({
      seatName: seat.SeatName || seat.Name,
      seatIndex: seat.SeatIndex,
      rowNo: Number(seat.RowNo || 1),
      columnNo: Number(seat.ColumnNo || 1),
      isAvailable: seat.SeatStatus === true || seat.SeatStatus === 'true' || seat.SeatStatus === 1,
      isUpper: !!seat.IsUpper,
      isLadies: !!seat.IsLadiesSeat,
      price: seat.Price?.OfferedPrice ?? seat.Price?.PublishedPrice ?? seat.SeatFare ?? 0,
    }));

    return res.status(200).json({
      success: true,
      seats,
      boardingPoints: data?.GetSeatLayoutResult?.BoardingPointDetails || data?.BoardingPointDetails || [],
      droppingPoints: data?.GetSeatLayoutResult?.DroppingPointDetails || data?.DroppingPointDetails || [],
    });

  } catch (error) {
    console.error('Seat layout error:', error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
}