
import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware";
import { approveBookingController, cancelBookingController, createBookingController, getAllBookingsController, getMyBookingsController, rejectBookingController } from "./booking.controller";
import { requireAdmin } from "../../middleware/role.middleware";
import { getAdminBookingStatsController } from "./booking.controller";

const router = Router();

router.use(authenticate);

router.post("/", createBookingController);

router.get("/mine", getMyBookingsController);

router.get("/", requireAdmin, getAllBookingsController);


router.patch("/:id/cancel", cancelBookingController);
router.patch("/:id/approve", requireAdmin, approveBookingController);
router.patch("/:id/reject", requireAdmin, rejectBookingController);

router.get("/admin/stats", requireAdmin, getAdminBookingStatsController);
export default router;
