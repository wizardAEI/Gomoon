export interface ShowWindowParams {
    text: string;
}
export declare function setQuicklyAns(key: string): void;
export declare function setQuicklyWakeUp(keys: string): void;
export declare function hideWindow(): void;
export declare function minimize(): void;
export declare function maximize(): void;
export declare function unmaximize(): void;
export declare function isMaximized(): boolean;
export declare function showWindow(): void;
type cspItem = 'default-src' | 'script-src' | 'style-src' | 'connect-src' | 'img-src' | 'worker-src';
export declare function updateSendHeaders(urls?: string[]): void;
export declare function updateRespHeaders(urls?: string[], conf?: {
    cspItems?: {
        [key in cspItem]?: string[];
    };
}): void;
export declare function checkUpdate(): Promise<boolean>;
export declare function postMsgToMainWindow(msg: string): Promise<void | undefined>;
export declare function PostBuffToMainWindow(buff: Buffer): Promise<void | undefined>;
export declare function createWindow(): void;
export declare function beforeQuitWindowHandler(): Promise<void>;
export {};
