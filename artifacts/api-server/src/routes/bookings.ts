import { Router, type IRouter, type Request, type Response } from "express";
import { BookingService } from "../services/bookingService";
import { aiSyncEngine } from "../services/aiSyncEngine";

const router: IRouter = Router();

// GET /api/bookings - Get bookings (filtered optionally by farmerPhone query)
router.get("/bookings", (req: Request, res: Response) => {
  const farmerPhone = req.query.phone as string | undefined;
  const bookings = BookingService.getBookings(farmerPhone);
  res.json({
    success: true,
    count: bookings.length,
    data: bookings,
  });
});

// POST /api/bookings - Create new procurement slot booking & generate digital token
router.post("/bookings", (req: Request, res: Response) => {
  const { centreId, farmerName, farmerPhone, village, district, crop, quantity, date, slotTime } = req.body;

  if (!crop || !quantity) {
    res.status(400).json({ success: false, error: "Crop and quantity are required" });
    return;
  }

  const booking = BookingService.createBooking({
    centreId: centreId || 'ramanagara',
    farmerName: farmerName || 'Farmer',
    farmerPhone: farmerPhone || '9876543210',
    village,
    district,
    crop,
    quantity: String(quantity),
    date,
    slotTime,
  });

  // Broadcast slot & queue update via SSE
  aiSyncEngine.broadcast({
    id: `booking-${Date.now()}`,
    type: 'centre_update',
    title: `New Booking Confirmed: ${booking.token}`,
    message: `${booking.crop} slot booked at ${booking.centreName}. Live queue updated.`,
    source: 'FarmIQ Booking Engine',
    timestamp: new Date().toISOString(),
    data: {
      booking,
      centre: BookingService.getCentreById(booking.centreId),
    },
  });

  res.status(201).json({
    success: true,
    message: "Slot booked successfully",
    data: booking,
  });
});

// GET /api/bookings/:token - Retrieve token details
router.get("/bookings/:token", (req: Request, res: Response) => {
  const token = String(req.params.token);
  const booking = BookingService.getBookingByToken(token);
  if (!booking) {
    res.status(404).json({ success: false, error: "Token not found" });
    return;
  }
  res.json({
    success: true,
    data: booking,
  });
});

// DELETE /api/bookings/:token - Cancel a booking
router.delete("/bookings/:token", (req: Request, res: Response) => {
  const token = String(req.params.token);
  const cancelled = BookingService.cancelBooking(token);
  if (!cancelled) {
    res.status(404).json({ success: false, error: "Booking token not found" });
    return;
  }
  res.json({
    success: true,
    message: "Booking cancelled successfully",
  });
});

// GET /api/alerts - Retrieve notifications & reminders
router.get("/alerts", (_req: Request, res: Response) => {
  const alerts = BookingService.getAlerts();
  res.json({
    success: true,
    data: alerts,
  });
});

export default router;
