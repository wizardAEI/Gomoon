import { readFileSync } from 'fs';
import os from 'os';
import { getResourcesPath } from '../lib';
import { defaultModels } from '../../lib/langchain';
export function getDefaultAssistants() {
    const a = readFileSync(getResourcesPath('assistants.json'), 'utf-8');
    const { assistants } = JSON.parse(a);
    return assistants;
}
export function getDefaultConfig() {
    return {
        isOnTop: false,
        models: defaultModels(),
        quicklyAnsKey: 'C',
        quicklyWakeUpKeys: os.platform() === 'darwin' ? 'Cmd+G' : 'Ctrl+G',
        sendWithCmdOrCtrl: true,
        theme: 'gomoon-theme',
        chatFontSize: 14,
        openAtLogin: false,
        fontFamily: 'default'
    };
}
export function getDefaultLines() {
    const lines = readFileSync(getResourcesPath('lines.json'), 'utf-8');
    const ls = JSON.parse(lines);
    return ls;
}
export function getDefaultUserData() {
    const a = readFileSync(getResourcesPath('assistants.json'), 'utf-8');
    const memo = readFileSync(getResourcesPath('memories.json'), 'utf-8');
    const { selectedAssistantForAns, selectedAssistantForChat } = JSON.parse(a);
    const { selectedMemo } = JSON.parse(memo);
    return {
        firstTime: true,
        selectedModel: '',
        selectedAssistantForAns,
        selectedAssistantForChat,
        selectedMemo,
        firstTimeFor: {
            modelSelect: true,
            assistantSelect: true
        },
        windowSize: {
            width: 480,
            height: 760
        }
    };
}
export function getDefaultMemories() {
    const memo = readFileSync(getResourcesPath('memories.json'), 'utf-8');
    const { memories } = JSON.parse(memo);
    return memories;
}
