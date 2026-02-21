import { AssistantModel } from 'src/main/models/model';
declare const assistants: AssistantModel[];
declare const assistantsStatus: {
    [key: string]: "creating" | "editing" | "saved";
};
export declare function loadAssistants(): Promise<void>;
export declare function createNewAssistant(type: 'chat' | 'ans'): void;
export declare function onEditAssistant(id: string): void;
export declare function onCancelEditAssistant(id: string): void;
export declare function saveAssistant(a: AssistantModel): Promise<void>;
export declare function deleteAssistant(id: string): Promise<void>;
export declare function useAssistant(id: string): Promise<void>;
export declare const getCurrentAssistantForAnswer: import("solid-js").Accessor<AssistantModel>;
export declare const getCurrentAssistantForChat: import("solid-js").Accessor<AssistantModel>;
export declare const exportAssistants: () => Promise<void>;
export declare const importAssistants: (content: string) => Promise<boolean>;
export { assistants, assistantsStatus };
