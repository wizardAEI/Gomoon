import { HistoryModel } from 'src/main/models/model';
declare const histories: HistoryModel[];
export declare function loadHistories(): Promise<void>;
export declare function starHistory(historyID: string, status: boolean): Promise<void>;
export declare function clearHistory(): Promise<void>;
export declare function addHistory(history: HistoryModel): Promise<void>;
export declare function copyHistory(historyID: string): Promise<void>;
export declare function removeHistory(historyID: string): Promise<void>;
export declare const historyManager: {
    formatHistory(type: 'chat' | 'ans'): HistoryModel;
    drawHistory(history: HistoryModel): any;
    newHistory(type: 'chat' | 'ans'): Promise<void>;
};
export { histories };
