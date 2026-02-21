import { MemoFragment, MemoModel } from '../../../models/model';
export interface EditFragmentOption {
    id: string;
    fragment: MemoFragment;
    type: 'add' | 'remove';
    useLLM?: boolean;
}
export declare function editFragment(option: EditFragmentOption): Promise<{
    suc: boolean;
    reason?: string;
}>;
export interface SaveMemoParams {
    id: string;
    memoName: string;
    introduce?: string;
    version?: number;
}
export declare function editMemo(memoId: string, fragments: MemoFragment[]): Promise<void>;
export declare function saveMemo(params: SaveMemoParams): Promise<void>;
export declare function dropMemo(memoId: string): Promise<void>;
export interface GetMemoParams {
    id: string;
    content: string;
}
export declare function getMemo(data: GetMemoParams): Promise<import("../../../models/model").MemoResult[]>;
export declare function cancelSaveMemo(id: string): void;
export declare function exportMemo(memo: MemoModel): Promise<string>;
export declare function importMemo(path: string): Promise<boolean>;
