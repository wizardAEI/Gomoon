export declare function getResourcesPath(filename: string): string;
export declare const quitApp: {
    shouldQuit: boolean;
    quit(): Promise<void>;
    reset(): void;
};
export declare function saveFile(fileName: string, content: string | Buffer): Promise<void>;
