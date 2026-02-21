import { type JSXElement } from 'solid-js';
import { PositioningOptions } from '@zag-js/popper';
export default function (props: {
    size?: number;
    color?: string;
    label: string | JSXElement;
    content: string | JSXElement;
    fill?: string;
    position?: PositioningOptions;
}): import("solid-js").JSX.Element;
