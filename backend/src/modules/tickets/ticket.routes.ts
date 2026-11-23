
import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware";
import { getTicketByIdController, importTicketsController } from "./ticket.controller";
import { getTicketsController } from "./ticket.controller";
import { updateTicketController } from "./ticket.controller";

const router = Router();

router.use(authenticate);

router.post("/import", importTicketsController);

router.get("/", getTicketsController);
router.get("/:id", getTicketByIdController);

router.patch("/:id", updateTicketController);
export default router;
