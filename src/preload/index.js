import { contextBridge, ipcRenderer } from 'electron';
import { electronAPI } from '@electron-toolkit/preload';
// Custom APIs for renderer
export const api = {
    multiCopy: (callback) => {
        ipcRenderer.on('quickly-ans', callback);
        return () => {
            ipcRenderer.removeListener('quickly-ans', callback);
        };
    },
    showWindow: (callback) => {
        ipcRenderer.on('show-window', callback);
        return () => {
            ipcRenderer.removeListener('show-window', callback);
        };
    },
    hideWindow: () => ipcRenderer.invoke('hide-window'),
    minimizeWindow: () => ipcRenderer.invoke('minimize-window'),
    maximizeWindow: () => ipcRenderer.invoke('maximize-window'),
    unmaximizeWindow: () => ipcRenderer.invoke('unmaximize-window'),
    isMaximized: () => ipcRenderer.invoke('is-maximized'),
    setIsOnTop: (isOnTop) => ipcRenderer.invoke('set-is-on-top', isOnTop),
    // 配置相关
    loadConfig: () => ipcRenderer.invoke('load-config'),
    setConfig: () => ipcRenderer.invoke('set-config'),
    setModels: (models) => ipcRenderer.invoke('set-models', models),
    fetchProviderModels: (apiKey, baseURL) => ipcRenderer.invoke('fetch-provider-models', { apiKey, baseURL }),
    setQuicklyAnsKey: (key) => ipcRenderer.invoke('set-quickly-ans-key', key),
    setQuicklyWakeUpKeys: (keys) => ipcRenderer.invoke('set-quickly-wake-up-keys', keys),
    setSendWithCmdOrCtrl: (b) => ipcRenderer.invoke('set-send-with-cmd-or-ctrl', b),
    setTheme: (theme) => ipcRenderer.invoke('set-theme', theme),
    setChatFontSize: (size) => ipcRenderer.invoke('set-chat-fontsize', size),
    setChatFontFamily: (fontFamily) => ipcRenderer.invoke('set-font-family', fontFamily),
    setOpenAtLogin: (b) => ipcRenderer.invoke('set-open-at-login', b),
    // 用户信息相关
    getUserData: () => ipcRenderer.invoke('get-user-data'),
    setUserData: (userData) => ipcRenderer.invoke('set-user-data', userData),
    // assistant 相关
    getAssistants: () => ipcRenderer.invoke('get-assistants'),
    updateAssistant: (assistant) => ipcRenderer.invoke('update-assistant', assistant),
    deleteAssistant: (assistantId) => ipcRenderer.invoke('delete-assistant', assistantId),
    createAssistant: (assistant) => ipcRenderer.invoke('create-assistant', assistant),
    useAssistant: (assistantId) => ipcRenderer.invoke('use-assistant', assistantId),
    // history 相关
    getHistories: () => ipcRenderer.invoke('get-histories'),
    addHistory: (history) => ipcRenderer.invoke('add-history', history),
    deleteHistory: (historyId) => ipcRenderer.invoke('delete-history', historyId),
    setHistoryStar: (historyId, starred) => ipcRenderer.invoke('set-history-star', historyId, starred),
    clearHistory: () => ipcRenderer.invoke('clear-history'),
    // memory 相关
    checkEmbeddingModel: () => ipcRenderer.invoke('check-embedding-model'),
    getMemories: () => ipcRenderer.invoke('get-memories'),
    editFragment: (option) => ipcRenderer.invoke('edit-fragment', option),
    saveMemory: (memo) => ipcRenderer.invoke('save-memory', memo),
    cancelSaveMemory: (id) => ipcRenderer.invoke('cancel-save-memory', id),
    useMemory: (memoId) => ipcRenderer.invoke('use-memory', memoId),
    getMemoryData: (data) => ipcRenderer.invoke('get-memory-data', data),
    deleteMemory: (memoId) => ipcRenderer.invoke('delete-memory', memoId),
    editMemory: (memoId, fragments) => ipcRenderer.invoke('edit-memory', memoId, fragments),
    initMemories: () => ipcRenderer.invoke('init-memories'),
    exportMemory: (memo) => ipcRenderer.invoke('export-memory', memo),
    importMemory: (path) => ipcRenderer.invoke('import-memory', path),
    // 集合相关
    getCollections: () => ipcRenderer.invoke('get-collections'),
    createCollection: (collection) => ipcRenderer.invoke('create-collection', collection),
    deleteCollection: (collectionId) => ipcRenderer.invoke('delete-collection', collectionId),
    stickTopCollection: (collectionId) => ipcRenderer.invoke('stick-top-collection', collectionId),
    updateCollection: (collection) => ipcRenderer.invoke('update-collection', collection),
    // 文件相关
    parseFile: (files) => ipcRenderer.invoke('parse-file', files),
    removeFile: (path, filename) => ipcRenderer.invoke('remove-file', path, filename),
    openPath: (path) => ipcRenderer.invoke('open-path', path),
    saveFile: (fileName, content) => ipcRenderer.invoke('save-file', fileName, content),
    getTokenNum: (text) => ipcRenderer.invoke('get-token-num', text),
    // 更新
    checkUpdate: () => ipcRenderer.invoke('check-update'),
    quitForUpdate: () => ipcRenderer.invoke('quit-for-update'),
    downloadUpdate: () => ipcRenderer.invoke('download-update'),
    // 大模型调用
    callLLM: (option) => ipcRenderer.invoke('call-llm', option),
    stopLLM: () => ipcRenderer.invoke('stop-llm'),
    // 其他
    getLines: () => ipcRenderer.invoke('get-lines'),
    parsePageToString: (url) => ipcRenderer.invoke('parse-page-to-string', url),
    speak: (content) => ipcRenderer.invoke('speak', content),
    receiveMsg: (callback) => {
        ipcRenderer.on('post-message', callback);
        return () => {
            ipcRenderer.removeListener('post-message', callback);
        };
    },
    receiveBuf: (callback) => {
        ipcRenderer.on('post-buf', callback);
        return () => {
            ipcRenderer.removeListener('post-buf', callback);
        };
    }
};
// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
    try {
        contextBridge.exposeInMainWorld('electron', electronAPI);
        contextBridge.exposeInMainWorld('api', api);
    }
    catch (error) {
        console.error(error);
    }
}
else {
    // @ts-ignore (define in dts)
    window.electron = electronAPI;
    // @ts-ignore (define in dts)
    window.api = api;
}
