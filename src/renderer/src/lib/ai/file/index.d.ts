import { FileLoaderRes } from 'src/main/lib/ai/fileLoader';
export declare function parseFile(file: File): Promise<{
    suc: boolean;
    length: number;
} & FileLoaderRes>;
