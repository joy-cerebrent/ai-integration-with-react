import { RequestCard } from './RequestCard';
import { ContentType } from '../enums/ContentType';
import { ResponseItem } from './ResponseItem';

export interface ProcessResponse {
    requestCard: RequestCard;    input: unknown;
    inputType: ContentType;
    output: unknown;
    outputType: ContentType;
    items: ResponseItem[];
    message: string;
    extraDetails?: Record<string, unknown>;
    createdAt: Date;

    // Note: Methods are not included in TypeScript interfaces
    // They would need to be implemented in a class if needed
}