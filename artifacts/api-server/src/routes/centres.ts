import { Router, type IRouter, type Request, type Response } from "express";
import { BookingService } from "../services/bookingService";

const router: IRouter = Router();

// GET /api/centres - List all APMC and procurement centres
router.get("/centres", (_req: Request, res: Response) => {
  const centres = BookingService.getCentres();
  res.json({
    success: true,
    count: centres.length,
    data: centres,
    timestamp: new Date().toISOString(),
  });
});

// GET /api/centres/:id - Get a specific procurement centre
router.get("/centres/:id", (req: Request, res: Response) => {
  const centre = BookingService.getCentreById(String(req.params.id));
  if (!centre) {
    res.status(404).json({ success: false, error: "Procurement centre not found" });
    return;
  }
  res.json({
    success: true,
    data: centre,
  });
});

export default router;
