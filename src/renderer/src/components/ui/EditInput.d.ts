export default function EditInput(props?: {
    label?: string;
    value?: string;
    spellcheck?: boolean;
    onSave: (value: string) => void;
    optional?: boolean;
    type?: 'text' | 'number';
}): import("solid-js").JSX.Element;
