

export type UIComponentType = 'Chart' | 'Table' | 'Json' | 'Text' | 'Markdown' | 'SummaryCard';

export interface ResponseItem {
    title: string;
    uiComponent: UIComponentType;
    content: any;
}