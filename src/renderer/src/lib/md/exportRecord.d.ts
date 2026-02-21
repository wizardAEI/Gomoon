export default function (type: 'chat' | 'ans', format: 'md' | 'png'): Promise<{
    suc: boolean;
    result: string;
}>;
