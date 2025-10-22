import { Request, Response } from "express";
import { NotificationService } from "../services/notification.service";

export const NotificationController = {
  async getNotifications(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const notifications = await NotificationService.getUserNotifications(userId);
      res.json(notifications);
    } catch (err) {
      res.status(500).json({ message: "Error fetching notifications" });
    }
  },

  async markAsRead(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updated = await NotificationService.markNotificationAsRead(Number(id));
      res.json(updated);
    } catch (err) {
      res.status(500).json({ message: "Error marking notification as read" });
    }
  },

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await NotificationService.deleteNotification(Number(id));
      res.json({ message: "Notification deleted" });
    } catch (err) {
      res.status(500).json({ message: "Error deleting notification" });
    }
  },
};
