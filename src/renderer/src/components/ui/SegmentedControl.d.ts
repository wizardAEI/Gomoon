import { JSXElement } from 'solid-js';
export declare function SegmentedControl(props: {
    options: {
        label: string | JSXElement;
        value: string;
    }[];
    defaultValue: string;
    onCheckedChange: (checked: string) => void;
}): import("solid-js").JSX.Element;
