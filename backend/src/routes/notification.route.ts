import { NotificationController } from "../controllers/notification.controller";
import {Router} from "express";
import authenticate from "../middlewares/auth.middleware";

const router = Router();

router.get("/", authenticate, NotificationController.getNotifications);
router.patch("/:id/read",authenticate, NotificationController.markAsRead);
router.delete("/:id",authenticate, NotificationController.delete);

export default router;