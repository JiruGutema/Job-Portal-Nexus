import { NotificationModel } from "../models/notifications.model";

export const NotificationService = {
  async sendNotification(user_id: number, message: string) {
    return await NotificationModel.create({ user_id, message });
  },

  async getUserNotifications(user_id: number) {
    return await NotificationModel.getByUserId(user_id);
  },

  async markNotificationAsRead(id: number) {
    return await NotificationModel.markAsRead(id);
  },

  async deleteNotification(id: number) {
    return await NotificationModel.delete(id);
  },
};
