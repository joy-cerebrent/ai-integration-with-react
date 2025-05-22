import { ContentType } from '@/enums/ContentType';
import { ActivityType } from "../enums/ActivityType";

export interface Activity {
  id: string;
  messageId: string;
  message: string;
  content?: Record<string, unknown> | null;
  contentType?: ContentType | null;
  activityType: ActivityType;
  timestamp: string; // ISO string representation of DateTime
}