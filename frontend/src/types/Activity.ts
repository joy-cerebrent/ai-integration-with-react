import { MessageStatus } from '@/enums/MessageStatus';
import { RequestCard } from './RequestCard';
import { ContentType } from '@/enums/ContentType';

export interface Activity {
    requestCard: RequestCard;
    id: string;
    timestamp: string; // ISO string representation of DateTime
    title: string;
    message: string;
    content?: any;
    contentType?: ContentType;
    messageStatus: MessageStatus;
}