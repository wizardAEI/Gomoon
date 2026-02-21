import type { Accessor, Setter } from 'solid-js';
import { ContentDisplay } from '@renderer/lib/ai/parseString';
export type Artifacts = ContentDisplay & {
    val: string;
};
export default function Tools(props: {
    artifacts: Accessor<Artifacts[]>;
    setArtifacts: Setter<Artifacts[]>;
    onInput: (content: string) => void;
    type: 'chat' | 'ans';
}): import("solid-js").JSX.Element;
