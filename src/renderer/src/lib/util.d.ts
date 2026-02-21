import type { ModelsConfig } from '@lib/models-config';
export type Events = {
    reGenMsg: (id: string) => void;
    editUserMsg: (content: string, id: string) => void;
    updateModels: (newModels: ModelsConfig) => void;
    stopSpeak: () => void;
    globalSearch: () => void;
};
export declare const event: {
    on<T extends keyof Events>(event: T, callback: Events[T]): void;
    off<T extends keyof Events>(event: T, callback: Events[T]): void;
    emit<T extends keyof Events>(event: T, ...args: Parameters<Events[T]>): void;
};
export declare const getSystem: () => 'mac' | 'linux' | 'win';
export declare const isValidUrl: (url: string) => boolean;
export declare const getRandomString: (len: number) => string;
