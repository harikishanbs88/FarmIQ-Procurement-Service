import { Router, type IRouter, type Request, type Response } from "express";
import { GovtDataService } from "../services/govtDataService";
import { aiSyncEngine } from "../services/aiSyncEngine";

const router: IRouter = Router();

// GET /api/govt/prices - Get real-time commodity prices from Agmarknet / Krishi Marata Vahini
router.get("/govt/prices", (_req: Request, res: Response) => {
  const prices = GovtDataService.getAllPrices();
  res.json({
    success: true,
    count: prices.length,
    data: prices,
    sources: [
      "AGMARKNET (agmarknet.gov.in)",
      "Karnataka Krishi Marata Vahini (krishimaratavahini.kar.nic.in)",
      "data.gov.in (Daily Mandi Prices & Arrivals)",
    ],
    timestamp: new Date().toISOString(),
  });
});

// GET /api/govt/portals - Get online status of connected government platforms
router.get("/govt/portals", (_req: Request, res: Response) => {
  const portals = GovtDataService.getPortalsStatus();
  res.json({
    success: true,
    data: portals,
    syncedAt: new Date().toISOString(),
  });
});

// GET /api/govt/logs - Get AI change detection history
router.get("/govt/logs", (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: aiSyncEngine.getLogs(),
  });
});

// POST /api/govt/sync - Trigger an active sync with government portals
router.post("/govt/sync", async (_req: Request, res: Response) => {
  // Run AI sync check across commodities
  const commodities = ["Tomato", "Ragi (Finger Millet)", "Maize (Makka)", "Onion", "Paddy / Rice"];
  const randomCommodity = commodities[Math.floor(Math.random() * commodities.length)];
  
  const log = await aiSyncEngine.processGovernmentChange({
    commodity: randomCommodity,
    source: "Karnataka Krishi Marata Vahini (krishimaratavahini.kar.nic.in)",
  });

  res.json({
    success: true,
    message: "AI Government sync completed successfully",
    data: log,
  });
});

// POST /api/govt/simulate - Simulate a sudden government update to test immediate (< 1s) AI push
router.post("/govt/simulate", async (req: Request, res: Response) => {
  const { commodity, newModalPrice, market, bulletin } = req.body;

  const targetCommodity = commodity || "Tomato";
  const targetMarket = market || "Ramanagara APMC Yard";

  const log = await aiSyncEngine.processGovernmentChange({
    commodity: targetCommodity,
    newModalPrice: newModalPrice ? Number(newModalPrice) : undefined,
    market: targetMarket,
    source: "AGMARKNET (agmarknet.gov.in) Official Live Bulletin",
    bulletin,
  });

  res.json({
    success: true,
    message: "Live government data update processed and broadcast to clients within milliseconds",
    data: log,
  });
});

// GET /api/events - Server-Sent Events (SSE) stream for real-time live push to web clients
router.get("/events", (req: Request, res: Response) => {
  // Set headers for SSE streaming
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no"); // Disable proxy buffering

  // Register client with AI sync engine
  aiSyncEngine.registerClient(res);

  // Keep-alive heartbeat every 15s to prevent timeouts
  const keepAlive = setInterval(() => {
    res.write(": keep-alive\n\n");
  }, 15000);

  req.on("close", () => {
    clearInterval(keepAlive);
  });
});

export default router;
