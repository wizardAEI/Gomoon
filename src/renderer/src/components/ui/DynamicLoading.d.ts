import type { JSX } from 'solid-js';
export declare function LoadingProvider(props: {
    children: JSX.Element;
}): JSX.Element;
export declare function useLoading(): {
    show: (msg: string) => void;
    hide: () => void;
};
