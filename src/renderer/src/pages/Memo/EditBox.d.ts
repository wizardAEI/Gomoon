import { MemoModel } from 'src/main/models/model';
export default function (props: {
    memo: MemoModel;
    onCancel: () => void;
    onSave: (m: MemoModel) => void;
}): import("solid-js").JSX.Element;
