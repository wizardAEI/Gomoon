export interface FileLoaderRes {
    content: string;
    src: string;
    filename: string;
    type: 'file' | 'image';
}
export interface FilePayload {
    path: string;
    type: string;
    data?: string;
}
export default function parseFile(files: FilePayload[]): Promise<FileLoaderRes>;
