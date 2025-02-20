// types/zendesk.ts

export interface ZendeskWebWidgetSettings {
    webWidget: {
        chat?: {
            departments?: {
                select?: string;
            };
            defaultMessage?: string;
        };
        color?: {
            theme?: string;
        };
        launcher?: {
            chatLabel?: {
                [key: string]: string;
            };
        };
        offset?: {
            horizontal: string;
            vertical: string;
        };
        position?: {
            horizontal: string;
            vertical: string;
        };
    };
}

export type ZendeskCallback = () => void;

export type ZendeskOptions = string | ZendeskWebWidgetSettings | ZendeskCallback | Record<string, string>;

declare global {
    interface Window {
        zESettings?: ZendeskWebWidgetSettings;
        zE?: (
            action: string,
            command: string,
            options?: ZendeskOptions
        ) => void;
    }
}