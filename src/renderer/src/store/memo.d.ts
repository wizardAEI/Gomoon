import { MemoModel } from 'src/main/models/model';
import { SaveMemoParams } from 'src/main/lib/ai/embedding';
declare const memories: MemoModel[];
declare const memoriesStatus: {
    [key: string]: "creating" | "editing" | "saved";
};
export declare function loadMemories(): Promise<void>;
export declare function initMemories(): Promise<void>;
export declare const getCurrentMemo: import("solid-js").Accessor<MemoModel>;
export declare function createNewMemo(): void;
export declare function onEditMemo(id: string): Promise<void>;
export declare function onCancelEditMemo(id: string): void;
export declare function saveMemo(m: SaveMemoParams): Promise<void>;
export declare function useMemo(id: string): Promise<void>;
export declare function deleteMemo(id: string): Promise<void>;
export declare function importMemo(path: string): Promise<boolean>;
export { memories, memoriesStatus };
