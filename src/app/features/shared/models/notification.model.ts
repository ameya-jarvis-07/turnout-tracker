export interface NotificationDto {
  notificationId: number;
  userId: number;
  message: string;
  isRead: boolean;
  createdAt: Date;
}

export interface NotificationBadge {
  count: number;
  hasUnread: boolean;
}
