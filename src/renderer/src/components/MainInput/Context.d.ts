export type ContextAction = 'copy' | 'paste' | 'select-all' | 'cut' | 'clear' | 'new-chat' | 'switch';
export default function ContextContainer(props: {
    onClick: (action: ContextAction) => void;
    type: 'ai' | 'human' | 'ans' | 'question';
    generating: boolean;
    selected: boolean;
}): import("solid-js").JSX.Element;
