import { type JSX, type JSXElement } from 'solid-js';
export interface ToastType {
    id: number;
    text: string | JSXElement;
    type: string;
    position: string;
    mask: boolean;
    size: 'small' | 'normal';
    callback?: (res: boolean | PromiseLike<boolean>) => unknown;
}
interface ToastOption {
    duration?: number;
    position?: string;
    mask?: boolean;
    size?: 'small' | 'normal';
}
export declare function ToastsContainer(): JSX.Element;
export declare function ToastProvider(props: {
    children: JSX.Element;
}): JSX.Element;
export declare function useToast(): {
    success: (text: string, option?: ToastOption) => void;
    warning: (text: string, option?: ToastOption) => void;
    error: (text: string, option?: ToastOption) => void;
    info: (text: string, option?: ToastOption) => void;
    clear: () => never[];
    confirm: (text: string | JSXElement, option?: ToastOption) => Promise<boolean>;
    modal: (model: (option: {
        close: (data: unknown) => void;
    }) => JSXElement, option?: ToastOption) => Promise<unknown>;
};
export {};
