import { AssistantModel, CollectionModel, CreateAssistantModel, CreateCollectionModel, CreateMemoModel, HistoryModel, MemoModel } from './model';
import { SettingModel } from './model';
/**
 * FEAT: 配置相关(特指配置页的信息)
 * 因为后续配置页的设置可能会在用户有感的情况下加载一些其他第三方或者更加底层的配置，所以这里单独抽出来，且每一个配置项都单独写一个函数
 * 后续较轻的配置项，可以合并一个函数
 */
export declare function loadAppConfig(): SettingModel;
export declare function setAppConfig(config: Partial<SettingModel>): void;
export declare function setIsOnTop(isOnTop: SettingModel['isOnTop']): void;
export declare function setModels(models: SettingModel['models']): void;
export declare function setQuicklyAnsKey(quicklyAnsKey: SettingModel['quicklyAnsKey']): void;
export declare function setQuicklyWakeUpKeys(quicklyWakeUpKeys: SettingModel['quicklyWakeUpKeys']): void;
export declare function setSendWithCmdOrCtrl(sendWithCmdOrCtrl: SettingModel['sendWithCmdOrCtrl']): void;
export declare function setTheme(theme: SettingModel['theme']): void;
export declare function setChatFontSize(chatFontSize: SettingModel['chatFontSize']): void;
export declare function setFontFamily(fontFamily: SettingModel['fontFamily']): void;
export declare function setOpenAtLogin(openAtLogin: SettingModel['openAtLogin']): void;
/**
 * FEAT: 用户数据相关
 */
declare const userDataDB: import("lowdb/lib/core/Low").LowSync<import("./model").UserDataModel>;
export declare function getUserData(): import("./model").UserDataModel;
export declare function updateUserData(data: Partial<typeof userDataDB.data>): void;
export declare function setWindowSize(width: number, height: number): void;
export declare function getAssistants(): AssistantModel[];
export declare function updateAssistant(a: AssistantModel): void;
export declare function deleteAssistant(id: string): void;
export declare function createAssistant(a: CreateAssistantModel): AssistantModel;
export declare function useAssistant(id: string): void;
export declare function getHistories(): HistoryModel[];
export declare function addHistory(h: HistoryModel): void;
export declare function deleteHistory(id: string): void;
export declare function setHistoryStar(id: string, starred: boolean): void;
export declare function clearHistory(): void;
/**
 * FEAT: 首页显示的文字 Lines
 */
export declare function getLines(): import("./model").Line[];
export declare function getMemories(): MemoModel[];
export declare function initMemories(): Promise<void>;
export declare function createMemo(m: CreateMemoModel): CreateMemoModel;
export declare function useMemo(id: string): void;
export declare function updateMemo(m: MemoModel): void;
export declare function deleteMemo(id: string): void;
export declare function getCollections(): CollectionModel[];
export declare function createCollection(c: CreateCollectionModel): void;
export declare function updateCollection(c: CollectionModel): void;
export declare function deleteCollection(id: string): void;
export declare function stickTopCollection(id: string): void;
export {};
