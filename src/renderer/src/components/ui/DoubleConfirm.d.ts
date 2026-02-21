import { JSX } from 'solid-js';
export default function (props: {
    label: string;
    children: JSX.Element;
    position?: string;
    onConfirm: () => void;
    onCancel?: () => void;
    preConfirm?: () => boolean;
    popup?: boolean;
}): JSX.Element;
