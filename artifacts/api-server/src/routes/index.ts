import { Router, type IRouter } from "express";
import healthRouter from "./health";
import centresRouter from "./centres";
import bookingsRouter from "./bookings";
import govtRouter from "./govt";

const router: IRouter = Router();

router.use(healthRouter);
router.use(centresRouter);
router.use(bookingsRouter);
router.use(govtRouter);

export default router;
