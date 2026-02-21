import { type JSXElement } from 'solid-js';
export default function Switch(props: {
    label: string | JSXElement;
    hint?: string;
    size?: 'sm' | 'md';
    checked: boolean;
    onCheckedChange: (checked: boolean) => void;
}): import("solid-js").JSX.Element;
