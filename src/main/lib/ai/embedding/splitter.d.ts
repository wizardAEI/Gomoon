interface Node {
    markup: string;
    title: string;
    content: string;
    total: string;
    children: Node[];
}
export declare function createTreeFromMarkdown(markdown: string, config?: {
    titleMaxLength?: number;
}): Node[];
export interface Chunk {
    indexes: {
        value: string;
    }[];
    document: {
        content: string;
    };
    from?: string;
}
export declare function getChunkFromNodes(nodes: Node[], options: {
    chunkSize?: number;
    chunkOverlap?: number;
    useLLM?: boolean;
    nodesFrom?: string;
    skipContent?: boolean;
    skipOnlyTitleContent?: boolean;
}): Promise<Chunk[]>;
export {};
