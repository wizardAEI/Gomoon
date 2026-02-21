import { AssistantModel } from 'src/main/models/model';
export default function EditBox(props: {
    assistant: AssistantModel;
    onCancel: () => void;
    onSave: (a: AssistantModel) => void;
}): import("solid-js").JSX.Element;
