import { AssistantModel, Line, UserDataModel } from 'src/main/models/model';
export declare function loadLines(): Promise<void>;
export declare const currentLines: import("solid-js").Accessor<Line[]>;
declare const userData: UserDataModel;
export declare const userState: {
    preSelectedAssistant: string;
}, setUserState: import("solid-js/store").SetStoreFunction<{
    preSelectedAssistant: string;
}>;
export declare function loadUserData(): Promise<void>;
export declare function userHasUse(): void;
export declare function changeMatchModel(model: AssistantModel['matchModel'], id: string): void;
export declare function setSelectedModel(model: string): void;
export declare function setSelectedAssistantForAns(assistantID: string): Promise<any>;
export declare function setSelectedAssistantForChat(assistantID: string): Promise<any>;
export declare function setSelectedMemo(memoID: string): Promise<any>;
export declare function hasFirstTimeFor(key: keyof UserDataModel['firstTimeFor']): Promise<void>;
declare const pageData: {
    isSpeech: boolean;
}, setPageData: import("solid-js/store").SetStoreFunction<{
    isSpeech: boolean;
}>;
export { userData, pageData, setPageData };
