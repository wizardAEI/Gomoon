import type { ModelsConfig, Provider, EnabledModel } from '@lib/models-config';
import { SettingFontFamily, SettingModel } from 'src/main/models/model';
declare const settingStore: {
    isLoaded: boolean;
    oldModels: ModelsConfig;
} & SettingModel, setSettingStore: import("solid-js/store").SetStoreFunction<{
    isLoaded: boolean;
    oldModels: ModelsConfig;
} & SettingModel>;
export declare function setIsOnTop(v: boolean): Promise<any>;
export declare function setQuicklyAnsKey(v: string): Promise<any>;
export declare function setQuicklyWakeUpKeys(v: string): Promise<any>;
export declare function setSendWithCmdOrCtrl(v: boolean): Promise<any>;
export declare function setTheme(theme: string): Promise<any>;
export declare function setFontFamily(fontFamily: SettingFontFamily): Promise<any>;
export declare function setOpenAtLogin(v: boolean): Promise<any>;
export declare function loadConfig(): Promise<void>;
export declare function addProvider(provider: Omit<Provider, 'id'>): void;
export declare function updateProvider(id: string, updates: Partial<Omit<Provider, 'id'>>): void;
export declare function removeProvider(id: string): void;
export declare function addEnabledModel(em: Omit<EnabledModel, 'id'>): void;
export declare function updateEnabledModel(id: string, updates: Partial<Omit<EnabledModel, 'id'>>): void;
export declare function removeEnabledModel(id: string): void;
export declare function updateModelsToFile(): Promise<void>;
export declare function setChatFontSize(v: number): Promise<any>;
export { settingStore, setSettingStore };
export interface UpdaterStore {
    updateStatus: {
        canUpdate: boolean;
        haveDownloaded: boolean;
        updateProgress: number;
        version: string;
    };
}
declare const updaterStore: UpdaterStore;
export declare function setUpdaterStatus(status: Partial<UpdaterStore['updateStatus']>): void;
export declare const updateStatusLabel: import("solid-js").Accessor<string>;
export declare function updateVersion(): Promise<boolean>;
export { updaterStore as systemStore };
