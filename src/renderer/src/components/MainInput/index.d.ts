/**
 * FEAT: Input 组件，用于接收用户输入的文本，onMountHandler可以在外部操作 input 元素
 */
export default function Input(props: {
    send: (msg: string) => void;
    onMountHandler?: (textAreaDiv: HTMLTextAreaElement) => void;
    type: 'ai' | 'human' | 'ans' | 'question';
    showClearButton?: boolean;
    disable?: boolean;
    isGenerating?: boolean;
    autoFocusWhenShow?: boolean;
    placeholder?: string;
    onClear?: () => void;
    onInput?: (e: InputEvent) => void;
}): import("solid-js").JSX.Element;
