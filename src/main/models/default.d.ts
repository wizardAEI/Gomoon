import { AssistantModel, Line, MemoModel, UserDataModel } from './model';
import { SettingModel } from './model';
import { ImportMemoDataModel } from './memo';
export declare function getDefaultAssistants(): AssistantModel[];
export declare function getDefaultConfig(): SettingModel;
export declare function getDefaultLines(): Line[];
export declare function getDefaultUserData(): UserDataModel;
export declare function getDefaultMemories(): {
    memo: MemoModel;
    data: {
        [id: string]: ImportMemoDataModel;
    };
}[];
