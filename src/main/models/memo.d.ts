import { MemoFragmentData, MemoResult } from './model';
export declare function saveData(memoId: string, data: {
    fileName: string;
    id: string;
    content: string;
    indexes: string[];
}[]): void;
export interface ImportMemoDataModel {
    content: string;
    indexes: string[];
    fileName: string;
    embeddingModel: string;
    vectors?: Float32Array[];
}
export declare function deleteDataAndIndex(memoId: string): Promise<void>;
export declare function saveIndexes(memoId: string, data: {
    id: string;
    vectors: Float32Array[];
}[]): Promise<void>;
export declare function importDataAndIndexes(memoId: string, data: {
    [id: string]: ImportMemoDataModel;
}): Promise<void>;
export declare function getData(data: {
    id: string;
    content: string;
}): Promise<Array<MemoResult>>;
export declare function getMemoDataAndIndexes(memoId: string): Promise<MemoFragmentData[]>;
