import type { JSXElement } from 'solid-js';
export declare function getModelOptions(): {
    label: JSXElement;
    value: string;
    maxToken: number;
}[];
export default function ModelSelect(props: {
    position: string;
    size?: number;
    translate?: string;
}): import("solid-js").JSX.Element;
