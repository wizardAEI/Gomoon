declare const answerStore: {
    id: string;
    answer: string;
    question: string;
}, setAnswerStore: import("solid-js/store").SetStoreFunction<{
    id: string;
    answer: string;
    question: string;
}>;
declare const ansStatus: {
    isGenerating: boolean;
};
export declare function setGeneratingStatus(status: boolean): void;
export declare function genAns(q: string): Promise<void>;
export declare function stopGenAns(): Promise<void>;
export declare function reGenAns(): void;
export declare function clearAns(): void;
export declare function restoreAns(): void;
export { answerStore, setAnswerStore, ansStatus };
