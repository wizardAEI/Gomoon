export declare const init: () => Promise<void>;
export declare const recognizeText: (img: File, logger: (m: Partial<Tesseract.LoggerMessage>) => void) => Promise<string>;
export declare const terminate: () => Promise<void>;
