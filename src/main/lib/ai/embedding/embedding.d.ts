export declare function getEmbeddingModel(): string;
export declare function embedding(text: string): Promise<Float32Array>;
export declare function activateTokenizer(): Promise<void>;
export declare function tokenize(text: string): Promise<number[]>;
