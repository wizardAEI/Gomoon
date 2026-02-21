import ErrorIcon from '@renderer/assets/icon/base/Toast/ErrorIcon';
import SuccessIcon from '@renderer/assets/icon/base/Toast/SuccessIcon';
import WarningIcon from '@renderer/assets/icon/base/Toast/WarningIcon';
import { For, Show, createContext, createSignal, useContext } from 'solid-js';
import { Portal } from 'solid-js/web';
import Button from './Button';
const UIContext = createContext();
const Icon = {
    get success() {
        return <SuccessIcon width={20} height={20} class="text-success"/>;
    },
    get warning() {
        return <WarningIcon width={20} height={20} class="text-warning"/>;
    },
    get error() {
        return <ErrorIcon width={20} height={20} class="text-error"/>;
    }
};
export function ToastsContainer() {
    return (<Portal>
      <For each={useContext(UIContext).toasts()}>
        {(toast) => (<>
            <Show when={toast.mask}>
              <div class="fixed inset-0 z-40 h-full w-full bg-dark-pro bg-opacity-60"/>
            </Show>
            <div class={'fixed left-1/2 z-50 -translate-x-1/2 select-none text-text1 ' + toast.position}>
              <div class={`flex animate-popup flex-col gap-2 rounded-lg bg-dark-con shadow-center ${{ small: 'p-2', normal: 'p-5' }[toast.size || 'normal']}`}>
                <div class={`flex items-center gap-1`}>
                  <Show when={Icon[toast.type]}>
                    <div class="flex">{Icon[toast.type]}</div>
                  </Show>
                  {typeof toast.text === 'string' ? (<div class={toast.type === 'confirm' ? `px-4 pt-4` : ''}>{toast.text}</div>) : (<div>{toast.text}</div>)}
                </div>
                <Show when={toast.type === 'confirm'}>
                  <div class="mt-2 flex w-full justify-around">
                    <Button onClick={() => {
                toast.callback(false);
            }}>
                      取消
                    </Button>
                    <Button onClick={() => {
                toast.callback(true);
            }}>
                      确定
                    </Button>
                  </div>
                </Show>
              </div>
            </div>
          </>)}
      </For>
    </Portal>);
}
export function ToastProvider(props) {
    const [showToast, setShowToast] = createSignal([]);
    return (<UIContext.Provider value={{
            toasts: showToast,
            setToasts: setShowToast
        }}>
      {props.children}
      <ToastsContainer />
    </UIContext.Provider>);
}
export function useToast() {
    const { setToasts: setShowToast } = useContext(UIContext);
    function show(text, type, duration, position, mask = false, size = 'small') {
        const id = Date.now();
        setShowToast((t) => [...t, { id, text, type, position, mask, size }]);
        setTimeout(() => {
            setShowToast((ts) => ts.filter((t) => t.id !== id));
        }, duration);
    }
    async function showConfirm(text, position, mask = false) {
        const id = Date.now();
        return new Promise((resolve) => {
            setShowToast((t) => [
                ...t,
                {
                    id,
                    text,
                    type: 'confirm',
                    position,
                    callback: (res) => {
                        setShowToast((ts) => ts.filter((t) => t.id !== id));
                        resolve(res);
                    },
                    mask,
                    size: 'normal'
                }
            ]);
        });
    }
    async function showModal(model, position, mask = true) {
        const id = Date.now();
        return new Promise((res) => {
            setShowToast((t) => [
                ...t,
                {
                    id,
                    text: model({
                        close: (data) => {
                            setShowToast((ts) => ts.filter((t) => t.id !== id));
                            res(data);
                        }
                    }),
                    type: 'modal',
                    position,
                    mask,
                    size: 'normal'
                }
            ]);
        });
    }
    return {
        success: (text, option = {}) => show(text, 'success', option.duration || 1500, option.position || 'top-1/3', option.mask, option.size),
        warning: (text, option = {}) => show(text, 'warning', option.duration || 1500, option.position || 'top-1/3', option.mask, option.size),
        error: (text, option = {}) => show(text, 'error', option.duration || 1500, option.position || 'top-1/3', option.mask, option.size),
        info: (text, option = {}) => show(text, 'info', option.duration || 1500, option.position || 'top-1/3', option.mask, option.size),
        clear: () => setShowToast([]),
        confirm: (text, option = {}) => showConfirm(text, option.position || 'top-1/3', option.mask),
        modal: (model, option = {}) => showModal(model, option.position || 'top-1/3', option.mask)
    };
}
