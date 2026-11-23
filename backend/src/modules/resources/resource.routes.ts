import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware";
import { createResourceController, getResourceAvailabilityController, getResourceByIdController, getResourcesController } from "./resource.controller";
import { updateResourceController } from "./resource.controller";
import { requireAdmin } from "../../middleware/role.middleware";

const router = Router();

router.use(authenticate);

router.get("/", getResourcesController);

router.get("/:id", getResourceByIdController);

router.post("/", requireAdmin, createResourceController);

router.patch("/:id", requireAdmin, updateResourceController);

router.get("/:id/availability", getResourceAvailabilityController);
export default router;